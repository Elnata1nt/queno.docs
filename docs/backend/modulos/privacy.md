# Privacy

Local: `src/modules/privacy`

Implementa os direitos do titular de dados (LGPD): exportação, revogação de consentimento e exclusão de dados pessoais.

## Rotas (`/privacy`)

| Rota | Descrição |
|---|---|
| `GET /privacy/export` | Exporta os dados pessoais do usuário autenticado. |
| `POST /privacy/revoke` | Revoga um consentimento previamente aceito. |
| `POST /privacy/accept` | Registra aceite de um termo/consentimento. |
| `DELETE /privacy/my-data` | Solicita exclusão dos próprios dados. |

Cada ação relevante aqui é registrada em `ConsentLog`, consultável pelo módulo [Admin](./admin.md) (`GET /admin/consent-logs`).
