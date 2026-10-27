# Manywise // Room Zero Marketing Studio

A draft-only, JSON-driven short-form video system for the original Room Zero brand. It produces deterministic 1080×1920, 30fps, 15-second compositions with standard and reduced-motion MP4s, burned-in captions, SRT/VTT tracks, complete text transcripts, and poster frames. Nothing in this package publishes, schedules, uploads, or accesses a social account.

## Templates

- `RoomZeroSignalTest`: interactive channel-routing questions.
- `RoomZeroSceneUnderScene`: original-cast character and subtext analysis.
- `RoomZeroSocialCode`: high-contrast kinetic observations and discussion prompts.

## Commands

Run from the repository root:

```bash
pnpm studio:validate
pnpm studio:captions
pnpm studio:render signal-test-001
pnpm studio:render:all
pnpm studio:render:manifest
pnpm studio:render:samples
pnpm studio:verify
```

`pnpm studio` opens Remotion Studio and is intentionally not run by automated agents because it is a long-running process. Local MP4 drafts and posters are ignored by Git. The renderer reads approved assets from the repository's `public/` directory without copying them.

## Review boundary

Every artifact remains `DRAFT — HUMAN APPROVAL REQUIRED BEFORE PUBLISHING`. Route candidates through `trust-gate`, then have a human review the exact render, caption file, post copy, source rights, and destination. Human approval does not authorize an agent to publish.

No audio is bundled. Add music, narration, or effects only after documenting commercial-use rights in `assets/PROVENANCE.md`.

## Rendering architecture

The Node renderer bundles the project, selects a composition with the script as input props, and renders H.264 MP4 plus a PNG poster. This follows Remotion's official [`bundle()`](https://www.remotion.dev/docs/bundle), [server-side rendering](https://www.remotion.dev/docs/ssr-node), and [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) documentation. Animations derive from frame numbers so rerenders are deterministic.

Content was rephrased for compliance with licensing restrictions.
