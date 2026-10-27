"use client";

import Link from "next/link";
import { AtSign, Bell, CheckCheck, Heart, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useManywise } from "@/components/providers/manywise-provider";
import { Button, SectionLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const icons = { reply: MessageCircle, reaction: Heart, follow: UserPlus, invitation: AtSign, moderation: ShieldCheck };

export default function NotificationsPage() {
  const { state, markNotification, markAllNotifications } = useManywise();
  const [view, setView] = useState<"all" | "unread">("all");
  const notifications = state.notifications.filter((item) => view === "all" || !item.read);
  const unread = state.notifications.filter((item) => !item.read).length;
  return <div className="page-shell notifications-page"><header className="page-header"><div><p className="eyebrow">Notices, not nudges</p><h1>What reached you.</h1><p>Only the activity you chose to hear about. No urgency theater.</p></div>{unread > 0 && <Button variant="secondary" onClick={markAllNotifications}><CheckCheck size={17} />Mark all read</Button>}</header>
    <div className="notice-layout"><main><div className="feed-tabs notice-tabs" role="tablist"><button role="tab" aria-selected={view === "all"} onClick={() => setView("all")}>All</button><button role="tab" aria-selected={view === "unread"} onClick={() => setView("unread")}>Unread <span>{unread}</span></button></div><div className="notice-list">{notifications.map((item) => { const Icon = icons[item.kind]; return <Link href={item.href} key={item.id} className={cn("notice-item", !item.read && "unread")} onClick={() => markNotification(item.id)}><span className="notice-icon"><Icon size={18} /></span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.createdAt}</small></div>{!item.read && <i aria-label="Unread" />}</Link>; })}{!notifications.length && <div className="empty-state"><div className="empty-art small"><i /><i /><i /></div><h2>Nothing is asking for you.</h2><p>That is not a problem to fix. New replies and invitations will appear here when they happen.</p><Button variant="secondary" onClick={() => setView("all")}>See earlier notices</Button></div>}</div></main><aside className="notice-preferences"><Bell size={19} /><SectionLabel>Your attention is yours</SectionLabel><h2>A quieter default</h2><p>Reaction notices are bundled. Follows do not trigger email. Weekly digests can replace individual notices.</p><Link href="/settings?section=notifications">Review notification choices</Link></aside></div>
  </div>;
}
