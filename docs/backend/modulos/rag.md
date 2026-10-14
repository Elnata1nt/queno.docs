---
sidebar_position: 1
---

# RAG (núcleo do produto)

Local: `src/modules/rag`

Implementa o pipeline de **Retrieval-Augmented Generation**: ingestão de documentos, indexação vetorial e chat com citações sobre o conteúdo indexado.

## Pipeline de ingestão

1. **Upload** (`upload-document.use-case.ts`) — recebe o arquivo e cria o `Document`.
2. **Extração** — via `composite-extraction.adapter.ts`, que escolhe entre:
   - `ocr-local.adapter.ts` — OCR local;
   - `ocr-aws.adapter.ts` — OCR via AWS Textract;
   - `visual-extraction.adapter.ts` — extração assistida por visão (`vision.adapter.ts`, usa o LLM para "ler" páginas complexas).
3. **Chunking** (`domain/services/chunker.ts`) — divide o texto extraído em pedaços indexáveis.
4. **Embeddings** (`ollama-embedding.adapter.ts`) — gera o vetor de cada chunk via Ollama e persiste em `DocumentChunk`.
5. Todo esse processamento roda assincronamente via `document-processing.processor.ts`, consumido pelo **worker** BullMQ (ver [Infraestrutura](../infraestrutura.md)).

## Pipeline de pergunta/resposta

1. **Retriever** (`retriever.adapter.ts`) — busca os chunks mais relevantes para a pergunta.
2. **Reranker** (`reranker.adapter.ts`) — reordena os candidatos por relevância.
3. **Prompt** (`prompt.builder.ts`, `domain/services/rag-prompt.service.ts`) — monta o prompt com o contexto recuperado.
4. **Generator** (`generator.adapter.ts`) — chama o Groq para gerar a resposta.
5. **Citações** (`citation-cleaner.util.ts`) — limpa/normaliza as citações na resposta final.
6. A resposta e a pergunta são persistidas em `ChatSession` / `Message`.

Casos de uso expostos: `ask-document.use-case.ts` (síncrono) e `ask-document-stream.use-case.ts` (streaming, usado pelo chat em tempo real), além das variantes `ask-organization(-stream)` para perguntas que cruzam todos os documentos de uma organização.

## Rotas

### Documentos (`/organizations/:organizationId/documents`)

| Rota | Descrição |
|---|---|
| `POST .../upload` | Upload de um novo documento (dispara o pipeline de ingestão). |
| `POST .../` | Cria documento "interno" (sem upload de arquivo). |
| `GET .../` | Lista documentos da organização. |
| `GET .../:documentId` | Detalhe de um documento. |
| `PATCH .../:documentId` | Atualiza um documento. |
| `DELETE .../:documentId` | Remove um documento (e seus chunks/índices). |
| `GET .../:documentId/versions` | Lista versões do documento. |
| `POST .../:documentId/versions/:versionId/restore` | Restaura uma versão anterior. |
| `GET .../:documentId/download` | Download do arquivo original. |
| `GET .../:documentId/view` | Visualização do conteúdo. |
| `POST .../:documentId/chat` | Pergunta sobre o documento (resposta completa). |
| `POST .../:documentId/chat-stream` | Mesma pergunta, via streaming (SSE). |
| `POST .../:documentId/reindex` | Força reprocessamento/reindexação. |
| `POST .../completion` | Completar texto usando o contexto do RAG. |

### Chat em nível de organização (`/organizations/:organizationId/chat-stream`)

| Rota | Descrição |
|---|---|
| `POST .../chat-stream` | Pergunta cruzando todos os documentos da organização. |
| `POST .../chat-stream/suggestions` | Sugestões de perguntas. |

### Sessões (`/sessions`)

| Rota | Descrição |
|---|---|
| `GET /sessions` | Lista sessões de chat do usuário. |
| `GET /sessions/notifications` | Notificações relacionadas a sessões. |
| `GET /sessions/:sessionId` | Detalhe/mensagens de uma sessão. |
| `PATCH /sessions/:sessionId/messages/:messageId/feedback` | Feedback (👍/👎) em uma resposta. |
| `DELETE /sessions` | Limpa histórico de sessões. |
| `PATCH /sessions/:sessionId/title` | Renomeia a sessão. |

## Script de reindexação

O script `src/scripts/reindex.ts` (rodado via `npm run reindex`) permite reprocessar documentos já existentes — útil após mudar o modelo de embedding ou a estratégia de chunking.
