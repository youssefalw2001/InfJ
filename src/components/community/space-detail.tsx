"use client";

import Link from "next/link";
import { ArrowLeft, Bell, Check, MessageCircle, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ComposerDialog } from "@/components/community/composer-dialog";
import { DiscussionCard } from "@/components/community/discussion-card";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Button, SectionLabel } from "@/components/ui/primitives";
import { members, spaces } from "@/lib/demo-data";

export function SpaceDetail({ slug }: { slug: string }) {
  const { state, toggleJoinSpace, toast } = useManywise();
  const [sort, setSort] = useState<"recent" | "discussed">("recent");
  const [query, setQuery] = useState("");
  const space = spaces.find((item) => item.slug === slug);
  const discussions = useMemo(() => state.discussions.filter((discussion) => discussion.spaceSlug === slug && `${discussion.title} ${discussion.body}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "discussed" ? b.replyCount - a.replyCount : state.discussions.indexOf(a) - state.discussions.indexOf(b)), [query, slug, sort, state.discussions]);
  if (!space) return <div className="page-shell"><div className="empty-state"><h1>That room is not here.</h1><Link className="button button-secondary" href="/spaces">Browse rooms</Link></div></div>;
  const joined = state.joinedSpaces.includes(space.slug);

  return <div className="page-shell space-detail-page"><Link href="/spaces" className="back-link"><ArrowLeft size={16} />All rooms</Link><header className={`space-hero space-hero-${space.color}`}><div className="space-number">MW / {spaces.indexOf(space) + 1}</div><div><p className="eyebrow">{space.label}</p><h1>{space.name}</h1><p>{space.description}</p><blockquote>“{space.prompt}”</blockquote></div><div className="space-members"><div>{members.slice(0, 4).map((member) => <Avatar member={member} size="sm" key={member.handle} />)}</div><span><strong>{space.memberCount} members</strong><small>{space.activeNow} here now, if they choose to show it</small></span></div></header>
    <section className="space-actions"><div><Button onClick={() => toggleJoinSpace(space.slug)} variant={joined ? "secondary" : "primary"}>{joined ? <Check size={17} /> : <Users size={17} />}{joined ? "Joined" : "Join this room"}</Button><Button variant="quiet" onClick={() => toast("Room notices are now set to a calm weekly rhythm.")}><Bell size={17} />Weekly notices</Button></div><ComposerDialog defaultSpace={space.slug} /><Link href={`/chat?room=${space.slug === "quiet-corner" ? "quiet-corner-chat" : space.slug === "anime-and-character-study" ? "after-credits-chat" : "books-chat"}`} className="button button-secondary"><MessageCircle size={17} />Open live room</Link></section>
    <section className="space-conversations"><div className="space-conversation-heading"><div><SectionLabel>Room conversations</SectionLabel><h2>What is unfolding</h2></div><div className="inline-search"><Search size={16} /><input aria-label={`Search ${space.name}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this room" /></div><select value={sort} onChange={(event) => setSort(event.target.value as "recent" | "discussed")} aria-label="Sort discussions"><option value="recent">Most recent</option><option value="discussed">Most discussed</option></select></div>
      <div className="feed-list">{discussions.length ? discussions.map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} />) : <div className="empty-state"><div className="empty-art small"><i /><i /><i /></div><h2>{query ? "No thread matches that phrase." : "The first chair is open."}</h2><p>{query ? "Try fewer words or start a new thread with the question you hoped to find." : "This demo room has no threads yet. Begin with a specific question or observation."}</p><ComposerDialog defaultSpace={space.slug} /></div>}</div>
    </section>
    <aside className="room-guide"><SectionLabel>How this room gathers</SectionLabel><div><article><span>01</span><h3>Speak from experience.</h3><p>Offer what you have noticed, not what every INFJ supposedly does.</p></article><article><span>02</span><h3>Ask before advising.</h3><p>Curiosity can be generous. Unrequested solutions often are not.</p></article><article><span>03</span><h3>Leave room to revise.</h3><p>A changed mind is a contribution, not a defeat.</p></article></div></aside>
  </div>;
}
