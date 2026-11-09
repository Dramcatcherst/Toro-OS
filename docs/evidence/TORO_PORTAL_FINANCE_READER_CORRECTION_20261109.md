# Portal Dinero: reuse the authorized reader

The preceding candidate added a direct `finance.reconciliations` reader. Its authenticated access and consumption were not demonstrated. The existing financial transport has a narrower role contract and already handles source projection and session revalidation.

This correction removes the speculative reader and its unused UI/model, and moves the existing authorized attention projection from Hoy into Dinero. The page still reads that projection once, through its existing feature flag, role guard and selected transport. The component remains mounted once, avoiding duplicate element IDs and redundant source requests. Manual cash counting remains local and separate.

Verification must cover placement exactly once, absence when no projection is authorized, full CI/lint/build, and preview for the resulting SHA. Authenticated source access, mobile/keyboard acceptance and production publication remain separate pending gates.

The prior 10+10 receipt is superseded in its counting: its controls describe one reader feature, and it did not prove an operational integration. This unit is one functional correction (remove an unsupported source/role path) and one interface simplification (use the existing authorized projection in Dinero). No new runtime integration is claimed.

The producer's existing finance handoff is read and mapped as requirements only. This limited projection does not implement card, payroll, tax, asset or full reconciliation controls. Those scopes keep their existing owners and acceptance criteria.

Rollback: revert only this correction commit, preserving later changes. No schema, grant, provider, financial data or production change is part of this unit. Removed files were introduced by the immediately preceding candidate and remain recoverable from Git history.
