import type { ChatMessage, ChatRoom, DemoState, Discussion, Member, NotificationItem, Reply, Space } from "./types";

export const members: Member[] = [
  { handle: "mira-lantern", name: "Mira Lantern", initials: "ML", pronouns: "she/her", location: "North Coast · UTC−7", bio: "Quiet-systems designer, tea annotator, and collector of questions that deserve more than a quick answer.", interests: ["inner life", "books", "slow rituals"], color: "clay", joined: "March 2026" },
  { handle: "jonah-moss", name: "Jonah Moss", initials: "JM", pronouns: "he/they", location: "Alder City · UTC−5", bio: "Makes small drawings, tends an unruly balcony garden, and lets unfinished work stay useful.", interests: ["creative practice", "nature", "rest"], color: "moss", joined: "April 2026" },
  { handle: "noor-vale", name: "Noor Vale", initials: "NV", pronouns: "they/them", location: "Vale District · UTC+0", bio: "Librarian and careful listener. Hosting conversations where nobody has to perform certainty.", interests: ["friendship", "philosophy", "libraries"], color: "indigo", joined: "May 2026" },
  { handle: "sana-reed", name: "Sana Reed", initials: "SR", pronouns: "she/they", location: "Reed Harbor · UTC+1", bio: "Community gardener and facilitator focused on clear boundaries, repair, and unhurried belonging.", interests: ["community care", "purpose", "growth"], role: "steward", color: "ochre", joined: "February 2026" },
  { handle: "theo-harbor", name: "Theo Harbor", initials: "TH", pronouns: "he/him", location: "South Harbor · UTC+10", bio: "Field recorder, volunteer trail steward, and witness to ordinary acts of care.", interests: ["field notes", "service", "sound"], color: "sea", joined: "June 2026" },
  { handle: "lena-finch", name: "Lena Finch", initials: "LF", pronouns: "she/her", location: "Westmere · UTC−8", bio: "Essayist, late-blooming potter, and believer in changing your mind in public with grace.", interests: ["essays", "craft", "honest debate"], color: "rose", joined: "July 2026" },
  { handle: "aya-sori", name: "Aya Sori", initials: "AS", pronouns: "she/they", location: "Hoshi Ward · UTC+9", bio: "Storyboard student, character-arc archivist, and host of the post-credits conversation. Original fictional Manywise member.", interests: ["anime", "character study", "visual storytelling"], color: "sky", joined: "August 2026" },
];

export const spaces: Space[] = [
  { slug: "inner-worlds", name: "Inner Worlds", label: "Self-awareness", description: "Identity, intuition, values, boundaries, and the changing stories we tell about ourselves.", prompt: "What have you been noticing beneath the noise?", color: "clay", memberCount: 326, activeNow: 18, joined: true },
  { slug: "relationships", name: "Relationships", label: "Connection", description: "Friendship, family, partnership, repair, and belonging without losing your edges.", prompt: "Where could curiosity replace mind-reading?", color: "rose", memberCount: 284, activeNow: 12, joined: true },
  { slug: "creativity", name: "Creativity", label: "The studio", description: "Writing, art, music, making, and protecting work before it needs to be useful.", prompt: "What are you making before it has a job?", color: "ochre", memberCount: 241, activeNow: 9, joined: true },
  { slug: "anime-and-character-study", name: "Anime & Character Study", label: "Media club", description: "Character arcs, visual symbolism, comfort stories, craft, and the conversations that begin after the credits.", prompt: "Which character choice are you still thinking about?", color: "sky", memberCount: 186, activeNow: 16, joined: true },
  { slug: "work-and-purpose", name: "Work & Purpose", label: "Vocation", description: "Ethical ambition, contribution, leadership, and work that leaves room for a life.", prompt: "What can this season honestly sustain?", color: "moss", memberCount: 219, activeNow: 7, joined: false },
  { slug: "growth", name: "Growth", label: "Practice", description: "Change paced by curiosity rather than self-punishment, with practical experiments and reflection.", prompt: "What is becoming easier to practice?", color: "sea", memberCount: 198, activeNow: 5, joined: false },
  { slug: "books-and-ideas", name: "Books & Ideas", label: "The reading room", description: "Philosophy, psychology, literature, systems, and the pleasure of a difficult question.", prompt: "What idea are you carrying around?", color: "indigo", memberCount: 303, activeNow: 14, joined: true },
  { slug: "quiet-corner", name: "Quiet Corner", label: "Low tide", description: "Small observations, no-advice listening, gentle check-ins, and company without pressure.", prompt: "What would feel companionable today?", color: "mist", memberCount: 357, activeNow: 21, joined: true },
  { slug: "ask-manywise", name: "Ask Manywise", label: "Open questions", description: "Specific questions for the community, answered from experience rather than type stereotypes.", prompt: "What deserves more than a quick answer?", color: "coral", memberCount: 412, activeNow: 24, joined: true },
];

export const initialDiscussions: Discussion[] = [
  { id: "kindness-needs-boundaries", title: "Which character taught you that kindness can have boundaries?", body: "I keep thinking about the moment a gentle character finally says no—not as a transformation into someone colder, but as proof their care includes themselves. That kind of scene lands differently from a triumphant power-up. It feels quieter and more difficult.\n\nWhich character choice helped you understand that compassion and boundaries can belong together? Please label spoilers and focus on what the scene opened up for you, not a definitive personality diagnosis.", authorHandle: "aya-sori", spaceSlug: "anime-and-character-study", createdAt: "12 min ago", readTime: 4, tags: ["character arcs", "boundaries", "spoilers labeled"], replyCount: 11, reactions: { resonates: 24, thoughtful: 16, support: 4 }, reacted: [], saved: false, followed: true, featured: true },
  { id: "quieter-answer", title: "A two-minute ritual for hearing the quieter answer", body: "I have been trying a tiny pause before decisions: feet on the floor, one slow breath, then two columns titled “what is loud” and “what is true.” I do not force an answer. Usually the useful distinction is between urgency borrowed from someone else and a value I can actually name.\n\nWhat helps you notice the difference between intuition and fear without pretending either one is infallible?", authorHandle: "mira-lantern", spaceSlug: "inner-worlds", createdAt: "18 min ago", readTime: 3, tags: ["reflection", "boundaries"], replyCount: 8, reactions: { resonates: 18, thoughtful: 11, support: 3 }, reacted: [], saved: false, followed: false, featured: true },
  { id: "friendships-change-shape", title: "When a friendship is good, but its shape has changed", body: "I am learning that a friendship can remain real even when its rhythm changes. We used to speak every day; now we send one long voice note every few weeks. Part of me reads the quiet as loss, while another part sees a relationship adapting honestly.\n\nHow do you grieve an old rhythm without treating the new one as a lesser friendship?", authorHandle: "noor-vale", spaceSlug: "relationships", createdAt: "42 min ago", readTime: 4, tags: ["friendship", "change"], replyCount: 14, reactions: { resonates: 26, thoughtful: 9, support: 12 }, reacted: ["resonates"], saved: true, followed: true },
  { id: "unfinished-work", title: "Making something before it has a job", body: "This month I am drawing one five-minute map of an imaginary place each morning. No portfolio, no posting schedule, no lesson to extract. The absence of a goal felt uncomfortable for a week and then unexpectedly spacious.\n\nIf you keep a creative practice, how do you protect it from becoming another performance review?", authorHandle: "jonah-moss", spaceSlug: "creativity", createdAt: "1 hr ago", readTime: 3, tags: ["creative practice", "rest"], replyCount: 21, reactions: { resonates: 34, thoughtful: 17, support: 5 }, reacted: [], saved: false, followed: false },
  { id: "purpose-direction", title: "Purpose is a direction, not a debt", body: "I used to treat meaningful work as proof that every hour had been justified. That made even service feel extractive. Lately I ask a smaller question: “What form of contribution can this season honestly sustain?”\n\nI would love to hear how others separate purpose from pressure, especially during low-energy seasons.", authorHandle: "sana-reed", spaceSlug: "work-and-purpose", createdAt: "2 hrs ago", readTime: 4, tags: ["purpose", "burnout"], replyCount: 17, reactions: { resonates: 29, thoughtful: 22, support: 14 }, reacted: [], saved: true, followed: false },
  { id: "path-after-rain", title: "Field note: the path after rain", body: "The volunteer trail crew stopped work for ten minutes because a line of salamanders was crossing the wet path. Nobody called it productivity, but it may have been the most useful thing we did all morning.\n\nA note from the wider world: attention can be a form of service before it becomes an action plan.", authorHandle: "theo-harbor", spaceSlug: "quiet-corner", createdAt: "4 hrs ago", readTime: 2, tags: ["field note", "attention"], replyCount: 6, reactions: { resonates: 23, thoughtful: 8, support: 2 }, reacted: [], saved: false, followed: false },
  { id: "polite-disagreement", title: "Can we practice disagreement without turning cold?", body: "I sometimes over-correct from people-pleasing into distance. I want disagreement that is direct and still leaves the other person fully human. What language has helped you be clear without pretending certainty?\n\nExperiences are welcome; please skip prescriptions or type-based absolutes.", authorHandle: "lena-finch", spaceSlug: "ask-manywise", createdAt: "Yesterday", readTime: 3, tags: ["communication", "nuance"], replyCount: 32, reactions: { resonates: 41, thoughtful: 19, support: 7 }, reacted: [], saved: false, followed: false },
];

export const initialReplies: Reply[] = [
  { id: "r-anime-1", discussionId: "kindness-needs-boundaries", authorHandle: "noor-vale", body: "The scenes that stay with me are the ones where saying no protects the relationship from quiet resentment. It is less cinematic than sacrifice, but often more loving.", createdAt: "7 min ago", reactions: 12, reacted: false },
  { id: "r-anime-2", discussionId: "kindness-needs-boundaries", parentId: "r-anime-1", authorHandle: "aya-sori", body: "Yes—the boundary changes the relationship instead of ending it. That distinction is exactly what I was reaching for.", createdAt: "3 min ago", reactions: 5, reacted: false },
  { id: "r1", discussionId: "quieter-answer", authorHandle: "noor-vale", body: "I ask whether the feeling becomes clearer when I imagine explaining the choice to nobody. Fear often keeps rehearsing an audience; intuition usually gets simpler.", createdAt: "11 min ago", reactions: 9, reacted: false },
  { id: "r2", discussionId: "quieter-answer", parentId: "r1", authorHandle: "mira-lantern", body: "“Explaining the choice to nobody” is such a useful test. I am adding that beside the two columns.", createdAt: "6 min ago", reactions: 4, reacted: false },
  { id: "r3", discussionId: "unfinished-work", authorHandle: "theo-harbor", body: "I keep one sketchbook that is not allowed to produce shareable work. Calling it habitat instead of output changed how I use it.", createdAt: "38 min ago", reactions: 14, reacted: true },
  { id: "r4", discussionId: "purpose-direction", authorHandle: "mira-lantern", body: "A seasonal definition of contribution feels kinder and more accurate than a permanent mission statement.", createdAt: "1 hr ago", reactions: 7, reacted: false },
];

export const chatRooms: ChatRoom[] = [
  { id: "after-credits-chat", name: "After the credits", topic: "Character choices, visual motifs, and spoiler-labeled thoughts from the episode still in your head.", kind: "space", activeNow: 11, unread: 2 },
  { id: "quiet-corner-chat", name: "Quiet Corner", topic: "Small observations and gentle company. Advice only when asked for.", kind: "space", activeNow: 8, unread: 3 },
  { id: "books-chat", name: "Between the lines", topic: "What we are reading, abandoning, and thinking beside.", kind: "space", activeNow: 5, unread: 0 },
  { id: "makers-table", name: "Makers’ table", topic: "A small circle for works in progress and kind, specific feedback.", kind: "circle", activeNow: 4, unread: 1 },
];

export const initialChatMessages: ChatMessage[] = [
  { id: "m-anime-1", roomId: "after-credits-chat", authorHandle: "aya-sori", body: "Spoiler-light question: what character entrance tells you everything through framing before a word is spoken?", createdAt: "4:08 PM", reactions: 9, reacted: false },
  { id: "m-anime-2", roomId: "after-credits-chat", authorHandle: "lena-finch", body: "The ones where the room goes quiet instead of the soundtrack getting louder. Negative space can be a character cue.", createdAt: "4:12 PM", replyTo: "m-anime-1", reactions: 6, reacted: false },
  { id: "m1", roomId: "quiet-corner-chat", authorHandle: "jonah-moss", body: "Small check-in: what is one thing you are not rushing today?", createdAt: "9:12 AM", reactions: 5, reacted: false },
  { id: "m2", roomId: "quiet-corner-chat", authorHandle: "mira-lantern", body: "An answer to a kind email. I want to reply from steadiness instead of reflex.", createdAt: "9:18 AM", replyTo: "m1", reactions: 3, reacted: true },
  { id: "m3", roomId: "quiet-corner-chat", authorHandle: "noor-vale", body: "Choosing the next book for the display. The empty shelf can wait while I read the first pages.", createdAt: "9:21 AM", replyTo: "m1", reactions: 2, reacted: false },
  { id: "m4", roomId: "quiet-corner-chat", authorHandle: "sana-reed", body: "Gentle reminder: care is welcome here, but nobody is expected to provide crisis support. Use local professional resources for urgent help.", createdAt: "9:34 AM", reactions: 6, reacted: false },
  { id: "m5", roomId: "books-chat", authorHandle: "lena-finch", body: "I abandoned a book at page 80 and felt oddly liberated. Reading is not a contract.", createdAt: "Yesterday", reactions: 8, reacted: false },
  { id: "m6", roomId: "makers-table", authorHandle: "jonah-moss", body: "Bringing three tiny map drawings tonight. Questions are welcome; line edits are not, yet.", createdAt: "Yesterday", reactions: 4, reacted: false },
];

export const initialNotifications: NotificationItem[] = [
  { id: "n1", kind: "reply", title: "Noor replied in Anime & Character Study", detail: "“The scenes that stay with me…” in your character reflection", createdAt: "7 min ago", href: "/discussions/kindness-needs-boundaries", read: false },
  { id: "n2", kind: "reaction", title: "Three people acknowledged your reply", detail: "In “Purpose is a direction, not a debt”", createdAt: "1 hr ago", href: "/discussions/purpose-direction", read: false },
  { id: "n3", kind: "follow", title: "Lena is keeping up with you", detail: "You can control who may contact you in Privacy.", createdAt: "Yesterday", href: "/members/lena-finch", read: true },
  { id: "n4", kind: "invitation", title: "Invitation to Makers’ table", detail: "Jonah invited you to a small creative circle.", createdAt: "2 days ago", href: "/chat?room=makers-table", read: true },
  { id: "n5", kind: "moderation", title: "Your report was reviewed", detail: "A steward took action. Thank you for helping protect the room.", createdAt: "4 days ago", href: "/settings?section=privacy", read: true },
];

export const defaultState: DemoState = {
  session: "guest",
  onboardingComplete: false,
  profile: {
    displayName: "Avery Rowan",
    handle: "avery-rowan",
    bio: "Learning to make room for both conviction and revision.",
    pronouns: "",
    timezone: "UTC",
    interests: ["Inner life", "Books & ideas", "Anime & character study", "Creative practice"],
    goals: ["Thoughtful conversation", "Friendship"],
    conversationPace: "balanced",
    profileVisibility: "members",
    discoverable: true,
    showPresence: true,
    directMessages: "requests",
    emailDigest: "weekly",
    notifyReplies: true,
    notifyReactions: true,
    notifyFollows: false,
    theme: "system",
  },
  discussions: initialDiscussions,
  replies: initialReplies,
  chatMessages: initialChatMessages,
  notifications: initialNotifications,
  joinedSpaces: spaces.filter((space) => space.joined).map((space) => space.slug),
  followedMembers: ["noor-vale"],
  blockedMembers: [],
  contactRequests: [],
  reports: [],
};
