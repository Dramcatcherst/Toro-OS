# TERE Active Configuration Fingerprint — 2026-09-23

**Source:** Supabase `private.tere_configuration`  
**Purpose:** provide a deterministic, secret-free expected configuration identity for TERE runtimes.

## Result

- active configuration rows: **7**
- expected config version: `TERE-CONFIG-BUNDLE-v2-20260923`
- SHA-256: `08ceb3b3bd402818d5c6a3f015ce17618df4cb8b7172b8b7eb3151d01361b457`

Runtime-manifest format:

`sha256:08ceb3b3bd402818d5c6a3f015ce17618df4cb8b7172b8b7eb3151d01361b457`

## Active keys included

1. `room_extra_info_master_es`
2. `room_number_required_on_all_room_assets`
3. `tere-child-extra-bed-policy-20260917`
4. `tere-dream-language-guideline`
5. `tere-identity-short-core`
6. `tere-openclaw-demo-disclosure-once-20260921`
7. `tere-presend-truth-gate-20260918`

## Normalization

Rows are sorted by `config_key`.

For each ACTIVE row the hash payload includes:
- config_key;
- section;
- title;
- language;
- priority;
- full content;
- applies_to.

Fields are joined with fixed control-character separators before SHA-256.

Excluded deliberately:
- UUID;
- created_at / updated_at;
- source notes;
- source metadata;
- last_reviewed;
- status (the query already scopes to ACTIVE).

This avoids hash churn from provenance/metadata edits while changing the hash whenever active behavior/content changes.

## Security

The evidence file records only:
- row count;
- config keys;
- hash;
- normalization method.

It does **not** copy the private configuration content.

## Runtime interpretation

This is an **expected configuration fingerprint**, not runtime proof.

WeSpeak/OpenClaw TERE remain UNVERIFIED until the runtime itself can provide/acknowledge:
- config version `TERE-CONFIG-BUNDLE-v2-20260923`;
- matching SHA-256;
- canonical skill identity `tere-revenue`;
- loaded playbooks;
- A0–A6 workflow authority;
- runtime identity/build;
- 10/10 TERE evaluation with zero critical failures.

A mismatch means DRIFT/UNVERIFIED; it does not authorize TORO to overwrite the runtime.
