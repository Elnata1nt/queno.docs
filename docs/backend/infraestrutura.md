---
sidebar_position: 2
---

# Infraestrutura

## Serviços (`docker-compose.yml`)

| Serviço | Papel |
|---|---|
| `postgres` | Banco de dados principal (via Prisma). |
| `redis` | Backend das filas BullMQ. |
| `ollama` | Servidor local de modelos (usado para embeddings, `bge-m3`). |
| `reranker` | Cross-encoder dedicado (`bge-reranker-v2-m3`) servido via `llama.cpp`, usado no reranking do retrieval (ver [Modelo de IA](../arquitetura/modelo-ia.md)). |
| `api` | A própria aplicação NestJS (build via `Dockerfile`). |

## Filas (BullMQ)

O processamento pesado de documentos roda fora do request HTTP, em uma fila consumida por `document-processing.processor.ts` (módulo `rag`). O mesmo código-fonte roda como API (`start:prod`) ou como worker dedicado (`start:worker:prod`, controlado pela env `IS_WORKER`), permitindo escalar os dois papéis de forma independente.

## Variáveis de ambiente (`.env`)

| Variável | Finalidade |
|---|---|
| `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Conexão com PostgreSQL. |
| `REDIS_HOST`, `REDIS_PORT` | Conexão com Redis/BullMQ. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Autenticação (assinatura/expiração de tokens). |
| `COOKIE_DOMAIN` | Domínio do cookie de sessão. |
| `GROQ_API_KEY` | Geração de texto (LLM) via Groq. |
| `OLLAMA_BASE_URL` | Endpoint do Ollama (embeddings). |
| `RERANKER_BASE_URL` | Endpoint do cross-encoder dedicado (`llama.cpp`, reranking). |
| `AWS_REGION` | Região usada pelo adapter de OCR via AWS Textract. |
| `RESEND_API_KEY` | Envio de e-mails transacionais (ex.: OTP, recuperação de senha). |
| `FRONTEND_URL`, `BACKEND_URL` | URLs usadas para CORS/links em e-mails. |
| `PORT` | Porta HTTP da API. |
| `NODE_ENV` | Ambiente de execução. |
| `IS_WORKER` | Quando verdadeiro, o processo sobe como worker de filas em vez de API HTTP. |

:::caution
`.env` contém segredos reais do ambiente local — nunca copie valores dele para a documentação ou para o repositório de docs.
:::

## Armazenamento de arquivos

Documentos enviados passam por um adapter de storage local (`local-file-storage.adapter.ts`, módulo `rag`), com os arquivos físicos sob `consult.ia/uploads`.
