# Admin

Local: `src/modules/admin`

Painel administrativo de plataforma (acima do nível de uma única organização).

## Rotas (`/admin`)

| Rota | Descrição |
|---|---|
| `GET /admin/stats` | Estatísticas gerais do sistema. |
| `GET /admin/organizations` | Lista todas as organizações. |
| `GET /admin/audit-logs` | Auditoria global. |
| `GET /admin/consent-logs` | Logs de consentimento (LGPD) de todos os usuários. |
| `GET /admin/ai-usage` | Consumo/uso de IA (`AiUsageLog`), para acompanhar custo e volume. |
