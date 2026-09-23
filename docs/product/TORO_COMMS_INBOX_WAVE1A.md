# TORO Comms — Inbox Wave 1A

**Status:** IMPLEMENTATION CANDIDATE  
**Date:** 2026-09-23  
**Master:** TORO Brain General Plan  
**Canonical sources:** `public.team_messages` + `public.team_message_read_states`

## Goal

Absorb the read-only DreamTeam internal messaging inbox into TORO Comms without creating a second chat database or depending on OpenClaw.

## Scope

Wave 1A provides a governed organization inbox model.

It:
- requires active organization context;
- supports employee and non-employee organization members;
- reads existing `team_messages` under current RLS;
- reads only the current user's `team_message_read_states`;
- normalizes known channels;
- preserves unknown channels as `other`;
- computes unread messages after `last_read_at`;
- excludes the user's own messages from unread count;
- narrows privileged DM visibility to the user's own sent/received DM projection;
- exposes only safe attachment metadata.

## Existing channels

Current canonical/RLS channels:
- `general`;
- `operacion`;
- `rrhh`;
- `dm`.

Future logical TORO Rooms will later abstract transport/channel IDs. Wave 1A does not add channel tables.

## Privacy rule

Database RLS intentionally allows ADMIN/RRHH/GERENCIA to inspect some DMs for governed workflows.

The personal inbox is narrower.

It shows a DM only when:
- current user sent it; or
- it targets the current linked employee.

Cross-user privileged DM review belongs in a separate audited administrative surface.

## Attachment rule

Wave 1A may expose:
- attachment name;
- attachment-present boolean.

It does not expose:
- storage path;
- raw attachment JSON;
- tokens;
- arbitrary embedded fields.

## Unread rule

Unread:
- message timestamp > current user's last_read_at;
- message is visible in the personal inbox projection;
- message was not sent by the current user.

No read-state write occurs in this wave.

## Explicitly excluded

- sending messages;
- editing/deleting messages;
- marking inbox read;
- notifications preference writes;
- logical TORO Room tables;
- OpenClaw/WhatsApp bindings;
- Slack/Teams bindings;
- message→task/incident/handoff;
- retention changes;
- attachment download/storage actions.

## Why read first

Current communication tables already contain valid RLS but have a very small current dataset.

Read-first lets TORO verify:
- identity/context;
- channel privacy;
- DM narrowing;
- attachment projection;
- unread semantics;
before enabling any write or transport automation.

## Exit gate

Before merge:
- Vitest PASS;
- lint PASS;
- build PASS;
- Vercel PASS;
- branch aligned with Phase 1;
- no production mutation.

After merge:
- build read-only `/toro/mensajes` surface;
- then add read-state update as a separate reversible capability;
- sending remains a later wave until channel/write policy is reviewed.
