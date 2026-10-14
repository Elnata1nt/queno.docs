---
sidebar_position: 1
---

# Ambiente local

## Backend (`consult.ia`)

```bash
cd consult.ia
pnpm install
pnpm docker:up          # sobe postgres, redis, ollama (embeddings) e reranker (cross-encoder)
pnpm prisma:migrate     # aplica as migrações
pnpm start:dev          # API em http://localhost:<PORT>
```

Na primeira vez, o container `reranker` baixa o modelo `bge-reranker-v2-m3` (GGUF) do Hugging Face antes de ficar pronto — acompanhe com `docker logs queno-reranker`.

Em um segundo terminal, se for testar o pipeline de RAG (indexação assíncrona):

```bash
pnpm start:worker
```

Variáveis de ambiente: copie/ajuste `.env` (ver [Backend › Infraestrutura](../backend/infraestrutura.md) para o significado de cada chave).

## Frontend (`consult.ia.front`)

```bash
cd consult.ia.front
pnpm install
pnpm dev                # http://localhost:3000
```

Configurar `.env.local` apontando para a URL da API local (`BACKEND_URL`/equivalente usado em `service/api.service.ts`).

## Esta documentação (`docs-site`)

```bash
cd docs-site
npm start               # http://localhost:3000 (Docusaurus)
npm run build           # build estático em docs-site/build
```

:::info
Se o frontend e o Docusaurus rodarem ao mesmo tempo, ajuste a porta de um dos dois (`next dev -p 3001` ou `docusaurus start --port 3001`), já que ambos usam 3000 por padrão.
:::

## Atualizar a API Reference

A seção **API Reference** (`docs/api/`) não é escrita à mão — é gerada a partir do Swagger que o próprio backend expõe em `/api/docs-json`. Sempre que rotas, DTOs ou schemas do backend mudarem, regenere com o backend rodando localmente:

```bash
cd docs-site
npm run refresh-api-docs   # busca o spec em localhost:8000, limpa e regera docs/api/
```

Isso executa, em sequência:

1. `fetch-openapi` — baixa o spec atual de `http://localhost:8000/api/docs-json` para `openapi/consultia.json`.
2. `clean-api-docs` — remove as páginas geradas anteriormente.
3. `gen-api-docs` — gera `docs/api/*.mdx` (uma página por endpoint, agrupada por tag) + `docs/api/sidebar.ts`.

:::caution
Ajuste a URL em `fetch-openapi` (`package.json`) se a API local não estiver em `http://localhost:8000` (ex.: rodando via `pnpm start:dev` direto, sem Docker, costuma ser `http://localhost:3000` ou a porta de `PORT` no `.env`).
:::
