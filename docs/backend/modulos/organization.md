# Organization

Local: `src/modules/organization`

Representa o tenant do sistema: toda a base de conhecimento (documentos, sessões de chat) e controle de acesso é escopado por organização, através de `Membership`.

## Rotas (`/organizations`)

| Rota | Descrição |
|---|---|
| `POST /organizations` | Cria uma organização. |
| `GET /organizations/count` | Contagem de organizações. |
| `GET /organizations` | Lista organizações do usuário autenticado. |
| `GET /organizations/:organizationId` | Detalhe de uma organização. |
| `PATCH /organizations/:organizationId` | Atualiza uma organização. |
| `DELETE /organizations/:organizationId` | Remove uma organização. |
| `GET /organizations/:organizationId/audit-logs` | Trilha de auditoria da organização. |

## Membros (`/organizations/:organizationId/members`)

| Rota | Descrição |
|---|---|
| `POST .../members` | Adiciona/convida um membro. |
| `GET .../members` | Lista membros. |
| `PATCH .../members/:memberId` | Atualiza papel/role de um membro. |
| `DELETE .../members/:memberId` | Remove um membro. |

Essa é a base de autorização usada pelos demais módulos (`rag`, `editor-ai`, `admin`) para checar se o usuário pertence à organização do recurso acessado.
