---
sidebar_position: 1
slug: /
---

# Visão Geral

Esta é a documentação técnica do **Consult.ia**, composto por dois projetos:

- **`consult.ia`** — backend em [NestJS](https://nestjs.com/), organizado em arquitetura modular/hexagonal (`domain` / `application` / `infrastructure` / `interfaces`), com Prisma (PostgreSQL), filas BullMQ (Redis) e um pipeline de RAG (Retrieval-Augmented Generation) usando Groq AI e Ollama.
- **`consult.ia.front`** — frontend em [Next.js 15](https://nextjs.org/) (App Router) + React 19, com Tailwind, Radix UI e Tiptap (editor rich-text).

## Como navegar

- [Arquitetura](./arquitetura/visao-geral.md) — como as peças se conectam.
  - [Modelo de dados](./arquitetura/modelo-de-dados.md) — schema completo (Prisma + pgvector).
  - [Camadas na prática](./arquitetura/camadas.md) — DI/hexagonal com exemplos reais de código.
  - [Modelo de IA e pipeline RAG](./arquitetura/modelo-ia.md) — modelos, parâmetros, retrieval híbrido, prompts.
  - [Fluxos](./arquitetura/fluxos.md) — diagramas de sequência dos principais fluxos.
- [Backend](./backend/visao-geral.md) — módulos, infraestrutura e rotas da API.
  - [Regras de negócio, validação e autorização](./backend/regras-de-negocio.md).
- [Frontend](./frontend/visao-geral.md) — estrutura de páginas, componentes e serviços.
- [Operações](./operacoes/ambiente-local.md) — como rodar o projeto localmente.
- [API Reference](./api/rag-backend-consult-ia.info.mdx) — gerada automaticamente a partir do Swagger/OpenAPI do backend, com todos os endpoints, parâmetros e schemas.

:::note
Esta documentação é mantida manualmente a partir da leitura do código-fonte. Ao mudar um módulo, atualize a página correspondente.
:::
