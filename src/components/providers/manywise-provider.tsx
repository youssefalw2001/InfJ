"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { defaultState } from "@/lib/demo-data";
import type { DemoState, ProfileSettings, ReactionKind, ReportRecord, ReportReason } from "@/lib/types";
import { discussionSchema, chatMessageSchema, replySchema, reportSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const STORAGE_KEY = "manywise-demo-state-v1";

type DiscussionInput = { title: string; body: string; spaceSlug: string; tags: string[]; linkUrl?: string; imageDataUrl?: string };
type Toast = { id: number; message: string } | null;

interface ManywiseContextValue {
  state: DemoState;
  hydrated: boolean;
  toast: (message: string) => void;
  enterDemo: (onboarded?: boolean) => void;
  signOut: () => void;
  completeOnboarding: (profile: Partial<ProfileSettings>) => void;
  updateProfile: (profile: Partial<ProfileSettings>) => void;
  createDiscussion: (input: DiscussionInput) => string | null;
  toggleReaction: (discussionId: string, kind: ReactionKind) => void;
  toggleSave: (discussionId: string) => void;
  toggleDiscussionFollow: (discussionId: string) => void;
  addReply: (discussionId: string, body: string, parentId?: string) => boolean;
  toggleReplyReaction: (replyId: string) => void;
  sendMessage: (roomId: string, body: string, replyTo?: string) => boolean;
  toggleMessageReaction: (messageId: string) => void;
  toggleJoinSpace: (spaceSlug: string) => void;
  toggleFollowMember: (handle: string) => void;
  blockMember: (handle: string) => void;
  unblockMember: (handle: string) => void;
  requestConversation: (handle: string) => void;
  report: (input: { targetId: string; reason: ReportReason; details: string }) => void;
  markNotification: (id: string) => void;
  markAllNotifications: () => void;
  resetDemo: () => void;
  deleteDemoAccount: () => void;
}

const ManywiseContext = createContext<ManywiseContextValue | null>(null);

function freshState(): DemoState {
  return structuredClone(defaultState);
}

export function ManywiseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const [activeToast, setActiveToast] = useState<Toast>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let restored: DemoState | null = null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Omit<DemoState, "reports"> & { reports?: Array<ReportRecord | string> };
        restored = {
          ...parsed,
          contactRequests: parsed.contactRequests ?? [],
          reports: (parsed.reports ?? []).map((item) => typeof item === "string"
            ? { targetId: item, reason: "other", details: "", createdAt: "Previously submitted" }
            : item),
        };
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    queueMicrotask(() => {
      if (restored) setState(restored);
      setHydrated(true);
    });

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("manywise-demo-realtime");
      channel.onmessage = (event: MessageEvent<{ type: string; state?: DemoState }>) => {
        if (event.data.type === "state" && event.data.state) setState(event.data.state);
      };
      channelRef.current = channel;
      return () => channel.close();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const theme = state.profile.theme;
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = theme;
  }, [state.profile.theme]);

  const toast = useCallback((message: string) => {
    const next = { id: Date.now(), message };
    setActiveToast(next);
    window.setTimeout(() => setActiveToast((current) => current?.id === next.id ? null : current), 3200);
  }, []);

  const commit = useCallback((updater: (previous: DemoState) => DemoState, broadcast = false) => {
    setState((previous) => {
      const next = updater(previous);
      if (broadcast) channelRef.current?.postMessage({ type: "state", state: next });
      return next;
    });
  }, []);

  const value = useMemo<ManywiseContextValue>(() => ({
    state,
    hydrated,
    toast,
    enterDemo(onboarded = true) {
      commit((previous) => ({ ...previous, session: "member", onboardingComplete: onboarded }));
      toast(onboarded ? "Welcome back. Your demo space is ready." : "Let’s make this space feel like yours.");
    },
    signOut() {
      commit((previous) => ({ ...previous, session: "guest" }));
      toast("Signed out of the local demo.");
    },
    completeOnboarding(profile) {
      commit((previous) => ({ ...previous, session: "member", onboardingComplete: true, profile: { ...previous.profile, ...profile } }));
      toast("Your corner of Manywise is ready.");
    },
    updateProfile(profile) {
      commit((previous) => ({ ...previous, profile: { ...previous.profile, ...profile } }));
      toast("Changes saved in this browser.");
    },
    createDiscussion(input) {
      const parsed = discussionSchema.safeParse(input);
      if (!parsed.success) {
        toast(parsed.error.issues[0]?.message ?? "Check your discussion and try again.");
        return null;
      }
      const id = `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;
      commit((previous) => ({
        ...previous,
        discussions: [{
          id,
          title: parsed.data.title,
          body: parsed.data.body,
          authorHandle: previous.profile.handle,
          spaceSlug: parsed.data.spaceSlug,
          createdAt: "Just now",
          readTime: Math.max(1, Math.ceil(parsed.data.body.split(/\s+/).length / 220)),
          tags: parsed.data.tags,
          replyCount: 0,
          reactions: { resonates: 0, thoughtful: 0, support: 0 },
          reacted: [],
          saved: false,
          followed: true,
          linkUrl: input.linkUrl,
          imageDataUrl: input.imageDataUrl,
        }, ...previous.discussions],
      }), true);
      toast("Published. You can keep up with replies here.");
      return id;
    },
    toggleReaction(discussionId, kind) {
      commit((previous) => ({ ...previous, discussions: previous.discussions.map((item) => {
        if (item.id !== discussionId) return item;
        const active = item.reacted.includes(kind);
        return { ...item, reacted: active ? item.reacted.filter((value) => value !== kind) : [...item.reacted, kind], reactions: { ...item.reactions, [kind]: Math.max(0, item.reactions[kind] + (active ? -1 : 1)) } };
      }) }), true);
    },
    toggleSave(discussionId) {
      commit((previous) => ({ ...previous, discussions: previous.discussions.map((item) => item.id === discussionId ? { ...item, saved: !item.saved } : item) }));
      toast("Your keeps are private.");
    },
    toggleDiscussionFollow(discussionId) {
      commit((previous) => ({ ...previous, discussions: previous.discussions.map((item) => item.id === discussionId ? { ...item, followed: !item.followed } : item) }));
      toast("Conversation notification preference updated.");
    },
    addReply(discussionId, body, parentId) {
      const parsed = replySchema.safeParse({ discussionId, body, parentId });
      if (!parsed.success) { toast("Write at least a couple of words before replying."); return false; }
      const id = `reply-${Date.now().toString(36)}`;
      commit((previous) => ({
        ...previous,
        replies: [...previous.replies, { id, discussionId, parentId, body: parsed.data.body, authorHandle: previous.profile.handle, createdAt: "Just now", reactions: 0, reacted: false }],
        discussions: previous.discussions.map((item) => item.id === discussionId ? { ...item, replyCount: item.replyCount + 1, followed: true } : item),
      }), true);
      toast("Reply added. Thanks for making room for the conversation.");
      return true;
    },
    toggleReplyReaction(replyId) {
      commit((previous) => ({ ...previous, replies: previous.replies.map((reply) => reply.id === replyId ? { ...reply, reacted: !reply.reacted, reactions: Math.max(0, reply.reactions + (reply.reacted ? -1 : 1)) } : reply) }), true);
    },
    sendMessage(roomId, body, replyTo) {
      const parsed = chatMessageSchema.safeParse({ roomId, body, replyTo });
      if (!parsed.success) return false;
      commit((previous) => ({ ...previous, chatMessages: [...previous.chatMessages, { id: `message-${Date.now().toString(36)}`, roomId, body: parsed.data.body, replyTo, authorHandle: previous.profile.handle, createdAt: "Now", reactions: 0, reacted: false }] }), true);
      return true;
    },
    toggleMessageReaction(messageId) {
      commit((previous) => ({ ...previous, chatMessages: previous.chatMessages.map((message) => message.id === messageId ? { ...message, reacted: !message.reacted, reactions: Math.max(0, message.reactions + (message.reacted ? -1 : 1)) } : message) }), true);
    },
    toggleJoinSpace(spaceSlug) {
      const joined = state.joinedSpaces.includes(spaceSlug);
      commit((previous) => ({ ...previous, joinedSpaces: joined ? previous.joinedSpaces.filter((slug) => slug !== spaceSlug) : [...previous.joinedSpaces, spaceSlug] }));
      toast(joined ? "You left the room. Its public conversations remain discoverable." : "Room added to your home.");
    },
    toggleFollowMember(handle) {
      const followed = state.followedMembers.includes(handle);
      commit((previous) => ({ ...previous, followedMembers: followed ? previous.followedMembers.filter((item) => item !== handle) : [...previous.followedMembers, handle] }));
      toast(followed ? "You’re no longer keeping up with this member." : "You’ll see more from this member—without public counts.");
    },
    blockMember(handle) {
      commit((previous) => ({ ...previous, blockedMembers: previous.blockedMembers.includes(handle) ? previous.blockedMembers : [...previous.blockedMembers, handle], followedMembers: previous.followedMembers.filter((item) => item !== handle) }));
      toast("Member blocked. They will no longer appear in your demo experience.");
    },
    unblockMember(handle) {
      commit((previous) => ({ ...previous, blockedMembers: previous.blockedMembers.filter((item) => item !== handle) }));
      toast("Member unblocked. Their visible contributions can appear again.");
    },
    requestConversation(handle) {
      commit((previous) => ({ ...previous, contactRequests: previous.contactRequests.includes(handle) ? previous.contactRequests : [...previous.contactRequests, handle] }));
      toast("Conversation request saved in this browser demo.");
    },
    report(input) {
      const parsed = reportSchema.safeParse(input);
      if (!parsed.success) {
        toast(parsed.error.issues[0]?.message ?? "Check the report and try again.");
        return;
      }
      commit((previous) => ({
        ...previous,
        reports: previous.reports.some((item) => item.targetId === parsed.data.targetId)
          ? previous.reports
          : [...previous.reports, { ...parsed.data, createdAt: "Just now" }],
      }));
      toast("Report sent privately to the stewardship queue.");
    },
    markNotification(id) {
      commit((previous) => ({ ...previous, notifications: previous.notifications.map((item) => item.id === id ? { ...item, read: true } : item) }));
    },
    markAllNotifications() {
      commit((previous) => ({ ...previous, notifications: previous.notifications.map((item) => ({ ...item, read: true })) }));
      toast("You’re caught up.");
    },
    resetDemo() {
      const next = freshState();
      next.session = "member";
      next.onboardingComplete = true;
      setState(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      toast("Demo content restored.");
    },
    deleteDemoAccount() {
      window.localStorage.removeItem(STORAGE_KEY);
      setState(freshState());
      toast("Local demo data deleted from this browser.");
    },
  }), [state, hydrated, toast, commit]);

  return (
    <ManywiseContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {activeToast && <div className="toast"><Check size={17} aria-hidden="true" /><span>{activeToast.message}</span><button onClick={() => setActiveToast(null)} aria-label="Dismiss message"><X size={16} /></button></div>}
      </div>
    </ManywiseContext.Provider>
  );
}

export function useManywise() {
  const context = useContext(ManywiseContext);
  if (!context) throw new Error("useManywise must be used inside ManywiseProvider");
  return context;
}
