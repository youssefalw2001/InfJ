"use client";

import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share2, Sparkles, Bell, BellOff } from "lucide-react";
import { Avatar, Badge, IconButton } from "@/components/ui/primitives";
import { ReportDialog } from "@/components/community/report-dialog";
import { members, spaces } from "@/lib/demo-data";
import type { Discussion, ReactionKind } from "@/lib/types";
import { useManywise } from "@/components/providers/manywise-provider";
import { cn } from "@/lib/utils";

const reactions: { kind: ReactionKind; label: string; icon: typeof Heart }[] = [
  { kind: "resonates", label: "Resonates", icon: Heart },
  { kind: "thoughtful", label: "Thoughtful", icon: Sparkles },
  { kind: "support", label: "Support", icon: MessageCircle },
];

export function DiscussionCard({ discussion, compact = false }: { discussion: Discussion; compact?: boolean }) {
  const { toggleReaction, toggleSave, toggleDiscussionFollow, toast, state } = useManywise();
  const member = members.find((item) => item.handle === discussion.authorHandle) ?? { handle: state.profile.handle, name: state.profile.displayName, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2), bio: state.profile.bio, interests: state.profile.interests, color: "clay", joined: "Today" };
  const space = spaces.find((item) => item.slug === discussion.spaceSlug);

  async function share() {
    const url = `${window.location.origin}/discussions/${discussion.id}`;
    try {
      if (navigator.share) await navigator.share({ title: discussion.title, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied to your clipboard."); }
    } catch { /* Share dismissal is not an error. */ }
  }

  return (
    <article className={cn("discussion-card", compact && "discussion-card-compact")}>
      <header className="discussion-meta">
        <Link href={`/members/${member.handle}`} className="member-chip"><Avatar member={member} size="sm" /><span><strong>{member.name}</strong><small>@{member.handle}</small></span></Link>
        <span className="meta-separator">in</span>
        <Link href={`/spaces/${space?.slug}`} className="space-link"><i className={`dot dot-${space?.color ?? "moss"}`} />{space?.name ?? "Manywise"}</Link>
        <span className="meta-time">{discussion.createdAt}</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild><IconButton id={`report-menu-${discussion.id}`} label="Discussion options" className="card-menu"><MoreHorizontal size={19} /></IconButton></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="dropdown" align="end" sideOffset={6}>
            <DropdownMenu.Item className="menu-item" onSelect={() => toggleDiscussionFollow(discussion.id)}>{discussion.followed ? <BellOff size={16} /> : <Bell size={16} />}{discussion.followed ? "Stop notifications" : "Keep up with this"}</DropdownMenu.Item>
            <DropdownMenu.Item asChild><ReportDialog targetId={discussion.id} returnFocusId={`report-menu-${discussion.id}`} /></DropdownMenu.Item>
          </DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
      </header>
      {discussion.featured && <Badge className="featured-badge">Editor’s prompt · open to everyone</Badge>}
      <Link href={`/discussions/${discussion.id}`} className="discussion-content">
        <h2>{discussion.title}</h2>
        {!compact && <p>{discussion.body.split("\n")[0]}</p>}
      </Link>
      {discussion.imageDataUrl && <div className="post-image-wrap"><Image src={discussion.imageDataUrl} alt="Member-provided discussion image" width={900} height={520} unoptimized /></div>}
      {discussion.linkUrl && <a className="link-preview" href={discussion.linkUrl} target="_blank" rel="noreferrer"><span>Shared link</span><strong>{discussion.linkUrl.replace(/^https?:\/\//, "").split("/")[0]}</strong></a>}
      <div className="tag-row">{discussion.tags.map((tag) => <span key={tag}>#{tag}</span>)}<span className="read-time">{discussion.readTime} min read</span></div>
      <footer className="discussion-actions">
        <div className="reaction-group" aria-label="Acknowledge this discussion">{reactions.map(({ kind, label, icon: Icon }) => <button key={kind} aria-pressed={discussion.reacted.includes(kind)} className={cn("reaction", discussion.reacted.includes(kind) && "active")} onClick={() => toggleReaction(discussion.id, kind)} title={label}><Icon size={16} /><span>{label}</span><b>{discussion.reactions[kind]}</b></button>)}</div>
        <Link href={`/discussions/${discussion.id}#replies`} className="action-link"><MessageCircle size={17} /><span>{discussion.replyCount} replies</span></Link>
        <IconButton label={discussion.saved ? "Remove from keeps" : "Keep discussion"} className={discussion.saved ? "active" : ""} onClick={() => toggleSave(discussion.id)}><Bookmark size={18} fill={discussion.saved ? "currentColor" : "none"} /></IconButton>
        <IconButton label="Share discussion" onClick={share}><Share2 size={18} /></IconButton>
      </footer>
    </article>
  );
}
