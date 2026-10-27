"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useManywise } from "@/components/providers/manywise-provider";
import { Button, SectionLabel } from "@/components/ui/primitives";
import { spaces } from "@/lib/demo-data";
import { cn, formatCount } from "@/lib/utils";

export default function SpacesPage() {
  const { state, toggleJoinSpace } = useManywise();
  const [filter, setFilter] = useState<"all" | "joined">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => spaces.filter((space) => (filter === "all" || state.joinedSpaces.includes(space.slug)) && `${space.name} ${space.description}`.toLowerCase().includes(query.toLowerCase())), [filter, query, state.joinedSpaces]);

  return <div className="page-shell spaces-page"><header className="page-header rooms-header"><div><p className="eyebrow">Conversation rooms</p><h1>Find the right<br />kind of attention.</h1><p>Each room has a purpose, a pace, and stewards who care for the conditions around the conversation.</p></div><div className="rooms-search"><Search size={18} /><label className="sr-only" htmlFor="room-search">Search rooms</label><input id="room-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms" /></div></header>
    <div className="rooms-toolbar"><div role="tablist" className="feed-tabs"><button role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>All rooms</button><button role="tab" aria-selected={filter === "joined"} onClick={() => setFilter("joined")}>Your rooms · {state.joinedSpaces.length}</button></div><p>Suggestions use only interests you chose.</p></div>
    <section className="rooms-grid" aria-label="Community rooms">{visible.map((space, index) => { const joined = state.joinedSpaces.includes(space.slug); return <article className={cn("room-card", `room-card-${space.color}`)} key={space.slug}><header><span>{String(index + 1).padStart(2, "0")}</span><SectionLabel>{space.label}</SectionLabel></header><Link href={`/spaces/${space.slug}`}><h2>{space.name}</h2><p>{space.description}</p></Link><blockquote>{space.prompt}</blockquote><footer><span><i className="presence-dot" />{space.activeNow} here now · {formatCount(space.memberCount)} members</span><div><Button variant={joined ? "quiet" : "secondary"} size="sm" onClick={() => toggleJoinSpace(space.slug)}>{joined ? "Joined" : "Join room"}</Button><Link href={`/spaces/${space.slug}`} aria-label={`Open ${space.name}`}><ArrowRight size={18} /></Link></div></footer></article>; })}</section>
    {!visible.length && <div className="empty-state"><div className="empty-art small"><i /><i /><i /></div><h2>No room carries those words yet.</h2><p>Try a broader phrase. Manywise keeps the room list intentional rather than endlessly fragmented.</p><Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>Show every room</Button></div>}
  </div>;
}
