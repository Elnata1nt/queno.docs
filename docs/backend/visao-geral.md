---
sidebar_position: 1
---

# Visão geral do backend

Projeto: `consult.ia` — NestJS + TypeScript, Prisma (PostgreSQL) como ORM, BullMQ (Redis) para filas, Groq AI e Ollama para IA.

## Scripts principais (`package.json`)

| Script | Uso |
|---|---|
| `start:dev` | API em modo watch. |
| `start:worker` | Processo separado que consome as filas BullMQ (processamento/indexação de documentos). |
| `prisma:migrate` / `prisma:studio` | Migrações e inspeção do banco. |
| `docker:up` / `docker:down` | Sobe/derruba a stack local (ver [docker-compose.yml](../operacoes/ambiente-local.md)). |
| `reindex` | Script para reindexar documentos existentes no RAG. |
| `test` / `test:e2e` | Testes unitários e end-to-end (Jest). |

## Módulos (`src/modules`)

| Módulo | Responsabilidade |
|---|---|
| [`auth`](./modulos/auth.md) | Registro, login, OTP, recuperação de senha, sessão. |
| [`users`](./modulos/users.md) | Perfil do usuário, busca de usuários, avatar, dashboard pessoal. |
| [`organization`](./modulos/organization.md) | Organizações (tenants), membros e papéis. |
| [`rag`](./modulos/rag.md) | Upload, indexação e chat sobre documentos (núcleo do produto). |
| [`editor-ai`](./modulos/editor-ai.md) | Assistência de IA dentro do editor de texto (autocomplete, refinar, gerar). |
| [`admin`](./modulos/admin.md) | Painel administrativo (estatísticas, auditoria, uso de IA). |
| [`privacy`](./modulos/privacy.md) | Exportação/exclusão de dados e consentimento (LGPD). |

Cada módulo segue a separação `domain` / `application` / `infrastructure` / `interfaces` descrita em [Arquitetura › Camadas](../arquitetura/camadas.md).

Veja também:
- [Infraestrutura](./infraestrutura.md) — banco, filas e variáveis de ambiente.
- [Regras de negócio, validação e autorização](./regras-de-negocio.md) — o que cada módulo valida/autoriza, módulo a módulo.
- [Arquitetura › Fluxos](../arquitetura/fluxos.md) — diagramas de sequência dos principais fluxos.
- [Arquitetura › Modelo de IA](../arquitetura/modelo-ia.md) — modelos, parâmetros e o pipeline RAG completo.
