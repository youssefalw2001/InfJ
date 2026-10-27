# Privacy-safe Marketing Measurement

**Status:** DRAFT — HUMAN APPROVAL REQUIRED BEFORE USE

Only sanitized aggregate results with a sample size of at least **20** may enter this repository. Aggregate and remove identifying fields before transferring an export into the workspace. Do not place raw platform or product exports here, even in an ignored directory.

## Metric definitions

- **Impressions:** platform-reported displays.
- **Video starts:** playback starts under the platform's documented definition.
- **Three-second views:** views reaching three seconds when the platform supplies that measure.
- **Quarter/half/three-quarter views:** aggregate progress milestones.
- **Completions:** views reaching the platform's completion threshold.
- **Average watch seconds:** aggregate watch time divided by qualifying starts under the source definition.
- **Link clicks:** aggregate clicks on the approved campaign link.
- **Access requests:** aggregate completed Room Zero access actions attributed by approved UTM reporting.

Record the platform definition and reporting window before sanitization. Do not compare unlike metrics as though they were identical.

## Prohibited data

Do not store member IDs, handles, names, email addresses, IP addresses, device IDs, cookies, session records, direct messages, private-post text, personality inferences, precise locations, free-text notes, or row-level events. Do not join platform and product data to identify people. Do not analyze groups smaller than 20.

The committed JSON Schema restricts placement to a short controlled vocabulary and rejects additional fields. The example is explicitly fictional and must never be represented as performance.

The `growth-loop` agent may propose experiments from sanitized aggregates. It cannot instrument tracking, access accounts, schedule campaigns, or publish. A human controls every external action.
