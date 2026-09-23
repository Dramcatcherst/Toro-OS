# TERE / WeSpeak Alert Baseline — 2026-09-14 to 2026-09-23

**Purpose:** Product Proof baseline for human-escalation workload  
**Source:** connected operational mailbox, aggregate counts only  
**Privacy:** no guest names, phone numbers, reservation IDs, payment details or conversation text are stored here  
**TERE V4 quality claim:** NONE — this period predates or overlaps pre-V4 behavior and is not evidence of V4 consumption

## Observed alert volume

Date window:
- 2026-09-14 through 2026-09-23

Total WeSpeak alert messages:
- **83**

Breakdown:
- requires human advisor: **50**
- in-stay guest problem: **15**
- payment-information request: **7**
- reservation creation / reservation request: **5**
- reservation cancellation or modification: **4**
- maximum-stay exceeded: **2**

Total:
- **83**

## Interpretation

This baseline measures **human escalation demand**, not guest satisfaction or AI quality.

Useful derived metrics for Product Proof:
- advisor-escalation share: 50 / 83 = 60.2%;
- in-stay problem share: 15 / 83 = 18.1%;
- payment-information share: 7 / 83 = 8.4%;
- reservation-intent share: 5 / 83 = 6.0%;
- reservation-change/cancel share: 4 / 83 = 4.8%;
- stay-limit share: 2 / 83 = 2.4%.

The first optimization target is not “reduce all escalations.”

Some escalations are correct and should remain human-gated, especially:
- payment verification;
- reservation modification/cancellation;
- sensitive exceptions;
- uncertain live availability/price;
- material service recovery.

The useful target is:

> reduce avoidable escalations while preserving correct human escalation for sensitive or authority-dependent cases.

## Post-V4 comparison

Do not compare against this baseline until:
1. TERE V4 runtime consumption is verified;
2. a clean post-V4 measurement window exists;
3. alert taxonomy remains comparable;
4. changes in occupancy/message volume are considered.

Recommended post-V4 metrics:
- alerts per 100 guest conversations;
- advisor escalations per 100 conversations;
- avoidable vs necessary escalation rate;
- repeated handoff rate;
- time to human resolution;
- guest issue re-open rate;
- quote-to-human-handoff rate;
- payment-sensitive handoff correctness;
- false “current truth” response count.

## Current conclusion

WeSpeak is operationally active and generating meaningful human workload.

This baseline gives TORO a real pre-verification reference point, while preserving the rule that older activity does not prove TERE V4 consumption.
