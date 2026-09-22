# TORO Identity + TORO User Vault v1

**Status:** IMPLEMENTATION SPEC — do not apply production DDL from this document directly
**Date:** 2026-09-22
**Canonical runtime:** Supabase project `abtyrbqlqbsastmridzp`
**Depends on:** `TORO_SUBSYSTEMS_AND_USER_VAULT.md`, TORO Product Constitution

## 1. Objective

Create one durable identity per human and a privacy-safe user data domain that can support both work and personal assistance without creating a separate physical database per person.

TORO Identity answers:
- who is this human;
- which organizations/workspaces they belong to;
- which roles they hold;
- which employee/person records represent them in each organization;
- which tools they connected personally or through an organization;
- what TORO is allowed to remember, read, share and execute.

TORO User Vault answers:
- what durable personal/user-specific context TORO may retain;
- who owns it;
- which scope it belongs to;
- why it exists;
- where it came from;
- how long it may remain;
- whether it can be promoted into work/shared knowledge.

## 2. Verified current baseline

Current Supabase already provides a strong foundation:

- `auth.users` + `public.app_users` for individual identity;
- `public.organizations` for organizations;
- `public.roles` and `public.user_roles` for organization-scoped roles;
- `public.employees` for employment relationship;
- `public.departments` and `public.positions`;
- `public.employee_private_profiles` for employer-governed private HR data;
- `public.employment_profiles` for employment terms/history;
- `public.user_sessions`;
- `public.notifications`;
- `public.team_messages` and `public.team_message_read_states`;
- `public.approval_requests`;
- `public.audit_logs`.

Observed counts on 2026-09-22:
- 1 organization;
- 5 app users;
- 13 non-deleted employee records: 12 active, 1 terminated;
- 4 employee records currently linked to a `user_id`;
- 9 employee records currently without a user link;
- 9 active user-role rows;
- 3 users currently hold multiple roles within the same organization;
- 7 employee-private profiles;
- 0 employment-profile rows;
- 86 session rows.

These counts are operational evidence, not a permanent contract.

## 3. Important boundaries

### 3.1 Employee private profile is not the User Vault

`employee_private_profiles` contains employer-governed HR-sensitive data and is readable/writable under ADMIN/RRHH policy. It must not become TORO Personal memory.

### 3.2 Founder profile is not the User Vault

`private.founder_profiles` is organization-governed and visible to privileged business roles. It is not an appropriate generic personal memory store.

### 3.3 One auth identity, many organizations

A person keeps one `auth.users.id` / `app_users.id` and may join multiple organizations. Employment is organization-specific and may exist without a login during pre-onboarding.

### 3.4 Membership is distinct from role

Today `user_roles` partly acts as both membership evidence and authorization. v1 should introduce explicit organization membership state so:
- a user can belong to an organization before a role is assigned;
- suspension/offboarding can disable membership once without rewriting every role;
- multiple roles do not create duplicate membership semantics;
- future non-employee users can belong without forcing an employee record.

## 4. Proposed canonical identity model

### Existing — reuse

- `app_users`
- `organizations`
- `employees`
- `departments`
- `positions`
- `roles`
- `user_roles`
- `user_sessions`

### Add

#### `identity.organization_memberships`

Purpose: one row per human ↔ organization relationship.

Suggested columns:
- id uuid PK;
- org_id uuid FK organizations;
- user_id uuid FK auth.users;
- membership_type text: employee / owner / contractor / advisor / provider / other;
- status text: invited / active / suspended / offboarded;
- primary_employee_id uuid nullable;
- joined_at;
- offboarded_at;
- created_at;
- updated_at.

Unique: `(org_id,user_id)`.

Do not duplicate role fields here. Roles remain in `user_roles`.

#### `identity.user_profile_settings`

User-owned presentation and assistant preferences:
- user_id PK;
- preferred_name;
- locale;
- timezone;
- communication_style;
- default_personal_workspace;
- created_at;
- updated_at.

This supplements `app_users`; it does not copy authentication secrets.

## 5. TORO User Vault schemas

Recommended dedicated schema: `user_vault`.

### `user_vault.memory_items`

Durable memory, not raw chat history.

Fields:
- id uuid;
- user_id uuid;
- org_id uuid nullable;
- scope: personal / work_private / work_org / shared / system;
- domain;
- memory_type;
- title;
- normalized_value jsonb;
- summary text;
- source_type;
- source_ref;
- provenance jsonb;
- confidence numeric;
- verification_state: observed / candidate / confirmed / verified / disputed;
- sensitivity: public / internal / private / restricted;
- retention_class;
- expires_at nullable;
- supersedes_id nullable;
- status: active / superseded / expired / deleted;
- created_at;
- updated_at.

Rules:
- no full raw email/thread/chat dump by default;
- personal rows require `user_id = auth.uid()` for normal reads;
- organization access to personal scope is always false;
- work_org rows should normally graduate to canonical business domains rather than remain user memory forever.

### `user_vault.preferences`

Stable preferences:
- user_id;
- org_id nullable;
- scope;
- preference_key;
- value jsonb;
- source_ref;
- confidence;
- confirmed_at;
- status;
- timestamps.

### `user_vault.goals`

- user_id;
- org_id nullable;
- scope;
- goal_type;
- title;
- target_date;
- status;
- success_criteria;
- source_ref;
- timestamps.

### `user_vault.learning_signals`

Stores corrections/repetition evidence before durable promotion:
- user_id;
- org_id nullable;
- scope;
- signal_type;
- domain;
- normalized_signal;
- occurrence_count;
- first_seen_at;
- last_seen_at;
- proposed_memory_key;
- review_state.

### `user_vault.consents`

- user_id;
- consent_type;
- purpose;
- scope;
- granted;
- granted_at;
- revoked_at;
- policy_version;
- source_channel.

### `user_vault.tool_connections`

Metadata only:
- user_id;
- org_id nullable;
- connection_owner: personal / organization;
- provider;
- external_account_ref_masked;
- status;
- granted_scopes;
- last_health_at;
- secret_ref;
- timestamps.

Never store OAuth/access tokens directly here.

### `user_vault.tool_permissions`

- user_id;
- org_id nullable;
- provider/tool;
- permission: read / search / draft / execute / approve;
- scope;
- granted_by;
- expires_at;
- status.

### `user_vault.notification_preferences`

- user_id;
- org_id nullable;
- channel;
- category;
- enabled;
- digest_mode;
- quiet_hours;
- escalation_allowed.

### `user_vault.context_events`

Minimized normalized events useful for continuity:
- user_id;
- org_id nullable;
- scope;
- event_type;
- subject_ref;
- source_ref;
- occurred_at;
- payload_minimized jsonb;
- retention_class.

Do not use this as an unlimited activity surveillance log.

## 6. RLS invariants

### Personal
- user-only normal access;
- organization roles, including ADMIN, have no personal-content access;
- server operations require explicit purpose and audit.

### Work private
- user reads own;
- organization access only through explicit named policy.

### Work org
- role/org policy governs;
- canonical operational facts should live in domain tables whenever possible.

### Shared
- explicit share grants required.

### System
- least privilege and payload minimization.

## 7. Personal/work context firewall

Every request resolves:

`actor -> active context -> organization (optional) -> scope -> permission -> tools -> response/write target`

Examples:
- "Remind me to call my mother" -> personal.
- "Remind me to inspect room 25" -> work_private or work_org.
- "Save that I prefer reports in bullets" -> personal unless explicitly organization-specific.
- "Our hotel policy is check-out at 11" -> organization knowledge candidate.
- "I have a medical appointment" -> personal.
- "I need leave Friday for an appointment" -> HR request can record leave facts without copying personal appointment detail.

## 8. Memory promotion rules

`transient observation -> learning signal -> candidate memory -> confirmation/verification -> durable memory`

Confirmation required for identity, relationship, employer-facing, financial, health/legal, permission or action-authority-changing facts.

## 9. Existing identity debt

### P0
1. Introduce organization membership without breaking `user_roles`.
2. Reconcile employee ↔ user links before employee-facing rollout.
3. Classify the 9 unlinked employee records.
4. Populate or explicitly retire the empty `employment_profiles` path after source review.
5. Remove legacy role aliases only after compatibility testing.

### P1
6. Add User Vault schema with RLS tests.
7. Add Personal vs Organization context resolver.
8. Bind connectors to user or organization ownership.
9. Add export/delete/retention workflows.
10. Add "What TORO knows about me" controls.

## 10. Required tests

- user A cannot read user B personal vault;
- ADMIN cannot read employee personal vault;
- one user can belong to two organizations without leakage;
- membership suspension blocks org access;
- personal connector data is not employer-readable;
- one message cannot silently become durable memory;
- personal memory cannot become work_org without governed transition;
- offboarding revokes organization scope without deleting personal TORO data.

## 11. Rollout order

1. schema + RLS in isolated validation;
2. identity reconciliation;
3. memberships backfill;
4. empty User Vault foundation;
5. context resolver;
6. Mauricio pilot;
7. one non-owner employee pilot;
8. memory inspection/export;
9. personal connector pilot;
10. wider rollout.

No personal data ingestion starts before steps 1–5 are verified.
