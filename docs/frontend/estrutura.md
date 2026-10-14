---
sidebar_position: 2
---

# Estrutura de pastas

## Páginas (`src/app/(pages)`)

| Grupo de rotas | Conteúdo |
|---|---|
| `(auth)` | `sign-in`, `sign-up`, `verify-otp`, `forgot-password`, `reset-password` — espelha as rotas do módulo [`auth`](../backend/modulos/auth.md) do backend. |
| `(system)/dashboard` | Dashboard pessoal (`GET /users/me/dashboard`). |
| `(system)/organization` | Gestão de organização e membros. |
| `(system)/profile` | Perfil do usuário. |
| `(system)/(admin)` | Área administrativa (espelha o módulo [`admin`](../backend/modulos/admin.md)). |
| `docs/privacy-lgpd`, `docs/terms-of-use` | Páginas estáticas de privacidade/termos. |

Os grupos `(auth)` e `(system)` são *route groups* do Next.js — não aparecem na URL, servem para aplicar layouts diferentes (ex.: layout sem sidebar no login vs. layout com sidebar na área logada).

## Componentes (`src/components`)

Organizados por domínio, espelhando os módulos de backend/páginas: `dashboard/`, `organization/`, `admin/`, `profile/`, `settings/`, mais:

- `layout/` — shell da aplicação (sidebar, header, etc.).
- `common/` e `shared/` — componentes reutilizados entre domínios.
- `ui/` — design system baseado em Radix (botões, inputs, tabs...), normalmente gerado/mantido via `components.json` (shadcn-style).

## Camada de serviço (`src/service`)

Um arquivo por domínio, cada um encapsulando as chamadas HTTP ao backend correspondente:

| Service | Módulo de backend relacionado |
|---|---|
| `auth.service.ts` | [`auth`](../backend/modulos/auth.md) |
| `user.service.ts` | [`users`](../backend/modulos/users.md) |
| `organization.service.ts` | [`organization`](../backend/modulos/organization.md) |
| `documents.service.ts`, `chat.service.ts`, `ai.service.ts` | [`rag`](../backend/modulos/rag.md) / [`editor-ai`](../backend/modulos/editor-ai.md) |
| `admin.service.ts`, `audit.service.ts` | [`admin`](../backend/modulos/admin.md) |
| `privacy.service.ts` | [`privacy`](../backend/modulos/privacy.md) |
| `dashboard.service.ts` | dashboard pessoal (`users`) |
| `api.service.ts` | client axios base (interceptors, baseURL, tratamento de erro comum). |

## Estado e dados (`src/contexts`, `src/hooks`, `src/lib`, `src/types`)

- `contexts/` — estado global via React Context (ex.: usuário autenticado, organização ativa).
- `hooks/` — hooks customizados (ex.: wrappers de data-fetching sobre os services).
- `lib/` — utilitários (formatação, helpers do Tiptap, etc.).
- `types/` — tipos TypeScript compartilhados, idealmente espelhando os DTOs do backend.
