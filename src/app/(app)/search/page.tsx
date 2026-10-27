"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DiscussionCard } from "@/components/community/discussion-card";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Badge, Button, SectionLabel } from "@/components/ui/primitives";
import { members, spaces } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "threads" | "rooms" | "members";

export default function SearchPage() {
  const { state } = useManywise();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const urlQuery = new URLSearchParams(window.location.search).get("q");
      if (urlQuery) setQuery(urlQuery);
    });
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", focusSearch);
    };
  }, []);

  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => ({
    discussions: state.discussions.filter((item) => !state.blockedMembers.includes(item.authorHandle) && `${item.title} ${item.body} ${item.tags.join(" ")}`.toLowerCase().includes(normalized)),
    spaces: spaces.filter((item) => `${item.name} ${item.description} ${item.label}`.toLowerCase().includes(normalized)),
    members: members.filter((item) => !state.blockedMembers.includes(item.handle) && `${item.name} ${item.handle} ${item.bio} ${item.interests.join(" ")}`.toLowerCase().includes(normalized)),
  }), [normalized, state.blockedMembers, state.discussions]);
  const total = results.discussions.length + results.spaces.length + results.members.length;

  return <div className="page-shell search-page"><header className="search-hero"><p className="eyebrow">Discovery without covert profiling</p><h1>What are you<br />looking into?</h1><div className="big-search"><Search size={23} /><label className="sr-only" htmlFor="global-search">Search Manywise</label><input ref={searchRef} id="global-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="A question, room, person, or phrase…" /><kbd>⌘ K</kbd></div><p>Results come from member words and interests—not inferred personality traits.</p></header>
    <div className="search-filters" role="tablist" aria-label="Filter search results">{([ ["all", "Everything"], ["threads", "Threads"], ["rooms", "Rooms"], ["members", "Members"] ] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}>{label}{normalized && <span>{value === "all" ? total : value === "threads" ? results.discussions.length : value === "rooms" ? results.spaces.length : results.members.length}</span>}</button>)}</div>
    {!normalized ? <section className="discovery-start"><div><SectionLabel>Questions moving through Manywise</SectionLabel><div className="search-prompts">{["How do you tell intuition from fear?", "Making without monetizing", "Friendship after a season changes", "Purpose without urgency", "Books that changed slowly"].map((prompt) => <button onClick={() => setQuery(prompt.split(" ").slice(0, 3).join(" "))} key={prompt}><ArrowRight size={15} />{prompt}</button>)}</div></div><div><SectionLabel>Explore by declared interest</SectionLabel><div className="interest-cloud">{["boundaries", "creative practice", "books", "friendship", "rest", "honest disagreement", "nature", "work"].map((interest) => <button key={interest} onClick={() => setQuery(interest)}>#{interest}</button>)}</div></div></section> : total === 0 ? <div className="empty-state"><div className="empty-art small"><i /><i /><i /></div><h2>No exact echo found.</h2><p>Try fewer words, or begin the conversation you hoped to find. We do not pad results with unrelated activity.</p><Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button></div> : <div className="search-results">
      {(filter === "all" || filter === "rooms") && results.spaces.length > 0 && <section><header><SectionLabel>Rooms</SectionLabel><span>{results.spaces.length}</span></header><div className="search-room-grid">{results.spaces.slice(0, filter === "rooms" ? undefined : 3).map((space) => <Link href={`/spaces/${space.slug}`} key={space.slug} className={`search-room room-card-${space.color}`}><span className={`dot dot-${space.color}`} /><div><small>{space.label}</small><strong>{space.name}</strong><p>{space.description}</p></div><ArrowRight size={17} /></Link>)}</div></section>}
      {(filter === "all" || filter === "members") && results.members.length > 0 && <section><header><SectionLabel>Members</SectionLabel><span>{results.members.length}</span></header><div className="member-results">{results.members.slice(0, filter === "members" ? undefined : 3).map((member) => <Link href={`/members/${member.handle}`} key={member.handle}><Avatar member={member} /><div><strong>{member.name}{member.role === "steward" && <Badge>Steward</Badge>}</strong><small>@{member.handle}</small><p>{member.bio}</p><span>{member.interests.slice(0, 3).join(" · ")}</span></div><ArrowRight size={17} /></Link>)}</div></section>}
      {(filter === "all" || filter === "threads") && results.discussions.length > 0 && <section><header><SectionLabel>Threads</SectionLabel><span>{results.discussions.length}</span></header><div className={cn("feed-list", filter !== "threads" && "compact-results")}>{results.discussions.slice(0, filter === "threads" ? undefined : 4).map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} compact={filter === "all"} />)}</div></section>}
    </div>}
  </div>;
}
