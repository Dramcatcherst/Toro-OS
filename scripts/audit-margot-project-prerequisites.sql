-- Read-only provisioning preflight for the owner's selected access identity.
-- Does not grant access, create projects or execute workers.
-- READY_FOR_REVIEW is not runtime authorization.
WITH scope AS (
  SELECT id FROM public.organizations
  WHERE id='28cd20ed-6717-4168-87ea-3c9518a6ffa5'::uuid AND slug='margot-personal'
), selected_identity AS (
  SELECT id, email_confirmed_at FROM auth.users
  WHERE lower(email)='admin@dreamcatcherhotel.com'
), checks AS (
  SELECT
    (SELECT count(*) FROM scope) AS scope_count,
    (SELECT count(*) FROM selected_identity) AS selected_accounts,
    (SELECT count(*) FROM selected_identity WHERE email_confirmed_at IS NOT NULL) AS confirmed_accounts,
    (SELECT count(*) FROM identity.organization_memberships m
      JOIN scope s ON s.id=m.org_id JOIN selected_identity u ON u.id=m.user_id
      WHERE m.status='active') AS selected_active_memberships,
    (SELECT count(*) FROM public.user_roles ur JOIN public.roles r ON r.id=ur.role_id
      JOIN scope s ON s.id=ur.org_id JOIN selected_identity u ON u.id=ur.user_id
      WHERE ur.revoked_at IS NULL AND ur.status='active'
        AND r.code IN ('ADMIN','GERENCIA')) AS selected_management_roles,
    (SELECT count(*) FROM operations.projects p JOIN scope s ON s.id=p.org_id) AS existing_projects,
    (SELECT count(*) FROM operations.admin_modules m JOIN scope s ON s.id=m.org_id) AS registered_modules,
    (SELECT count(*) FROM integrations.communication_channel_bindings b JOIN scope s ON s.id=b.org_id
      WHERE b.active AND b.read_enabled AND b.channel='email') AS readable_email_bindings,
    (SELECT count(*) FROM integrations.communication_channel_bindings b
      WHERE b.normalized_endpoint='toromargot@gmail.com'
        AND b.org_id<>'28cd20ed-6717-4168-87ea-3c9518a6ffa5'::uuid) AS wrong_scope_mail_bindings,
    (SELECT relrowsecurity FROM pg_class WHERE oid='operations.projects'::regclass) AS project_rls,
    (SELECT relrowsecurity FROM pg_class WHERE oid='identity.organization_memberships'::regclass) AS membership_rls
)
SELECT *,
  CASE WHEN scope_count<>1 THEN 'BLOCKED_SCOPE'
    WHEN selected_accounts<>1 OR confirmed_accounts<>1 THEN 'BLOCKED_LOGIN_IDENTITY'
    WHEN NOT coalesce(project_rls,false) OR NOT coalesce(membership_rls,false) THEN 'BLOCKED_RLS'
    WHEN wrong_scope_mail_bindings>0 THEN 'BLOCKED_CROSS_SCOPE_BINDING'
    WHEN existing_projects>0 THEN 'REUSE_EXISTING_PROJECT_REVIEW_REQUIRED'
    WHEN selected_active_memberships<>1 THEN 'BLOCKED_SELECTED_MEMBERSHIP'
    WHEN selected_management_roles=0 THEN 'BLOCKED_SELECTED_ROLE'
    WHEN registered_modules=0 THEN 'BLOCKED_MODULE_MAPPING'
    WHEN readable_email_bindings=0 THEN 'BLOCKED_EMAIL_BINDING'
    ELSE 'READY_FOR_REVIEW'
  END AS prerequisite_status,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN scope_count<>1 THEN 'organization identity' END,
    CASE WHEN selected_accounts<>1 OR confirmed_accounts<>1 THEN 'confirmed selected login identity' END,
    CASE WHEN NOT coalesce(project_rls,false) OR NOT coalesce(membership_rls,false) THEN 'project/membership RLS' END,
    CASE WHEN wrong_scope_mail_bindings>0 THEN 'cross-scope mailbox binding' END,
    CASE WHEN selected_active_memberships<>1 THEN 'selected account private membership' END,
    CASE WHEN selected_management_roles=0 THEN 'selected account private management role' END,
    CASE WHEN registered_modules=0 THEN 'same-scope canonical module' END,
    CASE WHEN readable_email_bindings=0 THEN 'private readable mailbox binding' END
  ],NULL) AS missing_prerequisites,
  'UNVERIFIED: selected-context isolation, hotel-only denial, calendar binding, source verification, same-scope parent, governed writer and receipt' AS remaining_runtime_gates
FROM checks;
