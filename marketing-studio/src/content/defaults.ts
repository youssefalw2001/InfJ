import type { VideoScript } from "../schema/video-script";

const base = {
  schemaVersion: 1 as const,
  campaignId: "room-zero-launch",
  variantId: "a",
  fps: 30 as const,
  durationFrames: 450 as const,
  reducedMotion: false,
  locale: "en" as const,
  publishTargets: ["tiktok", "instagram-reels", "youtube-shorts", "x"] as VideoScript["publishTargets"],
  status: "draft" as const,
  legal: ["MANYWISE // ROOM ZERO // ADULTS 18+ // DRAFT"],
};

export const defaultSignalTest: VideoScript = {
  ...base,
  id: "signal-test-default",
  template: "signal-test",
  title: "Which channel opens at 02:13?",
  eyebrow: "SIGNAL TEST // 001",
  hook: "It is 02:13. Which channel are you opening?",
  supporting: ["Choose the signal you would follow."],
  question: "Where does your attention go first?",
  choices: ["Character motives", "Unfinished art", "Strange theories", "Quiet company"],
  cta: { label: "RUN SIGNAL CALIBRATION", destination: "/#club-finder" },
  accent: "signal",
  captions: [
    { from: 20, to: 120, text: "It is 02:13. Which channel are you opening?" },
    { from: 120, to: 330, text: "Character motives, unfinished art, strange theories, or quiet company?" },
    { from: 330, to: 440, text: "Run Signal Calibration." },
  ],
  assets: [],
  analyticsTags: ["signal-test", "channel-routing"],
};

export const defaultSceneUnderScene: VideoScript = {
  ...base,
  id: "scene-under-scene-default",
  template: "scene-under-scene",
  title: "The line they avoided",
  eyebrow: "THE SCENE UNDER THE SCENE // 001",
  hook: "The most important line was the one they avoided saying.",
  supporting: ["DIALOGUE // Nothing changed.", "SUBTEXT // The decision had already been made."],
  question: "What did you notice first?",
  choices: [],
  cta: { label: "ENTER ANIME ANALYSIS", destination: "/spaces/anime-and-character-study" },
  accent: "cyan",
  captions: [
    { from: 20, to: 145, text: "The most important line was the one they avoided saying." },
    { from: 145, to: 320, text: "The dialogue said nothing changed. The timing said the decision was already made." },
    { from: 320, to: 440, text: "What did you notice first?" },
  ],
  assets: [{ src: "after-class-cast.svg", alt: "Four original adult Manywise characters in a late Room Zero conversation", provenance: "original" }],
  analyticsTags: ["scene-analysis", "anime-analysis"],
};

export const defaultSocialCode: VideoScript = {
  ...base,
  id: "social-code-default",
  template: "social-code",
  title: "Understanding is not approval",
  eyebrow: "SOCIAL CODE // 001",
  hook: "Understanding the motive does not require approving the decision.",
  supporting: ["You can read the pattern.", "You can still protect the boundary."],
  question: "Which character taught you that?",
  choices: [],
  cta: { label: "OPEN SOCIAL CODES", destination: "/spaces/relationships" },
  accent: "amber",
  captions: [
    { from: 20, to: 170, text: "Understanding the motive does not require approving the decision." },
    { from: 170, to: 320, text: "You can read the pattern and still protect the boundary." },
    { from: 320, to: 440, text: "Which character taught you that?" },
  ],
  assets: [],
  analyticsTags: ["social-code", "boundaries"],
};
