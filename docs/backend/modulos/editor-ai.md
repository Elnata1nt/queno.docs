# Editor AI

Local: `src/modules/editor-ai`

Fornece assistência de IA dentro do editor de texto do frontend (Tiptap), reaproveitando o mesmo contexto de documentos do módulo `rag`.

## Casos de uso

- `analyze-text.use-case.ts` — analisa um trecho de texto (ações `review_source`/`review_full`). Devolve `{completion, sources}`.
- `autocomplete.use-case.ts` — autocompleta o texto a partir do cursor. Sem RAG estruturado em sources (ghost-text, não teria UI pra exibir fontes).
- `generate-text.use-case.ts` — gera texto novo a partir de uma instrução (`develop`/`continue`). Desde 2026-10-14 também devolve `{completion, sources}` (antes só devolvia a string, descartando os chunks recuperados).
- `refine-text.use-case.ts` — reescreve/melhora um trecho selecionado (`simplify`/`grammar`/`summarize`/`formal`/`custom`). Deliberadamente **sem RAG** — comentário no código: evita alucinação factual em refinamentos puramente estilísticos.
- `generate-outline.use-case.ts` (novo) — gera um sumário (lista de headings) a partir de um título/tópico, via `QueryAugmentationAdapter.generateOutline` (Groq, 1 chamada, JSON).
- `generate-from-outline.use-case.ts` (novo) — geração multi-seção: para cada heading do outline, busca conhecimento organizacional (RAG) específico daquela seção e gera o conteúdo via `generator.complete()`, concatenando tudo em um Markdown único. Roda **sequencial**, não em paralelo — evita bater várias chamadas simultâneas no Groq (mesma cautela de rate limit do resto do pipeline). Agrega e deduplica os `sources` de todas as seções.

Todos os `sources` enriquecidos (`analyze-text`, `generate-text`, `generate-from-outline`) seguem o mesmo formato do chat (ver [Modelo de IA](../../arquitetura/modelo-ia.md)): `documentName`, `chunkIndex`, `label`.

## Rotas (`/organizations/:organizationId/documents`)

| Rota | Descrição |
|---|---|
| `POST .../editor-ai` | Ação de IA sobre o editor — roteada por `action` no corpo da requisição (ver `editor-action.dto.ts`). |
| `POST .../autocomplete` | Autocomplete em tempo real enquanto o usuário digita. |

### Ações de `POST .../editor-ai`

| `action` | Use case | Observação |
|---|---|---|
| `simplify`, `grammar`, `summarize`, `formal`, `custom` | `RefineTextUseCase` | Sem RAG. |
| `review_source`, `review_full` | `AnalyzeTextUseCase` | Com RAG + sources. |
| `generate_outline` | `GenerateOutlineUseCase` | Novo — devolve `{sections: string[]}`. |
| `generate_from_outline` | `GenerateFromOutlineUseCase` | Novo — recebe `outline: string[]` no corpo, devolve `{completion, sources}` (Markdown multi-seção). |
| qualquer outro valor (`develop`, `continue`, etc.) | `GenerateTextUseCase` | Branch padrão — com RAG + sources. |

## Templates com IA (frontend)

O `DocumentCreationHub` (frontend) tem outlines fixos por template (`TEMPLATE_OUTLINE` em `useDocumentEditor.ts`) para `report`, `meeting` e `contract` — ao selecionar um desses, chama `generate_from_outline` com o outline fixo em vez de inserir o HTML estático de sempre. Em caso de erro (Groq fora do ar, etc.), cai de volta pro boilerplate estático — nunca bloqueia a criação do documento. Um 5º card "Gerar com IA" permite outline livre (usuário digita o tópico, revisa as seções geradas, confirma).

## Export de documentos internos

`GET .../documents/:documentId/download?format=markdown` serve o `Document.content` direto como `.md` — o conteúdo de documentos internos já é armazenado em Markdown (formato nativo do editor via `@tiptap/markdown`), então não há conversão nenhuma. Sem o parâmetro (ou para documentos `UPLOAD`), o comportamento de sempre continua: `.docx` convertido, ou o arquivo físico original.
