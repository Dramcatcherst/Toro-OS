# Directory write contract — 08/11/2026

Scope: source-integrity release for Task1 of the accepted Portal integration plan in [PR398](https://github.com/Dramcatcherst/Toro-OS/pull/398). The existing Portal redesign remains in that PR; this database control has a separate, narrowly scoped release. This is a source-integrity draft, not an installed database control or authenticated Portal acceptance.

## Problem and producer

The existing complete-catalogue RPC rejects the entire source when proposed `candidate.*` records enter contractual `link_directory.entries`. Earlier repair preserved the 244 contractual records and moved the 20 proposals to `candidate_entries`. That repair alone does not prevent recurrence.

Repository search found only directory readers and explicit SQL maintenance drafts; no application directory writer was found. Live metadata at this cut reported no non-internal trigger on `operations.knowledge_items`. The observed candidate-producing historical edit was a direct source update, documented in the existing [Tripadvisor audit](TRIPADVISOR_NATIVE_AUDIT_2026-10-17.md); this does not prove the identity of every current external producer.

The current canonical source metadata was reread: version2.8, 244 entries, same fingerprint as the earlier repair. The installed catalogue RPC is invoker and its body matches the versioned source fingerprint. No raw directory, account metadata, credentials or source payload is included here.

## Prepared change

- [Apply draft](../../supabase/drafts/dreamcatcher_tool_directory_write_guard_v1.sql): one invoker trigger validates existing direct writes for this exact organization/property/knowledge key. It rejects candidate IDs, duplicates, invalid container/count or field types before commit. Blank destinations remain allowed; the RPC's existing 1–1000 bound is retained. This does not change the current frontend's separate 244-item contract.
- Valid documents are returned unchanged, including order, per-account destinations, metadata and proposal content. Proposals must be retained outside `entries`; the guard never silently moves or discards them.
- No new writer, table with durable data, grant, RLS policy, directory repair, timestamp refresh or RPC change. The private trigger function is not callable by application roles. Other knowledge/org/property scopes retain their existing behavior.
- Before installation, a temporary private copy runs the exact trigger against the current source. A bounded table lock closes the validation/installation race. Any failed preflight aborts the transaction; no canonical no-op update or audit event is used.
- [Rollback](../../supabase/drafts/dreamcatcher_tool_directory_write_guard_v1_rollback.sql) checks the full function definition, body, existing migration owner, exact ACL and trigger identity/events/columns before removing only its unchanged objects, without cascade or source edits. Changed objects require investigation.

## Verification

`tests/directory-write-contract.test.mjs` executes both shipped SQL files in pinned PGlite0.5.8 PostgreSQL WASM, with synthetic data only. External QA dependency follows the repository's existing local SQL-test convention and is not a production dependency.

RED observed before implementation: candidate insertion was accepted; the rejection assertion failed. Initial GREEN:9/9. An independent review then reproduced an Important rollback gap for changes outside the function body. Its regression failed before the fix; the final suite adds configuration, volatility, parallelism, ownership and grant drift checks that preserve changed objects. Cases also cover atomic rejection/source preservation, valid edits, malformed/duplicate data, insert and scope-changing update, unrelated scopes, finite size bounds, existing authenticated writer/RLS/function privileges, replay refusal and drift-protected rollback/reapplication. CI runs this same SQL suite before lint/build.

Final SQL suite:10/10 PASS, including the reviewer regression. Full repository tests, lint/types/build passed on the Portal base; the independently extracted release reruns its own CI. Lint has one existing unused-argument warning in the OAuth metadata route, zero errors. Passing local SQL does not establish installation or authenticated consumption.

## Release and continuation

The apply/rollback SQL remains DRAFT and UNAPPLIED. Review exact bytes, reconcile current source/trigger/RPC metadata, install via the authorized migration path with the bounded preflight, and read back function/trigger fingerprints plus unchanged source/ACL/RLS. Do not replay the earlier source repair or infer a need for new permissions.

The exact `b7b8731` Vercel preview was READY; an interactive check in this continuation reached Vercel authentication. No protection was disabled and no credentials were requested again. Browser acceptance of the compact catalogue, actual destinations and roles remains a separate pending gate.
