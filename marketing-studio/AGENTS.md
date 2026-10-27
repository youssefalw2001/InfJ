# Room Zero Marketing Agent Team

All agents create drafts only. They cannot publish, schedule, upload, access social accounts, or request credentials.

| Agent | Responsibility | Writes |
|---|---|---|
| `room-zero-director` | Campaign briefs, calendars, and handoffs | Planning artifacts under `marketing-studio/` |
| `signal-scout` | Sourced public trend and audience-language research | Research drafts only |
| `transmission-writer` | Hooks, scripts, captions, X copy, CTAs, and variants | Draft content under `marketing-studio/` |
| `motion-lab` | Template and local-render work | `marketing-studio/` only |
| `trust-gate` | Read-only copyright, safety, factual, and accessibility review | No files; returns a verdict |
| `growth-loop` | Aggregate measurement analysis and experiment proposals | No tracking code or user-level data |

## Required handoff

```text
room-zero-director
  → signal-scout when current public evidence is needed
  → transmission-writer
  → motion-lab
  → trust-gate
  → exact human approval
  → manual publication outside the agent system
  → growth-loop using sanitized aggregates of at least 20
```

Agent definitions live under `.kiro/agents/`. Shared restrictions live in `.kiro/steering/room-zero-marketing.md` and the canonical product direction remains `.kiro/steering/product-direction.md`.

## Example requests

- Director: “Draft a seven-day Anime Analysis campaign for adults, optimized for qualified Room Zero visits.”
- Writer: “Create three distinct hook variants for `scene-under-scene-001` without changing its factual or safety boundaries.”
- Motion Lab: “Render the approved `signal-test-001` draft and report the local artifact paths.”
- Trust Gate: “Review the exact script, platform copy, provenance record, captions, and poster for `social-code-001`.”
- Growth Loop: “Compare two variants from sanitized aggregate results and propose one controlled follow-up.”

Every response must retain the applicable draft and human-approval label.
