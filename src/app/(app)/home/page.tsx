"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Clock3, Feather, SlidersHorizontal } from "lucide-react";
import { ComposerDialog } from "@/components/community/composer-dialog";
import { DiscussionCard } from "@/components/community/discussion-card";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Button, SectionLabel } from "@/components/ui/primitives";
import { members, spaces } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { state } = useManywise();
  const [feed, setFeed] = useState<"for-you" | "following" | "recent">("for-you");
  const [spaceFilter, setSpaceFilter] = useState("all");
  const currentMember = { ...members[0], name: state.profile.displayName, handle: state.profile.handle, bio: state.profile.bio, interests: state.profile.interests, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2), avatarDataUrl: state.profile.avatarDataUrl };

  const visible = useMemo(() => state.discussions.filter((discussion) => {
    if (spaceFilter !== "all" && discussion.spaceSlug !== spaceFilter) return false;
    if (feed === "following" && !discussion.followed && !state.followedMembers.includes(discussion.authorHandle)) return false;
    return !state.blockedMembers.includes(discussion.authorHandle);
  }), [state, feed, spaceFilter]);

  return <div className="page-shell home-page"><header className="page-header"><div><p className="eyebrow">Tuesday, 27 October</p><h1>Good to see you, {state.profile.displayName.split(" ")[0]}.</h1><p>Here is what has been unfolding—not everything you missed.</p></div><ComposerDialog /></header>
    <section className="feed-intro"><div className="feed-tabs" role="tablist" aria-label="Choose feed"><button role="tab" aria-selected={feed === "for-you"} onClick={() => setFeed("for-you")}>For you</button><button role="tab" aria-selected={feed === "following"} onClick={() => setFeed("following")}>Keeping up</button><button role="tab" aria-selected={feed === "recent"} onClick={() => setFeed("recent")}>Recent</button></div><button className="filter-button" onClick={() => setSpaceFilter((value) => value === "all" ? state.joinedSpaces[0] ?? "all" : "all")}><SlidersHorizontal size={16} />{spaceFilter === "all" ? "All your rooms" : spaces.find((space) => space.slug === spaceFilter)?.name}</button></section>
    <section className="quick-composer"><Avatar member={currentMember} /><ComposerDialog trigger={<button><span>What deserves more than a quick answer?</span><Feather size={18} /></button>} /></section>
    <nav className="topic-strip" aria-label="Filter by room"><button className={cn(spaceFilter === "all" && "active")} onClick={() => setSpaceFilter("all")}>All rooms</button>{spaces.filter((space) => state.joinedSpaces.includes(space.slug)).map((space) => <button key={space.slug} className={cn(spaceFilter === space.slug && "active")} onClick={() => setSpaceFilter(space.slug)}><i className={`dot dot-${space.color}`} />{space.name}</button>)}</nav>
    <section className="feed-list" aria-label="Discussions"><div className="feed-label"><SectionLabel>{feed === "following" ? "From people and threads you chose" : feed === "recent" ? "Newest across your rooms" : "A considered mix from your rooms"}</SectionLabel><span><Clock3 size={14} />Chronological signals, no popularity rank</span></div>{visible.length ? visible.map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} />) : <div className="empty-state"><div className="empty-art small" aria-hidden="true"><i /><i /><i /></div><h2>A quieter view, for now.</h2><p>Keep up with a member or thread and it will appear here. Nothing is being withheld to manufacture urgency.</p><Button variant="secondary" onClick={() => setFeed("for-you")}>Return to your mix</Button></div>}</section>
    {visible.length > 0 && <div className="feed-end"><ArrowDown size={18} /><strong>You have reached the end.</strong><span>Six conversations are enough for one visit. More will be here when they are.</span></div>}
  </div>;
}
