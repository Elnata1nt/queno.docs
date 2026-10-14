---
sidebar_position: 1
---

# Visão geral da arquitetura

```
                    ┌─────────────────────┐
                    │   consult.ia.front   │   Next.js 15 / React 19
                    │   (App Router)       │
                    └──────────┬───────────┘
                               │ REST (axios, cookies httpOnly)
                               ▼
                    ┌─────────────────────┐
                    │     consult.ia       │   NestJS (API HTTP)
                    │  módulos de domínio  │
                    └──────────┬───────────┘
                 ┌─────────────┼───────────────┐
                 ▼             ▼               ▼
           ┌───────────┐ ┌───────────┐  ┌──────────────┐
           │ PostgreSQL│ │   Redis   │  │ Groq / Ollama │
           │ (Prisma)  │ │ (BullMQ)  │  │ (LLM + embed) │
           └───────────┘ └───────────┘  └──────────────┘
```

## Backend (`consult.ia`)

O backend segue uma separação por camadas dentro de cada módulo de domínio (`src/modules/<modulo>`):

- **`domain/`** — entidades e regras de negócio puras, sem dependência de framework.
- **`application/`** — casos de uso (use cases) e serviços de aplicação que orquestram o domínio.
- **`infrastructure/`** — adapters concretos: controllers HTTP, repositórios Prisma, adapters de IA/OCR/storage.
- **`interfaces/`** — contratos (ports) que a infraestrutura implementa, permitindo trocar implementações (ex.: trocar o provedor de embeddings sem tocar nos use cases).

Essa estrutura é mais evidente no módulo [RAG](../backend/modulos/rag.md), que é o núcleo do produto. Para exemplos concretos de como essa injeção de dependência funciona (tokens, `providers`, `useFactory`), veja [Camadas na prática](./camadas.md).

Processos assíncronos pesados (extração de documentos, indexação) rodam em um **worker** separado (`start:worker`), consumindo filas BullMQ sobre Redis, para não bloquear a API principal.

## Frontend (`consult.ia.front`)

Aplicação Next.js com App Router, organizada por:

- `app/(pages)/(auth)` — fluxo de autenticação (login, registro, OTP, recuperação de senha).
- `app/(pages)/(system)` — área logada (dashboard, organização, perfil, admin).
- `components/` — componentes por domínio (`dashboard`, `organization`, `admin`, `profile`, `settings`) + `ui/` (design system baseado em Radix).
- `service/` — camada de acesso à API do backend (um arquivo por domínio: `auth`, `chat`, `documents`, `organization`, `admin`, `privacy`...).
- `contexts/` e `hooks/` — estado compartilhado (ex.: sessão do usuário, organização atual).

Veja [Frontend › Estrutura](../frontend/estrutura.md) para o detalhamento.

## Fluxo principal: perguntar sobre um documento (RAG)

1. Usuário faz upload de um documento (`POST /organizations/:id/documents/upload`).
2. O conteúdo é extraído (OCR local, AWS Textract ou extração visual, conforme o tipo de arquivo) e dividido em *chunks*.
3. Um job na fila BullMQ gera embeddings (via Ollama) para cada chunk e grava em `DocumentChunk`.
4. Ao perguntar (`POST /organizations/:id/documents/:documentId/chat` ou `chat-stream`), o backend recupera os chunks mais relevantes (retriever + reranker), monta o prompt com citações e gera a resposta via Groq.
5. A conversa é persistida em `ChatSession` / `Message`, permitindo histórico e feedback.

Detalhes em [Backend › Módulos › RAG](../backend/modulos/rag.md), diagrama de sequência completo em [Fluxos](./fluxos.md), e os modelos/parâmetros de IA usados em cada etapa em [Modelo de IA](./modelo-ia.md).
