-- Read-only prerequisite audit. No inserts, roles, permissions or workers.
-- Run with the authorized Supabase diagnostic connection.
-- READY_FOR_REVIEW is not authorization to create a project.
WITH scope AS (
  SELECT id FROM public.organizations
  WHERE id = '28cd20ed-6717-4168-87ea-3c9518a6ffa5'::uuid
    AND slug = 'margot-personal'
), checks AS (
  SELECT
    (SELECT count(*) FROM scope) AS scope_count,
    (SELECT count(*) FROM operations.projects p JOIN scope s ON s.id=p.org_id) AS existing_projects,
    (SELECT count(*) FROM public.user_roles ur JOIN public.roles r ON r.id=ur.role_id
      JOIN scope s ON s.id=ur.org_id
      WHERE ur.revoked_at IS NULL AND ur.status='active' AND r.code IN ('ADMIN','GERENCIA')) AS management_roles,
    (SELECT count(*) FROM operations.admin_modules m JOIN scope s ON s.id=m.org_id) AS registered_modules,
    (SELECT count(*) FROM integrations.communication_channel_bindings b JOIN scope s ON s.id=b.org_id
      WHERE b.active AND b.read_enabled AND b.channel='email') AS readable_email_bindings,
    (SELECT count(*) FROM integrations.communication_channel_bindings b
      WHERE b.normalized_endpoint='toromargot@gmail.com'
        AND b.org_id <> '28cd20ed-6717-4168-87ea-3c9518a6ffa5'::uuid) AS wrong_scope_mail_bindings,
    (SELECT relrowsecurity FROM pg_class WHERE oid='operations.projects'::regclass) AS project_rls
)
SELECT *,
  CASE WHEN scope_count<>1 THEN 'BLOCKED_SCOPE'
    WHEN NOT coalesce(project_rls,false) THEN 'BLOCKED_RLS'
    WHEN wrong_scope_mail_bindings>0 THEN 'BLOCKED_CROSS_SCOPE_BINDING'
    WHEN existing_projects>0 THEN 'REUSE_EXISTING_PROJECT_REVIEW_REQUIRED'
    WHEN management_roles=0 THEN 'BLOCKED_IDENTITY_MEMBERSHIP'
    WHEN registered_modules=0 THEN 'BLOCKED_MODULE_MAPPING'
    WHEN readable_email_bindings=0 THEN 'BLOCKED_EMAIL_BINDING'
    ELSE 'READY_FOR_REVIEW'
  END AS prerequisite_status,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN scope_count<>1 THEN 'organization identity' END,
    CASE WHEN NOT coalesce(project_rls,false) THEN 'project RLS' END,
    CASE WHEN wrong_scope_mail_bindings>0 THEN 'cross-scope mailbox binding' END,
    CASE WHEN management_roles=0 THEN 'accepted private management membership' END,
    CASE WHEN registered_modules=0 THEN 'same-scope canonical module' END,
    CASE WHEN readable_email_bindings=0 THEN 'verified private mailbox binding' END
  ],NULL) AS missing_prerequisites,
  'UNVERIFIED: authenticated hotel denial, Margot access, calendar binding, same-scope parent, Control Plane writer and receipt' AS remaining_runtime_gates
FROM checks;
