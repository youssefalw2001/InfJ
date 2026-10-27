"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowRight, CalendarDays, MapPin, MessageCircle, MoreHorizontal, Settings, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { DiscussionCard } from "@/components/community/discussion-card";
import { ReportDialog } from "@/components/community/report-dialog";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Badge, Button, IconButton, SectionLabel } from "@/components/ui/primitives";
import { members, spaces } from "@/lib/demo-data";
import type { Member } from "@/lib/types";

export function MemberProfile({ handle }: { handle: string }) {
  const { state, toggleFollowMember, blockMember, requestConversation } = useManywise();
  const ownProfile = handle === state.profile.handle;
  const member: Member | undefined = ownProfile ? { handle: state.profile.handle, name: state.profile.displayName, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2), bio: state.profile.bio, pronouns: state.profile.pronouns, location: `${state.profile.timezone} · shared by you`, interests: state.profile.interests, color: "clay", joined: "Today", avatarDataUrl: state.profile.avatarDataUrl } : members.find((item) => item.handle === handle);
  if (!member || state.blockedMembers.includes(handle)) return <div className="page-shell"><div className="empty-state"><h1>This profile is not available.</h1><p>It may be private, blocked, or no longer listed.</p><Link className="button button-secondary" href="/search">Discover members</Link></div></div>;
  const following = state.followedMembers.includes(handle);
  const contributions = state.discussions.filter((discussion) => discussion.authorHandle === handle);
  const memberSpaces = spaces.filter((space) => ownProfile ? state.joinedSpaces.includes(space.slug) : contributions.some((discussion) => discussion.spaceSlug === space.slug)).slice(0, 4);

  return <div className="page-shell profile-page"><header className="profile-hero"><div className="profile-shapes" aria-hidden="true"><i /><i /><i /></div><Avatar member={member} size="xl" /><div className="profile-identity"><div><h1>{member.name}</h1>{member.role === "steward" && <Badge><ShieldCheck size={13} />Community steward</Badge>}</div><p>@{member.handle}{member.pronouns ? ` · ${member.pronouns}` : ""}</p>{member.location && <span><MapPin size={14} />{member.location}</span>}</div><div className="profile-actions">{ownProfile ? <Link href="/settings" className="button button-secondary"><Settings size={17} />Edit your profile</Link> : <><Button onClick={() => toggleFollowMember(handle)} variant={following ? "secondary" : "primary"}>{following ? <UserMinus size={17} /> : <UserPlus size={17} />}{following ? "Keeping up" : "Keep up"}</Button><Button variant="secondary" disabled={state.contactRequests.includes(handle)} onClick={() => requestConversation(handle)}><MessageCircle size={17} />{state.contactRequests.includes(handle) ? "Request sent" : "Request conversation"}</Button><DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton label="Member options"><MoreHorizontal size={19} /></IconButton></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="dropdown" align="end"><DropdownMenu.Item asChild><ReportDialog targetId={handle} onBlock={() => blockMember(handle)} memberName={member.name} /></DropdownMenu.Item><DropdownMenu.Item className="menu-item danger" onSelect={() => blockMember(handle)}><UserMinus size={16} />Block member</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></>}</div></header>
    <div className="profile-grid"><main><section className="profile-about"><SectionLabel>In my own words</SectionLabel><p>{member.bio || "This member has not added a biography yet."}</p><div className="profile-facets">{member.interests.map((interest) => <span key={interest}>{interest}</span>)}</div><small><CalendarDays size={14} />Joined {member.joined} · No public follower count</small></section>
      <section className="profile-contributions"><header><div><SectionLabel>Contributions</SectionLabel><h2>Recent threads</h2></div>{contributions.length > 2 && <Link href={`/search?q=${handle}`}>See all <ArrowRight size={15} /></Link>}</header><div className="feed-list">{contributions.length ? contributions.slice(0, 3).map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} compact />) : <div className="empty-state compact"><h3>No public threads yet.</h3><p>A quiet profile is a complete profile.</p></div>}</div></section></main>
      <aside className="profile-rooms"><SectionLabel>{ownProfile ? "Your rooms" : "Seen in"}</SectionLabel>{memberSpaces.map((space) => <Link href={`/spaces/${space.slug}`} key={space.slug}><i className={`dot dot-${space.color}`} /><span><strong>{space.name}</strong><small>{space.label}</small></span><ArrowRight size={15} /></Link>)}<p>Joined rooms are shown only when the member’s visibility settings allow it.</p></aside></div>
  </div>;
}
