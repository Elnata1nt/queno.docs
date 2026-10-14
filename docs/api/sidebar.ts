import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/rag-backend-consult-ia",
    },
    {
      type: "category",
      label: "Documents & RAG",
      items: [
        {
          type: "doc",
          id: "api/rag-controller-upload-and-index",
          label: "Upload and index a document",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-create-internal",
          label: "Create an internal document (editable)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-list-documents",
          label: "List all documents for an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/rag-controller-update-internal",
          label: "Update an internal document content",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/rag-controller-get-document",
          label: "Busca os detalhes de um documento",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/rag-controller-delete-document",
          label: "Delete a document and its associated data",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/rag-controller-get-document-versions",
          label: "Gets the version history of a document",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/rag-controller-restore-version",
          label: "Restores a document to a specific historical version",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-download-document",
          label: "Baixa o arquivo original do documento",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/rag-controller-view-document",
          label: "Visualiza o conteúdo do documento inline (sem forçar download)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/rag-controller-chat-with-document",
          label: "Chat with a specific document using RAG",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-chat-with-document-stream",
          label: "Stream chat response with source citations",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-reindex",
          label: "Força o reprocessamento e reindexação de um documento",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/rag-controller-complete-doc",
          label: "Complete/Improve text using AI",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Chat",
      items: [
        {
          type: "doc",
          id: "api/organization-rag-controller-chat-with-organization-stream",
          label: "Pergunta em streaming cruzando todos os documentos da organização",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/organization-rag-controller-get-suggestions",
          label: "Sugere perguntas com base no conteúdo da organização",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Chat Sessions",
      items: [
        {
          type: "doc",
          id: "api/session-controller-list-sessions",
          label: "List paginated chat sessions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/session-controller-clear-history",
          label: "Clear all chat sessions for the logged-in user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/session-controller-get-notifications",
          label: "Get notifications for the logged-in user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/session-controller-get-session-messages",
          label: "Get messages from a specific session",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/session-controller-submit-feedback",
          label: "Submit thumbs up/down feedback on a message",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/session-controller-generate-title",
          label: "Generate a title for the session based on its content",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Organizations",
      items: [
        {
          type: "doc",
          id: "api/organization-controller-create",
          label: "Cria uma nova organização",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/organization-controller-find-all",
          label: "Lista todas as organizações que o usuário participa",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/organization-controller-count",
          label: "Retorna a quantidade total de organizações do usuário",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/organization-controller-find-one",
          label: "Busca os detalhes de uma organização",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/organization-controller-update",
          label: "Atualiza os dados de uma organização (Apenas OWNER)",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/organization-controller-remove",
          label: "Deleta uma organização (Apenas OWNER)",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/organization-controller-get-audit-logs",
          label: "Retorna os logs de auditoria da organização (Apenas ADMIN/OWNER)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Members",
      items: [
        {
          type: "doc",
          id: "api/organization-member-controller-add-member",
          label: "Adiciona um novo membro à organização pelo email",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/organization-member-controller-list-members",
          label: "Lista todos os membros da organização",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/organization-member-controller-update-member-role",
          label: "Atualiza o papel (role) de um membro",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/organization-member-controller-remove-member",
          label: "Remove um membro da organização",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Privacy",
      items: [
        {
          type: "doc",
          id: "api/privacy-controller-export",
          label: "LGPD: Export all personal data",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/privacy-controller-revoke",
          label: "LGPD: Revoke privacy policy consent",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/privacy-controller-accept",
          label: "LGPD: Accept privacy policy consent",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/privacy-controller-delete-my-data",
          label: "LGPD: Right to be forgotten (Delete all data)",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      items: [
        {
          type: "doc",
          id: "api/users-controller-find-all",
          label: "List all users",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/users-controller-check-email",
          label: "Verifica se um e-mail já está cadastrado",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/users-controller-get-my-dashboard",
          label: "Get aggregated dashboard data for the current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/users-controller-update-me",
          label: "Update current user profile",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/users-controller-update-user",
          label: "Atualiza outro usuário pelo id",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/users-controller-remove",
          label: "Remove outro usuário pelo id",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/users-controller-upload-avatar",
          label: "Upload user avatar",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/users-controller-delete-avatar",
          label: "Remove user avatar",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/users-controller-search",
          label: "Search users by name or email for invitations",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Admin",
      items: [
        {
          type: "doc",
          id: "api/admin-controller-get-stats",
          label: "Get global system statistics",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-controller-get-all-organizations",
          label: "List all organizations (Admin view)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-controller-get-audit-logs",
          label: "Get system audit logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-controller-get-consent-logs",
          label: "Get LGPD consent logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/admin-controller-get-ai-usage",
          label: "Get AI token usage and costs",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Auth",
      items: [
        {
          type: "doc",
          id: "api/auth-controller-register",
          label: "Registra um novo usuário",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-verify-otp",
          label: "Verifica o código OTP e ativa a conta",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-resend-otp",
          label: "Reenvia o código OTP",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-login",
          label: "Autentica o usuário e inicia sessão",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-logout",
          label: "Encerra a sessão atual (limpa o cookie)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-me",
          label: "Retorna o usuário autenticado atual",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-controller-forgot-password",
          label: "Inicia o fluxo de recuperação de senha",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-reset-password",
          label: "Define uma nova senha a partir do token de recuperação",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Editor AI",
      items: [
        {
          type: "doc",
          id: "api/editor-ai-controller-process-editor-action",
          label: "Process document text using AI editor tools",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/editor-ai-controller-autocomplete",
          label: "Predict and autocomplete text",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
