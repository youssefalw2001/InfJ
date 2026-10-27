export type ReactionKind = "resonates" | "thoughtful" | "support";
export type Theme = "light" | "dark" | "system";
export type ReportReason = "harassment" | "hate_or_abuse" | "spam" | "privacy" | "self_harm_concern" | "misinformation" | "off_topic" | "other";

export interface ReportRecord {
  targetId: string;
  reason: ReportReason;
  details: string;
  createdAt: string;
}

export interface Member {
  handle: string;
  name: string;
  initials: string;
  bio: string;
  pronouns?: string;
  location?: string;
  interests: string[];
  role?: "member" | "steward";
  color: string;
  joined: string;
  avatarDataUrl?: string;
}

export interface Space {
  slug: string;
  name: string;
  label: string;
  description: string;
  prompt: string;
  color: string;
  memberCount: number;
  activeNow: number;
  joined: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorHandle: string;
  spaceSlug: string;
  createdAt: string;
  readTime: number;
  tags: string[];
  replyCount: number;
  reactions: Record<ReactionKind, number>;
  reacted: ReactionKind[];
  saved: boolean;
  followed: boolean;
  featured?: boolean;
  linkUrl?: string;
  imageDataUrl?: string;
}

export interface Reply {
  id: string;
  discussionId: string;
  parentId?: string;
  authorHandle: string;
  body: string;
  createdAt: string;
  reactions: number;
  reacted: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorHandle: string;
  body: string;
  createdAt: string;
  replyTo?: string;
  reactions: number;
  reacted: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  kind: "space" | "circle";
  activeNow: number;
  unread: number;
}

export interface NotificationItem {
  id: string;
  kind: "reply" | "reaction" | "follow" | "invitation" | "moderation";
  title: string;
  detail: string;
  createdAt: string;
  href: string;
  read: boolean;
}

export interface ProfileSettings {
  displayName: string;
  handle: string;
  avatarDataUrl?: string;
  bio: string;
  pronouns: string;
  timezone: string;
  interests: string[];
  goals: string[];
  conversationPace: "slow" | "balanced" | "lively";
  profileVisibility: "members" | "public" | "private";
  discoverable: boolean;
  showPresence: boolean;
  directMessages: "connections" | "requests" | "off";
  emailDigest: "off" | "weekly";
  notifyReplies: boolean;
  notifyReactions: boolean;
  notifyFollows: boolean;
  theme: Theme;
}

export interface DemoState {
  session: "guest" | "member";
  onboardingComplete: boolean;
  profile: ProfileSettings;
  discussions: Discussion[];
  replies: Reply[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
  joinedSpaces: string[];
  followedMembers: string[];
  blockedMembers: string[];
  contactRequests: string[];
  reports: ReportRecord[];
}
