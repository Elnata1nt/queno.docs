---
sidebar_position: 3
---

# Regras de negócio, validação e autorização

Esta página consolida, módulo a módulo, o que o código realmente valida e autoriza — extraído dos DTOs (`class-validator`), guards e `throw` explícitos nos use cases. Para as rotas em si, veja [Backend › Módulos](./modulos/auth.md).

## Convenções globais (valem para todos os módulos)

- Erros de domínio (`BadRequestError`, `ConflictError`, `UnauthorizedError`, `NotFoundError`, `InternalError`, definidos em `common/domain/errors/domain-error.ts`) são capturados por um filtro global (`common/filters/http-exception.filter.ts`) e convertidos numa resposta HTTP consistente: `{statusCode, timestamp, path, method, message, errorCode}`.
- Esse mesmo filtro traduz erros do Prisma: `P2002` (violação de unicidade) → 400 "duplicidade"; `P2025` (registro não encontrado) → 404.
- **Rate limit global**: `ThrottlerGuard` registrado como `APP_GUARD` — 150 requisições / 60s, para toda a API (não por rota).
- **Autenticação**: `JwtAuthGuard` lê o JWT do cookie `access_token` (com fallback para header `Authorization`). A estratégia JWT rejeita o token se o usuário do `sub` não existir mais no banco (conta deletada com token ainda válido não passa).
- **Autorização por organização**: `RoleGuard` + decorator `@OrgRole(...)` — lê `params.organizationId`, verifica se o usuário é membro; sem membership → 403; com `@OrgRole` e papel fora da lista exigida → 403. **Rota sem `@OrgRole` = qualquer membro (qualquer papel) pode acessar**, desde que pertença à organização.
- **Autorização de plataforma**: `AdminGuard` — libera só se o e-mail do usuário estiver na env `ADMIN_EMAILS` (lista separada por vírgula), independente de qualquer papel de organização.

## Auth

### Validação de entrada
- `LoginDto`: `email` obrigatório e válido; `password` obrigatório.
- `ForgotPasswordDto` / `ResendOtpDto`: `email` obrigatório e válido.
- `VerifyOtpDto`: `email` obrigatório e válido; `otp` deve ter exatamente 6 caracteres.
- `ResetPasswordDto`: `token` deve ser UUID; `password` mínimo 6 caracteres.
- `CreateUserDto` (registro): `name`, `email`, `password` obrigatórios; `hasAcceptedTerms` boolean; `policyVersion` (default `"v1.0"`); `roles?` opcional.

### Autorização
- Públicas (sem guard): `register`, `verify-otp`, `resend-otp`, `login`, `forgot-password`, `reset-password`.
- Exigem `JwtAuthGuard`: `GET /auth/me`, `POST /auth/logout`.

### Regras de negócio
- Registro exige `hasAcceptedTerms = true`; e-mail duplicado → `ConflictError`; OTP de 6 dígitos válido por **10 minutos**.
- Login: usuário inexistente ou senha errada → **mesma mensagem genérica** "Email ou senha inválidos" (evita enumeração de e-mail cadastrado); conta ainda `PENDING` → bloqueada, pedindo verificação por e-mail.
- Reenvio de OTP só permitido se a conta ainda estiver `PENDING`.
- Reset de senha: token inválido ou expirado → erro.

## Users

### Validação de entrada
- `UpdateUserDto`: todos os campos opcionais — `name`, `email` (válido), `password` (mín. 6), `avatarUrl`.

### Autorização
- `GET /all-users`: `JwtAuthGuard` + `AdminGuard`.
- `GET /check-email`: **rota pública**, sem guard (checagem de disponibilidade antes do cadastro).
- Demais rotas (`dashboard`, `PATCH /me`, `PATCH/DELETE /users/:id`, avatar, `search`): só exigem `JwtAuthGuard`.

:::caution Observação de segurança
`PATCH/DELETE /users/:id` e a atualização de outro usuário não têm, pelos controllers lidos, checagem explícita de que `:id` é o próprio usuário autenticado nem exigência de papel de admin — qualquer usuário autenticado pode, à primeira vista, editar/remover outro usuário pelo id. Vale confirmar se há uma checagem equivalente em outro ponto (ex.: um guard não identificado nesta pesquisa) antes de tratar isso como intencional.
:::

### Regras de negócio
- Usuário alvo inexistente → `NotFoundError`.
- `avatarUrl` em formato inválido → `BadRequestError`.

## Organization

### Validação de entrada
- `CreateOrganizationDto`: `name` obrigatório; `description?` opcional.
- `UpdateOrganizationDto`: mesmos campos, todos opcionais, + `aiTokenQuota?`.
- `AddMemberDto`: `email` obrigatório e válido; `role?` opcional (deve ser um `OrganizationRole` válido).

### Autorização
- Rotas de organização (`/organizations`): só `JwtAuthGuard` — a checagem de papel (`OWNER` para atualizar/remover) é feita **dentro do use case**, não via `@OrgRole` no controller.
- Rotas de membros: `JwtAuthGuard` + `RoleGuard`; `addMember`/`updateMemberRole`/`removeMember` exigem `@OrgRole(OWNER, ADMIN)`.

### Regras de negócio
- **Criar organização**: limite de **2 organizações por usuário** no plano Free (`PLAN_LIMITS.FREE.MAX_ORGANIZATIONS_PER_USER`), senão erro `MAX_ORGS_REACHED`; nome duplicado → erro `ORG_ALREADY_EXISTS`; `slug` gerado do nome, com sufixo aleatório em caso de colisão.
- **Atualizar/remover organização**: só `OWNER` (checagem no use case).
- **Adicionar membro**: só `OWNER`/`ADMIN`; e-mail precisa existir como usuário; já é membro → `ConflictError`.
- **Remover membro**: só `OWNER`/`ADMIN`; `ADMIN` não pode remover um `OWNER`; **não é possível remover o último `OWNER`** da organização.
- **Alterar papel de membro**: `ADMIN` não pode promover ninguém a `OWNER` nem alterar um `OWNER` existente; **não é possível rebaixar o último `OWNER`** (organização deve sempre ter ≥1 `OWNER`).
- **Quota de IA**: se `user.aiTokenUsed >= user.aiTokenQuota` → bloqueado antes de qualquer chamada de IA ("Quota de IA individual excedida").

## RAG

### Validação de entrada
- `AskQuestionDto`: `question` obrigatória; `topK?` inteiro entre 1 e 20; `sessionId?`/`documentId?` opcionais.
- `CreateInternalDocumentDto`: `title` obrigatório; `content?` opcional.
- `UpdateInternalDocumentDto`: `content` obrigatório; `title?` opcional.
- `IndexDocumentDto`: `content` e `documentId` obrigatórios; `metadata?` opcional.
- `CompletionDto`: `action` obrigatória; `title?`/`customPrompt?`/`context?` opcionais.
- Upload de arquivo: sem DTO de class-validator — validado manualmente no use case.

### Autorização
- Exigem `@OrgRole(OWNER, ADMIN)`: `upload`, `reindex`, `delete`.
- Exigem `@OrgRole(OWNER, ADMIN, MEMBER)` (qualquer membro): criar/editar documento interno, listar/restaurar versões, `completion`.
- Sem `@OrgRole` (qualquer membro da org): listar/ver documento, download, view, `chat`, `chat-stream`.
- `/sessions/*`: só `JwtAuthGuard` — pertencer à sessão é validado dentro do use case, não por guard de organização.

### Regras de negócio
- `AskQuestionDto.documentId`/`sessionId` são validados como UUID (`@IsUUID()`). Até 2026-10-13, `documentId` era só `@IsString()` e entrava sem escapar em SQL raw no `RetrieverAdapter` — uma SQL injection real via `POST /organizations/:organizationId/chat-stream`. Corrigida reescrevendo as queries do retriever para usar `$queryRaw` com parâmetros vinculados (Prisma `Prisma.sql`) em vez de `$queryRawUnsafe` com interpolação de string.
- Upload sem arquivo → erro; **limite de 50 documentos por organização**.
  :::caution Inconsistência encontrada
  Existe uma constante `PLAN_LIMITS.FREE.MAX_DOCUMENTS_PER_ORGANIZATION = 5` em `common/constants/plan-limits.ts`, mas o código de upload usa o número **50 hardcoded** em vez dessa constante — vale decidir qual é o limite real pretendido e alinhar os dois.
  :::
- Editar documento interno: só documentos com `source = INTERNAL` são editáveis manualmente (um `UPLOAD` não pode); cada edição cria uma nova versão.
- Perguntar: documento inexistente → erro; documento de outra organização → não autorizado; `sessionId` de outro documento → erro.
- Extração: mimetype não suportado pelo adapter composto → erro tratado como requisição inválida.
- Processamento assíncrono: se não extrai conteúdo ou não gera chunk nenhum → falha o job (permite retry do BullMQ).

## Editor AI

### Validação de entrada
- `EditorActionDto`/`CompletionDto`: `action` obrigatória, não-vazia; `title?`, `customPrompt?`, `context?` opcionais.

### Autorização
- `editor-ai` e `autocomplete`: `JwtAuthGuard` + `RoleGuard` + `@OrgRole(OWNER, ADMIN, MEMBER)` (qualquer membro).

### Regras de negócio
- `action` deve ser um valor de um conjunto fechado (`continue`, `develop`, `simplify`, `grammar`, `review_source`, `review_full`, `summarize`, `formal`, `custom`) — validado na camada de domínio (não no DTO); valor desconhecido lança erro.
- `action = 'custom'` exige `customPrompt` preenchido.

## Admin

### Validação de entrada
- Sem DTOs — rotas são todas leitura (`GET`), parâmetros via query string.

### Autorização
- Todas as rotas: `JwtAuthGuard` + `AdminGuard` (e-mail precisa estar em `ADMIN_EMAILS`) — não depende de papel de organização.

### Regras de negócio
- Nenhuma regra de negócio além da autorização — use cases são consultas diretas aos repositórios.

## Privacy

### Validação de entrada
- Sem DTOs próprios — rotas operam sobre o usuário autenticado (`req.user`).

### Autorização
- Todas as rotas: apenas `JwtAuthGuard` — qualquer usuário autenticado só opera sobre os próprios dados (não existe "admin de privacidade").

### Regras de negócio
- Usuário inexistente em qualquer operação → erro.
- `revoke` (revogar consentimento) também **inativa a conta** (`status = 'INACTIVE'`), além de registrar o log.
- `delete my-data` apaga todos os dados do usuário; falha na exclusão vira erro genérico pedindo contato com o suporte.
- **Purga automática** (rotina agendada, não exposta via HTTP): `AuditLog` > **90 dias**, `ConsentLog` > **5 anos**, OTPs expirados > **24h**, `ChatSession` inativas > **10 dias** são removidos.
