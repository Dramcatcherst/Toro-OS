# TORO OS Operational Data Mapping v0.2

Source: Airtable record `TORO OS Airtable Data Mapping v0.2`.

## Table To Module Mapping

- 01 Source Registry -> Data Brain / Source Authority Monitor
- 02 Properties -> Workspaces / Business Map
- 03 Villas -> Business Map / Units / Hospitality Template
- 04 Rooms -> Business Map / Units / Room Detail / Content Control
- 05 Sellable Units -> Business Map / Revenue Units / Kross Control Center
- 06 Amenities -> Business Map / Content Control / Guest Promise Guardrails
- 06A Experiences -> Campaign Studio / Content Control / Upsell / Guest Journey
- 07 Kross References -> Kross Control Center / Tool Hub
- 08 Assets Registry -> Assets Curation Pipeline / Campaign Studio / Website Control
- 09 Website Pages -> Content & Website Control
- 10 Tasks -> Tasks & Approvals / Builder Queue / Operational Queue
- 11 QA Conflicts -> Data Brain / QA Center / Approval Queue
- 12 Governance Rules -> Governance / Rules Engine / Agent Guardrails
- 13 Guest Communication -> Communication Center / WeSpeak / WhatsApp / Tere
- 14 Guests / CRM Light -> Customer/Guest Context; no sensitive/private/legal/payment data
- 15 Reservations Snapshot -> Reservations Snapshot / Morning Command / Operations; referential only
- 16 Operations -> Operations Floor / Follow-up / Guardrails
- 17 Staff & Providers -> Staff Directory / Provider Directory / Operations
- 18 SOPs / Policies -> Staff Coach / Governance / Workflow Guidance
- 20 Kross BE Content Master -> Kross Control Center / Booking Engine Content / Conversion QA
- 21 Website V11 Conversion OS -> Content Control / Conversion Engine / Builder Priorities
- 30 V11 Master Control Center -> Builder Control / Website Control / QA Gates
- 31 TORO OS Build Blueprint -> Product Blueprint / Codex Handoff / Build Governance

## Universal Object Model

Properties/Workspaces, Units/Products, Customers/Guests, Orders/Bookings/Reservations, Assets, Messages, Tasks, Rules, Tools, Workflows, Approvals, Campaigns, Operations, Staff/Providers.

## Required UI Card Convention

Every operational card should show as applicable: name/key, source, status, risk, confidence, owner, last updated/sync, requires review, next action, related tool, related entity and approval state.
