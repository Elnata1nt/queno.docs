---
sidebar_position: 5
---

# Fluxos de execução

Fluxos reais do backend `consult.ia`, extraídos dos use cases (não apenas dos controllers). Nomes entre parênteses são o arquivo/classe que implementa cada passo.

## 1. Registro, verificação por OTP e login

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend
    participant C as AuthController
    participant UC as RegisterUseCase
    participant R as AuthRepository
    participant E as EmailProvider (Resend)

    U->>F: preenche cadastro
    F->>C: POST /auth/register
    C->>UC: execute()
    UC->>UC: valida hasAcceptedTerms
    UC->>R: findByEmail
    alt já existe
        R-->>UC: User
        UC-->>C: ConflictError (já existe)
    else novo usuário
        UC->>UC: hash da senha + gera OTP (6 dígitos, expira em 10min)
        UC->>R: create(user status=PENDING, ConsentLog GRANTED)
        UC->>E: sendOtpEmail
        UC-->>C: ok
    end
    C-->>F: 201 / erro

    U->>F: digita OTP
    F->>C: POST /auth/verify-otp
    C->>C: isOtpValid? (valor + expiração)
    alt válido
        C->>R: verifyEmail + update
        C-->>F: conta ativada
    else inválido/expirado
        C-->>F: 400 BadRequest
    end

    U->>F: login (email+senha)
    F->>C: POST /auth/login
    C->>R: findByEmail
    C->>C: isActive? + compareHash(senha)
    alt credenciais inválidas (ou não existe)
        C-->>F: 401 "Email ou senha inválidos" (mensagem genérica, anti-enumeração)
    else ok
        C->>C: gera JWT (sub, email)
        C-->>F: 200 + cookie httpOnly com access_token
    end
```

**Reenvio de OTP**: exige que a conta ainda esteja `PENDING` (senão `BadRequestError` "já verificada"); gera novo OTP/expiração e reenvia por e-mail.

**Esqueci/resetar senha**: `forgot-password` sempre responde com a mesma mensagem genérica, exista ou não o e-mail (anti-enumeração); se existir, gera um token UUID válido por 2h e envia por e-mail (falha de envio aqui é só logada, nunca propagada ao usuário). `reset-password` valida o token (`isResetTokenValid`) antes de trocar a senha.

## 2. Convite/gestão de membro de organização

Todos os use cases de membro exigem que quem executa a ação tenha `Membership` com papel `OWNER` ou `ADMIN` na organização (senão `UnauthorizedError`).

```mermaid
sequenceDiagram
    actor A as Admin/Owner
    participant C as OrganizationMemberController
    participant AddUC as AddMemberUseCase
    participant UpdUC as UpdateMemberRoleUseCase
    participant RemUC as RemoveMemberUseCase
    participant Repo as MembershipRepository

    A->>C: POST /organizations/:id/members {email}
    C->>AddUC: execute()
    AddUC->>Repo: findByUserAndOrganization(executor)
    AddUC->>AddUC: checa role do executor (OWNER/ADMIN)
    AddUC->>Repo: resolve e-mail -> userId (404 se não achar)
    AddUC->>Repo: já é membro? (409 Conflict se sim)
    AddUC->>Repo: cria Membership
    AddUC-->>C: ok

    A->>C: PATCH /members/:memberId {role}
    C->>UpdUC: execute()
    UpdUC->>UpdUC: ADMIN não pode promover a OWNER nem alterar um OWNER
    UpdUC->>Repo: countOwners(orgId)
    alt alvo é OWNER e novo papel != OWNER
        UpdUC->>UpdUC: bloqueia se countOwners <= 1
    end
    UpdUC->>Repo: update role
    UpdUC-->>C: ok

    A->>C: DELETE /members/:memberId
    C->>RemUC: execute()
    RemUC->>RemUC: ADMIN não pode remover OWNER
    RemUC->>Repo: countOwners(orgId)
    RemUC->>RemUC: bloqueia se for o único OWNER restante
    RemUC->>Repo: delete Membership
    RemUC-->>C: ok
```

**Regra central:** uma organização nunca pode ficar sem nenhum `OWNER` — tanto `UpdateMemberRole` quanto `RemoveMember` checam `countOwners(organizationId) <= 1` antes de permitir a operação.

## 3. Upload → extração → chunking → embedding → indexação

```mermaid
sequenceDiagram
    participant F as Frontend
    participant C as RagController
    participant Up as UploadDocumentUseCase
    participant FS as FileStorageService
    participant Repo as DocumentRepository
    participant Q as Fila document-processing (BullMQ)
    participant W as DocumentProcessingProcessor (worker)
    participant Proc as ProcessDocumentUseCase
    participant Ex as ExtractionService
    participant Ch as Chunker
    participant Emb as EmbeddingService (Ollama)

    F->>C: POST /documents/upload (multipart)
    C->>Up: execute()
    Up->>Repo: countByOrganization
    alt >= 50 documentos
        Up-->>C: 400 BadRequest (limite por organização)
    else ok
        Up->>FS: save(file) em orgs/{orgId}/docs
        Up->>Repo: cria Document (status=PENDING, version=1, isLatest=true)
        Up->>Q: enqueue job process-document<br/>{documentId, organizationId, userId}<br/>attempts=3, backoff exponencial 5s
        Up-->>C: 201 Document criado
    end

    Q->>W: consome job
    W->>Proc: execute(documentId)
    Proc->>Repo: status = INDEXING
    alt Document.content vazio
        Proc->>Ex: extractText(filepath, mimeType)
        Ex-->>Proc: texto extraído (ou vazio)
    end
    alt extração falhou/vazia
        Proc->>Repo: status = FAILED
    else texto disponível
        Proc->>Ch: chunk(content, parent=1500, child=400, overlap=100)
        Ch-->>Proc: chunks pai+filho
        Proc->>Emb: embedBatch(textos dos filhos)
        Emb-->>Proc: vetores
        Proc->>Repo: deleteChunks(documentId) + saveChunks(...)
        Proc->>Repo: status = COMPLETED
    end
```

Se o job falhar com exceção, o BullMQ reaplica o retry (até 3 tentativas); o use case nunca relança erro no final — qualquer falha é capturada e vira `status: FAILED` no próprio documento. **Reindexação manual** (`POST .../reindex`) apenas marca `status: PENDING` e reenfileira o mesmo job, reaproveitando 100% deste pipeline.

## 4. Pergunta ao RAG via streaming (SSE)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend
    participant C as RagController
    participant UC as AskDocumentStreamUseCase
    participant Sess as ChatSessionRepository
    participant Ret as RetrieverService
    participant Gen as GeneratorService (Groq)
    participant Msg as MessageRepository

    U->>F: pergunta sobre o documento
    F->>C: POST .../documentId/chat-stream (SSE)
    C->>UC: execute()
    UC->>UC: valida documento existe e pertence à organização
    UC->>Sess: recupera ou cria ChatSession
    UC->>Ret: retrieveByDocument(question, topK=5, threshold=0.45)
    alt sem chunks nem histórico
        UC-->>F: evento done (resposta fixa "não encontrei informações", sem chamar LLM)
    else há contexto
        UC->>Gen: generateStream(chunks, question, histórico)
        loop por token gerado
            Gen-->>F: evento token (SSE)
        end
        Gen-->>UC: evento done (resposta completa + sources)
        UC-->>F: evento done (repassado)
        par em background (não bloqueia a resposta)
            UC->>Msg: salva Message (user)
            UC->>Msg: salva Message (assistant, metadata.sources)
        end
    end
```

**Chat em nível de organização** (`ask-organization-stream`) é o mesmo fluxo, mas com `ChatSession.documentId = null`, buscando em todos os documentos da organização (`RetrieverService.retrieve`, com filtro opcional por um documento específico) e montando um `docListContext` extra (lista de nomes de documentos) para o prompt. Qualquer exceção durante o streaming vira um evento `error` no SSE — a conexão nunca cai sem avisar o cliente.

## 5. Editor AI

Cada ação decide, de forma diferente, se e como usa o RAG organizacional:

```mermaid
sequenceDiagram
    participant F as Frontend (Tiptap)
    participant C as EditorAiController
    participant Auto as AutocompleteUseCase
    participant Ref as RefineTextUseCase
    participant Gen2 as GenerateTextUseCase
    participant Ana as AnalyzeTextUseCase
    participant Ret as RetrieverService
    participant Gen as GeneratorService

    F->>C: POST .../autocomplete
    C->>Auto: execute()
    Auto->>Ret: retrieve(topK=4, threshold=0.25) — falha é engolida, retorna []
    Auto->>Gen: complete(prompt restrito: 10-35 palavras, sem repetir texto)
    Gen-->>F: sugestão (ou string vazia em erro)

    F->>C: POST .../editor-ai {action: refine}
    C->>Ref: execute()
    note right of Ref: NÃO usa RAG — deliberado,<br/>evita alucinação em refino gramatical
    Ref->>Gen: complete(prompt da ação)
    Gen-->>F: texto refinado

    F->>C: POST .../editor-ai {action: generate}
    C->>Gen2: execute()
    Gen2->>Ret: retrieve(topK=4, threshold=0.3)
    Gen2->>Gen: complete(..., organizationalKnowledge)
    Gen-->>F: texto gerado

    F->>C: POST .../editor-ai {action: analyze}
    C->>Ana: execute()
    Ana->>Ret: retrieve(topK=6)
    Ana->>Ana: resolve documentId dos chunks -> originalName
    Ana->>Gen: complete(...)
    Gen-->>F: {completion, sources}
```

`analyze` é o único dos quatro que expõe `sources` (nome do documento de origem) explicitamente na resposta.

## 6. Exportar / excluir dados pessoais (LGPD)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant C as PrivacyController
    participant Exp as ExportUserDataUseCase
    participant Del as DeleteUserDataUseCase
    participant DB as Postgres (Prisma)

    U->>C: GET /privacy/export
    C->>Exp: execute()
    Exp->>DB: findUnique(User) include memberships.organization,<br/>privacyLogs, auditLogs, messages, documents, createdOrgs
    Exp->>Exp: remove campos sensíveis (password, emailOtp)
    Exp-->>U: JSON com todos os dados pessoais

    U->>C: DELETE /privacy/my-data
    C->>Del: execute()
    Del->>DB: $transaction
    DB->>DB: cria AuditLog (USER_SELF_DELETION_REQUEST)
    DB->>DB: prisma.user.delete
    DB-->>Del: ok (cascade apaga Membership/Document/Message associados)
    Del-->>U: confirmação
```

Fora do escopo direto da rota, mas no mesmo módulo: `purgeOldSessions` (remove `ChatSession` antigas) e `clearExpiredOtps` (limpa OTP expirado de contas não verificadas) — usados por uma rotina de limpeza periódica (`purge-old-logs.use-case.ts`).

## 7. Reindexação em lote

```mermaid
sequenceDiagram
    participant Op as Operador (script/admin)
    participant S as scripts/reindex.ts
    participant UC as ReindexAllUseCase
    participant Repo as DocumentRepository
    participant Proc as ProcessDocumentUseCase

    Op->>S: npm run reindex
    S->>S: NestFactory.createApplicationContext (sem HTTP)
    S->>UC: reindexAll()
    UC->>Repo: listLatestByOrganization() ou listAllLatest()
    loop para cada documento (Promise.allSettled, sem limite de concorrência)
        UC->>Proc: execute(documentId)
        Note right of Proc: reaproveita 100% do pipeline<br/>de chunking/embedding do upload
    end
    UC-->>Op: {success: true, total} — falhas parciais não abortam o lote
```

:::caution Ponto de atenção observado durante a pesquisa
`reindexAll` dispara todos os documentos em paralelo via `Promise.allSettled` **sem limite de concorrência** — em uma base grande, isso pode sobrecarregar o Ollama (embeddings) e estourar rate limit do Groq (se algum passo usar LLM). Vale considerar um limite de concorrência (ex.: `p-limit`) se a base de documentos crescer.
:::
