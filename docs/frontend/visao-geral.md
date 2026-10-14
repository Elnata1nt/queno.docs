---
sidebar_position: 1
---

# Visão geral do frontend

Projeto: `consult.ia.front` — Next.js 15 (App Router) + React 19, Tailwind CSS v4, Radix UI, Tiptap (editor rich-text), Recharts (gráficos do dashboard/admin).

## Scripts (`package.json`)

| Script | Uso |
|---|---|
| `dev` | Servidor de desenvolvimento (Turbopack). |
| `build` | Build de produção. |
| `start` | Serve o build de produção. |
| `lint` | ESLint. |

## Bibliotecas-chave

- **Tiptap** (`@tiptap/*`) — editor de texto rico, usado junto ao módulo `editor-ai` do backend (autocomplete, refinar, gerar texto).
- **Radix UI / `components/ui`** — base do design system (botões, dropdowns, tabs, tooltips, popovers).
- **`@xyflow/react`** — usado para visualizações em grafo/fluxo (se aplicável a alguma tela do dashboard/organização).
- **`axios`** (`service/api.service.ts`) — client HTTP central para falar com o backend, com cookies httpOnly de sessão.
- **`react-markdown`** — renderização de respostas do RAG, que vêm em Markdown.
