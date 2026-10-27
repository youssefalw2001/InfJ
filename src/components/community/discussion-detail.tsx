"use client";

import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowLeft, Bell, BellOff, Bookmark, CornerDownRight, Heart, Link2, MoreHorizontal, Send, Share2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useManywise } from "@/components/providers/manywise-provider";
import { ReportDialog } from "@/components/community/report-dialog";
import { Avatar, Badge, Button, IconButton, SectionLabel } from "@/components/ui/primitives";
import { members, spaces } from "@/lib/demo-data";
import type { Member, Reply } from "@/lib/types";
import { cn } from "@/lib/utils";

function viewerAsMember(name: string, handle: string, bio: string, interests: string[], avatarDataUrl?: string): Member { return { name, handle, bio, interests, avatarDataUrl, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2), color: "clay", joined: "Today" }; }

export function DiscussionDetail({ id }: { id: string }) {
  const { state, toggleReaction, toggleSave, toggleDiscussionFollow, addReply, toggleReplyReaction, blockMember, toast } = useManywise();
  const discussion = state.discussions.find((item) => item.id === id);
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null);
  const [sort, setSort] = useState<"oldest" | "newest">("oldest");
  const viewer = viewerAsMember(state.profile.displayName, state.profile.handle, state.profile.bio, state.profile.interests, state.profile.avatarDataUrl);
  const replies = useMemo(() => state.replies.filter((reply) => reply.discussionId === id).sort((a, b) => sort === "oldest" ? state.replies.indexOf(a) - state.replies.indexOf(b) : state.replies.indexOf(b) - state.replies.indexOf(a)), [id, sort, state.replies]);

  if (!discussion) return <div className="page-shell"><div className="empty-state"><div className="empty-art small"><i /><i /><i /></div><h1>This conversation is not available.</h1><p>It may have been removed, made private, or reset with the local demo.</p><Link className="button button-secondary" href="/home">Return home</Link></div></div>;
  const author = members.find((item) => item.handle === discussion.authorHandle) ?? viewer;
  const space = spaces.find((item) => item.slug === discussion.spaceSlug);
  const discussionTitle = discussion.title;

  function submitReply(event: React.FormEvent) { event.preventDefault(); if (addReply(id, body, replyingTo?.id)) { setBody(""); setReplyingTo(null); } }
  async function share() { const url = window.location.href; try { if (navigator.share) await navigator.share({ title: discussionTitle, url }); else { await navigator.clipboard.writeText(url); toast("Conversation link copied."); } } catch {} }

  return <div className="page-shell discussion-detail-page"><Link href={`/spaces/${discussion.spaceSlug}`} className="back-link"><ArrowLeft size={16} />Back to {space?.name}</Link>
    <article className="thread-main"><header><div className="thread-context"><span className={`room-stamp stamp-${space?.color}`}><i />{space?.name}</span><span>{discussion.createdAt}</span><span>{discussion.readTime} min read</span></div><h1>{discussion.title}</h1><div className="thread-author"><Link href={`/members/${author.handle}`}><Avatar member={author} /><span><strong>{author.name}</strong><small>@{author.handle}{author.role === "steward" ? " · Steward" : ""}</small></span></Link><Button variant={discussion.followed ? "secondary" : "quiet"} size="sm" onClick={() => toggleDiscussionFollow(discussion.id)}>{discussion.followed ? <BellOff size={16} /> : <Bell size={16} />}{discussion.followed ? "Keeping up" : "Keep up"}</Button></div></header>
      <div className="thread-body">{discussion.body.split("\n").map((paragraph, index) => paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />)}{discussion.imageDataUrl && <Image src={discussion.imageDataUrl} alt="Member-provided discussion image" width={1000} height={700} unoptimized />}{discussion.linkUrl && <a href={discussion.linkUrl} target="_blank" rel="noreferrer" className="detail-link"><Link2 size={17} /><span><small>Shared reference</small>{discussion.linkUrl}</span></a>}</div>
      <div className="tag-row">{discussion.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}</div>
      <footer className="thread-actions"><div><button className={cn(discussion.reacted.includes("resonates") && "active")} onClick={() => toggleReaction(id, "resonates")} aria-pressed={discussion.reacted.includes("resonates")}><Heart size={18} />Resonates <b>{discussion.reactions.resonates}</b></button><button className={cn(discussion.reacted.includes("thoughtful") && "active")} onClick={() => toggleReaction(id, "thoughtful")} aria-pressed={discussion.reacted.includes("thoughtful")}><Sparkles size={18} />Thoughtful <b>{discussion.reactions.thoughtful}</b></button></div><div><IconButton label={discussion.saved ? "Remove from keeps" : "Keep privately"} className={discussion.saved ? "active" : ""} onClick={() => toggleSave(id)}><Bookmark size={19} fill={discussion.saved ? "currentColor" : "none"} /></IconButton><IconButton label="Share discussion" onClick={share}><Share2 size={19} /></IconButton><DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton label="More discussion options"><MoreHorizontal size={19} /></IconButton></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="dropdown" align="end"><DropdownMenu.Item asChild><ReportDialog targetId={id} /></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></footer>
    </article>
    <section className="reply-section" id="replies"><header><div><SectionLabel>Conversation</SectionLabel><h2>{discussion.replyCount} replies</h2></div><select value={sort} onChange={(event) => setSort(event.target.value as "oldest" | "newest")} aria-label="Sort replies"><option value="oldest">Oldest first</option><option value="newest">Newest first</option></select></header>
      <form className="reply-composer" onSubmit={submitReply}><Avatar member={viewer} size="sm" /><div>{replyingTo && <div className="replying-to"><CornerDownRight size={14} />Replying to {members.find((member) => member.handle === replyingTo.authorHandle)?.name ?? "a member"}<button type="button" onClick={() => setReplyingTo(null)}>Cancel</button></div>}<label className="sr-only" htmlFor="reply-body">Add a reply</label><textarea id="reply-body" value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Add context, ask with care, or simply acknowledge…" maxLength={20000} /><footer><span>{body.length ? `${body.length} characters` : "Your experience, not a verdict"}</span><Button type="submit" size="sm" disabled={!body.trim()}><Send size={15} />Reply</Button></footer></div></form>
      <div className="replies-list">{replies.map((reply) => { const member = members.find((item) => item.handle === reply.authorHandle) ?? viewer; const parent = reply.parentId ? state.replies.find((item) => item.id === reply.parentId) : undefined; return <article className={cn("reply", reply.parentId && "nested")} key={reply.id}><Avatar member={member} size="sm" /><div><header><Link href={`/members/${member.handle}`}><strong>{member.name}</strong></Link>{member.role === "steward" && <Badge>Steward</Badge>}<span>{reply.createdAt}</span><DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton label="Reply options"><MoreHorizontal size={17} /></IconButton></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="dropdown" align="end"><DropdownMenu.Item className="menu-item" onSelect={() => setReplyingTo(reply)}><CornerDownRight size={15} />Reply</DropdownMenu.Item><DropdownMenu.Item asChild><ReportDialog targetId={reply.id} onBlock={() => blockMember(member.handle)} memberName={member.name} /></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></header>{parent && <p className="reply-context">Replying to “{parent.body.slice(0, 72)}…”</p>}<p>{reply.body}</p><footer><button onClick={() => toggleReplyReaction(reply.id)} className={reply.reacted ? "active" : ""} aria-pressed={reply.reacted}><Heart size={15} fill={reply.reacted ? "currentColor" : "none"} />Resonates {reply.reactions > 0 && reply.reactions}</button><button onClick={() => setReplyingTo(reply)}><CornerDownRight size={15} />Reply</button></footer></div></article>; })}{!replies.length && <div className="empty-state compact"><h3>Be the first to add a second perspective.</h3><p>A question can be a generous reply.</p></div>}</div>
    </section>
  </div>;
}
