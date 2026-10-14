---
sidebar_position: 3
---

# Camadas na prática (injeção de dependência)

A separação `domain` / `application` / `infrastructure` / `interfaces` descrita em [Visão geral](./visao-geral.md) não é só uma convenção de pastas — é imposta pelo wiring de DI do NestJS. Esta página mostra, com código real, como isso funciona nos módulos `rag`, `auth` e `organization`.

## 1. Cada porta é uma interface *e* um token, no mesmo arquivo

Um port (contrato) é declarado como `interface` TypeScript **e** como `Symbol` com o mesmo nome, no mesmo arquivo — usando *declaration merging* para que o nome sirva tanto de tipo (compile-time) quanto de token de injeção (runtime):

```typescript
// modules/auth/interfaces/auth.repository.ts
export const IAuthRepository = Symbol('IAuthRepository');

export interface IAuthRepository {
  findByResetToken(token: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  create(user: AuthUser, consentLog: CreateConsentLogProps): Promise<AuthUser>;
  update(user: AuthUser): Promise<AuthUser>;
}
```

O mesmo padrão aparece em `modules/rag/interfaces/document.repository.ts` (`IDocumentRepository`), `modules/organization/interfaces/organization.repository.ts` (`IOrganizationRepository`) e no port compartilhado `common/domain/interfaces/hash-provider.interface.ts` (`IHashProvider`).

## 2. O `*.module.ts` liga a interface ao adapter concreto

```typescript
// rag.module.ts
providers: [
  { provide: IDocumentRepository, useClass: PrismaDocumentRepository },
  { provide: IRetrieverService, useClass: RetrieverAdapter },
  { provide: IGeneratorService, useClass: GeneratorAdapter },
  { provide: IEmbeddingService, useClass: OllamaEmbeddingAdapter },
  { provide: IExtractionService, useClass: CompositeExtractionAdapter },
  // ...
]
```

```typescript
// auth.module.ts
providers: [
  { provide: IAuthRepository, useClass: PrismaAuthRepository },
  { provide: IHashProvider, useClass: BcryptHashAdapter },
  { provide: ITokenProvider, useClass: JwtTokenAdapter },
  { provide: IEmailProvider, useClass: ResendEmailAdapter },
]
```

```typescript
// organization.module.ts
providers: [
  { provide: IOrganizationRepository, useClass: PrismaOrganizationRepository },
  { provide: IMembershipRepository, useClass: PrismaMembershipRepository },
  { provide: IUserRepository, useClass: PrismaUserRepository },
]
```

Trocar um adapter (ex.: sair de Ollama para outro provedor de embeddings) é uma mudança de uma linha aqui — nenhum use case é tocado.

## 3. Os use cases só enxergam a interface

Os três módulos usam **`useFactory` manual** para instanciar cada use case (em vez de depender de `@Injectable()` + constructor DI automático), reunidos em um array const (`UseCaseProviders`) espalhado dentro de `providers`. Isso deixa o grafo de dependências de cada caso de uso explícito em um único lugar por módulo:

```typescript
// rag.module.ts
{
  provide: AskDocumentUseCase,
  useFactory: (
    session: IChatSessionRepository,
    doc: IDocumentRepository,
    ret: IRetrieverService,
    gen: IGeneratorService,
  ) => new AskDocumentUseCase(session, doc, ret, gen),
  inject: [IChatSessionRepository, IDocumentRepository, IRetrieverService, IGeneratorService],
}
```

```typescript
// auth.module.ts
{
  provide: RegisterUseCase,
  useFactory: (repo: IAuthRepository, hash: IHashProvider, email: IEmailProvider) =>
    new RegisterUseCase(repo, hash, email),
  inject: [IAuthRepository, IHashProvider, IEmailProvider],
}
```

`AskDocumentUseCase` e `RegisterUseCase` nunca importam `PrismaDocumentRepository`, `OllamaEmbeddingAdapter` ou `BcryptHashAdapter` diretamente — apenas os tipos `I*`. Isso é o que torna o domínio testável sem banco/API externa (bastam mocks das interfaces).

## 4. API e worker são o mesmo módulo, trocando de papel por env var

Particularidade do `rag.module.ts`: o processor da fila BullMQ só é registrado condicionalmente:

```typescript
providers: [
  // ...
  ...(process.env.IS_WORKER === 'true' ? [DocumentProcessingProcessor] : []),
]
```

Ou seja, `consult.ia` é um único código-fonte que sobe como API (`start:prod`) ou como worker de filas (`start:worker:prod`), dependendo apenas da variável `IS_WORKER` (ver [Backend › Infraestrutura](../backend/infraestrutura.md)).

## 5. Camada compartilhada (`src/common`)

| Arquivo | Papel |
|---|---|
| `constants/error-codes.ts` | Códigos de erro padronizados usados nas respostas de exceção. |
| `constants/plan-limits.ts` | Limites por plano (quotas de IA), consumidos pelo fluxo de checagem/incremento de quota da organização. |
| `filters/http-exception.filter.ts` | Filtro global que formata exceções HTTP de forma consistente. |
| `guards/admin.guard.ts` | Restringe rotas a usuários admin de plataforma. |
| `guards/role.guard.ts` | Guard genérico de verificação de papel/role dentro de uma organização. |
| `guards/org-role.decorator.ts` | Decorator para anotar o papel mínimo exigido em uma rota. |
| `utils/ai-pricing.ts` | Calcula o custo estimado de chamadas de IA (alimenta `AiUsageLog` e o painel admin). |
| `domain/interfaces/hash-provider.interface.ts` | Port de hashing (`IHashProvider`), implementado por `bcrypt-hash.adapter.ts`. |

:::note
O `RoleGuard` compartilhado aparece explicitamente nos `providers` do `rag.module.ts`; não é garantido que todo módulo o declare da mesma forma — ao mexer em autorização de um módulo novo, confira como ele usa (ou deveria usar) esse guard antes de assumir o padrão.
:::
