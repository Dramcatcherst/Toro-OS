# TORO Executive Brief — Owner Proof V1

**Date:** 2026-09-23  
**Workflow:** Product Proof #1  
**Surface:** `/my-toro?focus=executive.brief`  
**Mode:** real owner use / read-only  
**Owner:** Mauricio Fernández Toro  
**Purpose:** prove usefulness, not merely page availability

## Test

Use the Executive Brief during one real management cycle.

Do not create a synthetic decision merely to pass the test.

### Before opening
Record:
- what Mauricio is trying to understand/decide;
- whether he would otherwise need to open another system first.

### During
Observe:
- time to first useful item;
- number of brief items reviewed;
- any irrelevant item;
- any obviously missing material issue;
- whether another system/source had to be opened before acting.

### Outcome
Record:
- decision/action produced;
- owner intervention required;
- whether TORO reduced search effort;
- whether the brief changed priority or merely confirmed it;
- whether the item remained unresolved because of an external evidence/approval blocker.

## Minimum evidence packet

```yaml
tested_at:
owner: Mauricio
real_management_cycle: true
goal:
time_to_first_useful_item_seconds:
items_reviewed:
other_systems_opened_before_decision:
decision_or_action:
owner_interventions:
irrelevant_items:
material_omissions:
usefulness:
  value: useful | partly_useful | not_useful
  note:
```

## Pass criteria for VERIFIED

A single owner-use cycle may promote the workflow from RUNNING to VERIFIED only when:
- real management context is confirmed;
- source-backed brief loaded correctly;
- at least one useful item was identified;
- no material hallucinated item was observed;
- the resulting decision/action is recorded;
- any material omission is documented.

## MEASURED requires more

Do not call the workflow MEASURED from one successful use.

MEASURED requires repeated cycles sufficient to compare:
- time to useful decision;
- systems/screens opened;
- owner interventions;
- irrelevant-item rate;
- material-omission rate.

## Failure is useful evidence

If the brief is noisy, misses a critical issue, or does not reduce effort:
- keep workflow RUNNING;
- record the miss;
- improve ranking/source logic;
- repeat.

Do not alter the evidence to obtain a PASS.
