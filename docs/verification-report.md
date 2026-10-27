# Manywise Verification Report

**Date:** 27 October 2026  
**Build tested:** Next.js 16.4.3 production build  
**Mode:** Credential-free local product demo; external Supabase delivery not asserted

## Result

The implemented local product journey passed strict type checking, zero-warning lint, production compilation/prerendering, and browser automation at the required mobile, tablet, and desktop widths. The final focused browser regression produced **0 console errors, 0 failed requests, and 0 HTTP responses at or above 400**.

This report does not claim that credential-dependent Supabase Auth, production persistence, real multi-user Realtime delivery, email/push delivery, or moderator operations were tested. Those boundaries are implemented/configured but require a provisioned project and operational environment.

## Commands run

```bash
pnpm typecheck   # exit 0
pnpm lint        # exit 0; zero warnings
pnpm build       # exit 0; 25/25 static pages generated
```

The production build classified public/static, partial-prerendered dynamic-detail, and auth-callback routes successfully. No test suite was added.

## Principal journey exercised

1. Loaded the branded homepage.
2. Selected **Join thoughtfully** and entered the private local demo flow.
3. Completed all three onboarding stages: profile, interests/goals, and pace/privacy/guide consent.
4. Browsed Rooms and opened Quiet Corner.
5. Opened the composer, entered a title/body/tags, inspected Preview, and published.
6. Opened the new discussion, reacted, replied, and reacted to a reply.
7. Opened live chat, sent a message, replied with context, and reacted.
8. Searched by phrase/member, opened a member profile, followed, requested contact, reported, and blocked.
9. Edited privacy/profile settings, saved, reloaded, and confirmed persistence.
10. Exercised data export/reset/delete affordances and verified ordinary members do not receive steward controls.

## Issues found and fixed during browser QA

- Community Guide consent could be bypassed after unchecking it; completion now blocks with a clear message.
- Direct onboarding reload could initialize from defaults before demo-state hydration and overwrite a saved profile; onboarding now waits for hydration.
- The visible Command/Ctrl+K search affordance did not focus search, and `/search?q=` did not initialize the query; both now work.
- Zero-count message reactions lacked an accessible name; every chat reaction now includes the member name and pressed-state meaning.
- Reports originally retained only a target identifier; validated reason, optional detail, and created-at data now persist, with migration for older local state.
- A moderation notification linked to a nonexistent settings section; it now targets Privacy & safety.
- Post-review polish made conversation requests persist, added unblock controls, made chat leaving visibly remove a room for the visit, clarified the onboarding leave label, and removed a placeholder source link.

## Responsive and interaction inspection

### 390px mobile

- No document-level horizontal overflow on landing, onboarding, home, rooms, discussion, chat, search, member, or settings screens.
- Sticky onboarding actions stayed within the viewport.
- Mobile navigation occupied the viewport bottom without hiding the detected active controls.
- The composer remained horizontally contained; Escape restored focus to its trigger.
- Long headings, post excerpts, filters, message controls, and settings rows wrapped or scrolled intentionally.

### 768px tablet

- Room and chat layouts reflowed without document overflow.
- Composer bounds remained within the 768×900 viewport; ten sequential Tab presses stayed inside the modal focus scope.
- The mobile navigation and live composer remained usable at touch sizes.

### 1440px desktop

- The three-column application shell retained a focused feed width, stable sidebar, and contextual right rail.
- The report dialog remained fully inside the viewport and opened with focus on its labeled Close control.
- Feed hierarchy, metadata, finite ending, and room color cues remained coherent without dashboard/card nesting overload.

## Accessibility observations

- Accessibility snapshots exposed named primary/mobile navigation, semantic landmarks, labeled forms, selected tabs, pressed reactions, and dialog controls.
- A keyboard-first skip link becomes visible on focus and moves to `#main-content`.
- Focus indicators use a three-pixel high-contrast treatment.
- Dialogs trap focus and restore it after Escape.
- `prefers-reduced-motion` removes nonessential transitions and smooth scrolling.
- Color supports but does not solely communicate active/read/joined states.

Manual launch readiness still requires NVDA/JAWS/VoiceOver testing, zoom/high-contrast validation, and paid testing with disabled participants.

## Security and honesty checks

- Ordinary local-demo members receive an access-denied view at `/moderation`; production role checks run server-side.
- User-authored text renders as escaped React content, not injected HTML.
- CSP/security headers are configured.
- Demo/cloud status is explicit; local chat does not pretend to deliver to real members.
- Seed identities and conversations are fictional and use reserved `.invalid` addresses.
- Service-role credentials appear only as server-only placeholders/documentation.
- Local data can be exported, restored, or deleted; production account jobs are labeled as a remaining integration.

## Artifacts

Screenshots are committed under [`docs/screenshots`](screenshots):

- [`manywise-landing-1440.png`](screenshots/manywise-landing-1440.png)
- [`manywise-landing-390.png`](screenshots/manywise-landing-390.png)
- [`manywise-community-home-1440.png`](screenshots/manywise-community-home-1440.png)
- [`manywise-community-home-390.png`](screenshots/manywise-community-home-390.png)
- [`manywise-room-768.png`](screenshots/manywise-room-768.png)
- [`manywise-chat-768.png`](screenshots/manywise-chat-768.png)
- [`manywise-landing-accessibility.md`](screenshots/manywise-landing-accessibility.md)
- [`manywise-community-home-accessibility.md`](screenshots/manywise-community-home-accessibility.md)

The screenshots were recaptured in a clean pointer state. The keyboard skip link is translated off-canvas in these artifacts and becomes visible only when focused.

## Remaining limitations

See the README’s **Known limitations** section. Most importantly, browser QA covered the coherent local product implementation. Provisioned Supabase policy tests, real concurrent accounts, storage abuse cases, distributed rate limiting, email flows, production export/deletion, moderation operations, backup restoration, and incident procedures remain required before launch.
