"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Hash, Home, MessageCircle, PenLine, Search, Settings, Shield, Terminal, UserRound } from "lucide-react";
import { ComposerDialog } from "@/components/community/composer-dialog";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Button, DemoBadge, SectionLabel } from "@/components/ui/primitives";
import { Logo, Mark } from "@/components/ui/logo";
import { members } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/home", label: "Forum", icon: Home },
  { href: "/spaces", label: "Channels", icon: Hash },
  { href: "/chat", label: "Live nodes", icon: MessageCircle },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Inbox", icon: Bell },
];

const serverLinks = [
  { href: "/home", label: "R0", title: "Room Zero" },
  { href: "/spaces/anime-and-character-study", label: "AN", title: "Anime analysis" },
  { href: "/spaces/inner-worlds", label: "IN", title: "Inner worlds" },
  { href: "/spaces/books-and-ideas", label: "BX", title: "Books and ideas" },
  { href: "/spaces/quiet-corner", label: "QC", title: "Quiet corner" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, enterDemo } = useManywise();
  const unread = state.notifications.filter((item) => !item.read).length;
  const demoMember = { ...members[0], handle: state.profile.handle, name: state.profile.displayName, bio: state.profile.bio, interests: state.profile.interests, avatarDataUrl: state.profile.avatarDataUrl, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2) || "AR" };

  if (state.session === "guest") {
    return <main className="session-gate signal-gate" id="main-content"><Logo /><Terminal className="gate-terminal" /><p className="eyebrow">GATE://01 · LOCAL PREVIEW</p><h1>You found Room Zero.</h1><p>The forum behind the obvious conversation is one click away. Nothing leaves this browser.</p><div><Button size="lg" onClick={() => enterDemo(true)}>ENTER THE FORUM</Button><Link className="text-link" href="/">RETURN TO GATE</Link></div></main>;
  }

  return (
    <div className="app-shell signal-shell">
      <nav className="server-dock" aria-label="Channel shortcuts"><Logo href="/home" compact />{serverLinks.map((link) => <Link href={link.href} key={link.label} title={link.title} aria-label={link.title} className={cn(pathname === link.href && "active")}>{link.label}</Link>)}<Link href="/spaces" className="server-add" aria-label="Browse all channels">+</Link></nav>
      <aside className="app-sidebar">
        <div className="sidebar-server"><span><Mark />MANYWISE</span><small>ROOM ZERO // ONLINE</small></div>
        <DemoBadge />
        <span className="clearance-badge"><Shield size={12} />CLEARANCE: MEMBER</span>
        <p className="sidebar-label">∕∕ NAVIGATION</p>
        <nav aria-label="Primary navigation">{navigation.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("nav-link", active && "active")}><Icon size={18} /><span>{label}</span>{label === "Inbox" && unread > 0 && <b aria-label={`${unread} unread`}>{unread}</b>}</Link>; })}</nav>
        <p className="sidebar-label channel-label">∕∕ PINNED CHANNELS</p>
        <div className="pinned-channels"><Link href="/spaces/anime-and-character-study"><Hash />anime-analysis <i className="online" /></Link><Link href="/spaces/inner-worlds"><Hash />inner-worlds</Link><Link href="/spaces/ask-manywise"><Hash />open-questions</Link></div>
        <ComposerDialog trigger={<Button className="sidebar-compose"><PenLine size={16} />NEW TRANSMISSION</Button>} />
        <div className="sidebar-profile"><Link href={`/members/${state.profile.handle}`}><Avatar member={demoMember} size="sm" /><span><strong>{state.profile.displayName}</strong><small>@{state.profile.handle} · ONLINE</small></span></Link><Link href="/settings" aria-label="Settings"><Settings size={18} /></Link></div>
      </aside>
      <header className="mobile-header"><Logo href="/home" /><span className="mobile-signal"><i />ROOM ZERO</span><Link href="/notifications" aria-label={`${unread} unread notices`}><Bell size={19} />{unread > 0 && <b>{unread}</b>}</Link></header>
      <main className="app-main" id="main-content">{children}</main>
      <aside className="context-rail">
        <section className="prompt-note signal-prompt"><SectionLabel>DAILY SIGNAL // 01</SectionLabel><blockquote>What did you understand before you could explain it?</blockquote><ComposerDialog trigger={<button>TRANSMIT A RESPONSE <span>↗</span></button>} /></section>
        <section className="rail-section"><SectionLabel>LIVE NODE</SectionLabel><Link href="/chat?room=after-credits-chat" className="live-room-link"><span className="presence-stack"><i /><i /><i /></span><span><strong># after-the-credits</strong><small>11 online · spoilers marked</small></span></Link></section>
        <section className="rail-section rail-guide"><BookOpen size={18} /><div><strong>Know the protocol.</strong><p>Hidden atmosphere needs visible standards. Read them before a difficult thread.</p><Link href="/guidelines">OPEN PROTOCOL</Link></div></section>
        <p className="rail-fineprint">SIGNAL 1–2%* // Sample-dependent estimate. Not intelligence, rank, proof, or diagnosis. All character art is original.</p>
      </aside>
      <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/home" aria-current={pathname === "/home" ? "page" : undefined}><Home /><span>Forum</span></Link><Link href="/spaces" aria-current={pathname.startsWith("/spaces") ? "page" : undefined}><Hash /><span>Channels</span></Link><ComposerDialog trigger={<button className="mobile-compose" aria-label="Start a discussion"><PenLine /></button>} /><Link href="/chat" aria-current={pathname === "/chat" ? "page" : undefined}><MessageCircle /><span>Live</span></Link><Link href={`/members/${state.profile.handle}`} aria-current={pathname.startsWith("/members") ? "page" : undefined}><UserRound /><span>Node</span></Link></nav>
    </div>
  );
}
