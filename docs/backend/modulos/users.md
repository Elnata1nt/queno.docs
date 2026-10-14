# Users

Local: `src/modules/users`

## Rotas

| Rota | Descrição |
|---|---|
| `GET /all-users` | Lista usuários (uso administrativo/interno). |
| `GET /check-email` | Verifica disponibilidade/existência de um e-mail (ex.: no cadastro). |
| `GET /users/me/dashboard` | Dados do dashboard pessoal do usuário logado. |
| `PATCH /me` | Atualiza o próprio perfil. |
| `PATCH /users/:id` | Atualiza outro usuário (uso administrativo). |
| `DELETE /users/:id` | Remove um usuário. |
| `POST /me/avatar` | Upload de avatar. |
| `DELETE /me/avatar` | Remove o avatar atual. |
| `GET /users/search` | Busca de usuários (ex.: para convidar para uma organização). |
