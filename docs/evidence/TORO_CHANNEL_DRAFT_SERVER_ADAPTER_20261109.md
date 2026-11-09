# Channel draft server adapter: prepared, not activated

The existing ledger already defines authorization, scoped drafts, CAS, readback and replay. Its reviewed SQL package defines three invoker RPCs, but that database release is still absent. This change binds those exact RPC names and arguments to the existing canonical store adapter; it does not create another ledger or expose a route.

`createChannelDraftServerStore` requires an injected RPC function and a server-owned resolver of the current canonical actor and case context. It allocates no client, credential, worker or provider connection. Each call checks the existing `conversation.read` or `conversation.write` capability and all eight scope keys before the RPC, then resolves access again before releasing content or confirmation. Human takeover blocks CAS. Historical input remains read-only. Request values are detached before awaiting access.

The existing ledger continues to validate returned records and reconcile a lost CAS response by the same operation key. The new synthetic tests cover exact RPC parameters, one-effect save/readback/replay, lost-response reconciliation, eight scope mismatches, concurrent revocation, takeover, missing write capability and historical input. They are in the existing `channel-ledger.test.ts` entry already included by `npm test`; no new test runner or dependency is added.

Synthetic results do not prove a real database write, channel integration or durable delivery. The factory is not mounted by Portal, HTTP, MCP or OpenClaw. Activation requires the separate database release, a reviewed existing privileged caller, a real canonical access resolver, an authorized case and actor, recovery evidence and explicit scope acceptance. No message is sent.

Runtime preflight at this pass found no draft table or draft RPCs. The reviewed SQL files are unchanged. UI acceptance and production publication remain separate gates. Rollback is to revert this focused adapter commit before any future caller activation; there are no database or provider effects in this unit.
