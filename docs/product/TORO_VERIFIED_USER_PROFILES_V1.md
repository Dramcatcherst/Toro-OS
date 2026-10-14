# TORO verified user profiles v1

**Version:** 2026.10.13-v1  
**Status:** specified; static validation implemented; runtime deployment not verified

## Decision

TORO keeps one visible identity and compiles an effective experience from verified identity, active membership, canonical role, channel/account scope and a minimal personalization overlay.

Personalization affects wording, ordering and explanation depth. It never grants data access, tools, execution authority or approval rights.

## Verified profiles available now

| User/account | Verified context | Personalization | Hard boundary |
|---|---|---|---|
| Mauricio | Owner; personal and executive contexts | Spanish, direct, proactive, result first; address as Mau | Material external actions retain their policy gates |
| Ana Carolina | Owner-confirmed administrative mapping; runtime binding still required | Spanish, precise, discreet and traceable; ask preferred name | Individually allowlisted for the proposed People assistant; role alone is insufficient; activation unverified |
| Alexandra | Owner-confirmed Reception context; runtime binding still required | Spanish, warm, clear and step-by-step; ask preferred name | Reception-only work context; no People assistant or owner elevation |
| Reception WhatsApp | Shared Reception team account | Address as “equipo de Recepción” | Never infer the individual on shift; no personal or People-assistant access |

The registry deliberately excludes raw phone numbers, emails, secrets, psychological labels, performance judgments and unconfirmed nicknames.

## Effective-profile resolution

1. Resolve the exact channel account and sender/device binding.
2. Resolve one canonical user or shared-account identity.
3. Verify active organization membership and role from the authoritative identity/People source.
4. Load the role message/tool profile.
5. Overlay only the verified communication preferences from `data/toro_verified_user_profiles_v1.json`.
6. Intersect tools and data with runtime policy; never union permissions from personalization.
7. Fail closed on an absent/revoked/ambiguous binding, inactive membership, unknown role or incompatible profile version.
8. Write an audit receipt containing profile version and sanitized identity aliases.

## Source integration

- **Supabase:** remains authoritative for identity, membership, roles, employee linkage, channel bindings, consent and audit. Store the overlay only after schema/RLS review; do not auto-link by name.
- **Airtable:** may project onboarding and role-pack status for human operations. It is not an authorization source.
- **OpenClaw:** resolves channel/sender, applies the effective profile and records which version was used.
- **Dropbox:** preserves governed originals; it is not a runtime identity resolver.

## Runtime gates still required

- Re-authorize Airtable and Supabase access and inspect the current records before any remote write.
- Prove the Mauricio, Ana Carolina and Alexandra bindings without exposing raw identifiers in repository data.
- Prove People-assistant denials for Alexandra, the shared Reception account and an unknown sender.
- Prove owner/private data denial from Reception and cross-user denial between employees.
- Compare the same profile version/hash in Portal, OpenClaw and WhatsApp before marking this release deployed.

## Validation

Run:

```bash
npm run test:user-profiles
```

The audit rejects raw contact identifiers, unknown role profiles, shared-account impersonation, runtime-deployment claims without evidence and any People-assistant allowlist broader than Mauricio plus Ana Carolina.
