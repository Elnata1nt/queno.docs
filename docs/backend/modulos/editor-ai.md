# Editor AI

Local: `src/modules/editor-ai`

Fornece assistência de IA dentro do editor de texto do frontend (Tiptap), reaproveitando o mesmo contexto de documentos do módulo `rag`.

## Casos de uso

- `analyze-text.use-case.ts` — analisa um trecho de texto.
- `autocomplete.use-case.ts` — autocompleta o texto a partir do cursor.
- `generate-text.use-case.ts` — gera texto novo a partir de uma instrução.
- `refine-text.use-case.ts` — reescreve/melhora um trecho selecionado.

## Rotas (`/organizations/:organizationId/documents`)

| Rota | Descrição |
|---|---|
| `POST .../editor-ai` | Ação de IA sobre o editor (analisar, gerar ou refinar — ver `editor-action.dto.ts`). |
| `POST .../autocomplete` | Autocomplete em tempo real enquanto o usuário digita. |
