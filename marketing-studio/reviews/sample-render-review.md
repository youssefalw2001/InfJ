# Launch Batch Render Review

**Date:** 27 October 2026
**State:** DRAFT-READY FOR HUMAN DECISION — NOT PUBLICATION APPROVAL

## Artifacts reviewed

- 10 standard H.264 MP4 drafts
- 10 reduced-motion H.264 MP4 alternatives
- 10 poster frames at 1080×1920
- SRT, VTT, and complete text transcripts for all 10 scripts
- `reviews/render-manifest.json`, which binds all 30 outputs, 11 renderer source files, script inputs, and approved assets to SHA-256 hashes

Bundled `ffprobe` inspection confirmed that every MP4 contains one 1080×1920 H.264 video stream at 30fps, lasts exactly 15 seconds, and contains no audio stream.

## Visual findings

All ten poster frames were inspected at 1080×1920. Signal Test preserves a clear hook, four-choice scan, selected state, CTA, and caption region. Scene Under the Scene keeps the original adult cast, dialogue/subtext comparison, question, CTA, and captions in separate regions. Social Code retains a strong kinetic headline, supporting logic, question, CTA, and caption region.

The first Scene Under the Scene render exposed a collision between its second interpretation card, question, CTA, and caption. The character panel and card spacing were reduced, then all scene videos and posters were rerendered. The final ten posters show no detected clipping or component collision.

Every template retains the Room Zero grid, raw borders, original mark, lime/cyan/amber signal accents, prominent `ADULTS 18+ // DRAFT` status, and a larger footer disclosure.

## Motion and accessibility

Standard variants derive all movement deterministically from the frame number. The background grid drifts 48px over 15 seconds, the low-opacity scan passes every six seconds, and the status dot uses a gradual three-second pulse. No rapid flashing, strobing, sudden full-screen luminance change, or audio is present.

Every script also has a reduced-motion MP4. Those variants disable grid drift, scan movement, pulsing, spring entrances, zoom, translations, selection cycling, and divider animation. Caption text still changes at its documented cue boundaries so the full message remains available. Complete transcripts include title, hook, support copy, question, choices, CTA, destination, audience, and draft status.

## Safety and provenance

- The character image is the repository-original, explicitly adult `public/after-class-cast.svg`, now labeled as a late Room Zero session rather than a school setting.
- No anime franchise material, third-party footage, downloaded font file, voice, music, or sound effect is included.
- The scripts contain no diagnosis, personality verification, rarity claim, superiority claim, offensive-security instruction, fake urgency, or automatic publishing action.
- Platform copy identifies the 18+ audience and binds each CTA to the same reviewed route as its script.
- Platform credentials are absent. Publication remains a manual human action.
- The repository owner must confirm the applicable AI-service and platform terms before commercial publication, as recorded in `assets/PROVENANCE.md`.

A human should watch the selected complete MP4 on an actual phone, confirm the exact post copy and destination, and document any licensed audio before publication.
