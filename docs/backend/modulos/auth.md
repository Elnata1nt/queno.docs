# Auth

Local: `src/modules/auth`

Responsável por registro, login e ciclo de vida da sessão, com verificação por OTP (código enviado por e-mail via Resend).

## Rotas (`/auth`)

| Rota | Descrição |
|---|---|
| `POST /auth/register` | Cria um novo usuário. |
| `POST /auth/verify-otp` | Confirma o código OTP enviado após o registro/login. |
| `POST /auth/resend-otp` | Reenvia o código OTP. |
| `POST /auth/login` | Autentica e inicia sessão (cookie). |
| `POST /auth/logout` | Encerra a sessão. |
| `GET /auth/me` | Retorna o usuário autenticado atual. |
| `POST /auth/forgot-password` | Inicia fluxo de recuperação de senha. |
| `POST /auth/reset-password` | Define nova senha a partir do fluxo de recuperação. |

## Notas de implementação

- Sessão baseada em cookie httpOnly (não em token exposto ao JS do frontend), configurado via `COOKIE_DOMAIN`.
- Guards e decorators de autenticação ficam em `modules/auth/decorators` e `common/guards`, reutilizados pelos demais módulos para proteger rotas.
