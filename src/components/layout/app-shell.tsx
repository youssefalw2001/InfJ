"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Compass, Home, MessageCircle, PenLine, Search, Settings, UserRound } from "lucide-react";
import { ComposerDialog } from "@/components/community/composer-dialog";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Button, DemoBadge, SectionLabel } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { members } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Rooms", icon: Compass },
  { href: "/chat", label: "Live rooms", icon: MessageCircle },
  { href: "/search", label: "Discover", icon: Search },
  { href: "/notifications", label: "Notices", icon: Bell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, enterDemo } = useManywise();
  const unread = state.notifications.filter((item) => !item.read).length;
  const demoMember = { ...members[0], handle: state.profile.handle, name: state.profile.displayName, bio: state.profile.bio, interests: state.profile.interests, avatarDataUrl: state.profile.avatarDataUrl, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2) || "AR" };

  if (state.session === "guest") {
    return <main className="session-gate"><Logo /><div className="gate-art" aria-hidden="true"><span /><span /><span /><span /></div><p className="eyebrow">A local product preview</p><h1>Your place is still here.</h1><p>Enter the fully interactive demo, or return to the welcome page. Nothing will be sent to a server.</p><div><Button size="lg" onClick={() => enterDemo(true)}>Enter demo community</Button><Link className="text-link" href="/">Return to welcome</Link></div></main>;
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Logo href="/home" />
        <DemoBadge />
        <nav aria-label="Primary navigation">{navigation.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("nav-link", active && "active")}><Icon size={19} /><span>{label}</span>{label === "Notices" && unread > 0 && <b aria-label={`${unread} unread`}>{unread}</b>}</Link>; })}</nav>
        <ComposerDialog trigger={<Button className="sidebar-compose"><PenLine size={17} />New thread</Button>} />
        <div className="sidebar-profile"><Link href={`/members/${state.profile.handle}`}><Avatar member={demoMember} size="sm" /><span><strong>{state.profile.displayName}</strong><small>@{state.profile.handle}</small></span></Link><Link href="/settings" aria-label="Settings"><Settings size={18} /></Link></div>
      </aside>
      <header className="mobile-header"><Logo href="/home" /><DemoBadge /><Link href="/notifications" aria-label={`${unread} unread notices`}><Bell size={19} />{unread > 0 && <b>{unread}</b>}</Link></header>
      <main className="app-main" id="main-content">{children}</main>
      <aside className="context-rail">
        <section className="prompt-note"><SectionLabel>Today’s open prompt</SectionLabel><blockquote>What have you changed your mind about gently?</blockquote><ComposerDialog trigger={<button>Write into the question <span>↗</span></button>} /></section>
        <section className="rail-section"><SectionLabel>Room tone</SectionLabel><Link href="/chat?room=quiet-corner-chat" className="live-room-link"><span className="presence-stack"><i /><i /><i /></span><span><strong>Quiet Corner</strong><small>8 here · listening welcome</small></span></Link></section>
        <section className="rail-section rail-guide"><BookOpen size={18} /><div><strong>Care makes depth possible.</strong><p>Read the Community Guide before joining a difficult conversation.</p><Link href="/guidelines">Read the guide</Link></div></section>
        <p className="rail-fineprint">Manywise uses personality type as a reflection lens—not a diagnosis. Independent and not affiliated with any personality-typing trademark owner.</p>
      </aside>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/home" aria-current={pathname === "/home" ? "page" : undefined}><Home /><span>Home</span></Link>
        <Link href="/spaces" aria-current={pathname.startsWith("/spaces") ? "page" : undefined}><Compass /><span>Rooms</span></Link>
        <ComposerDialog trigger={<button className="mobile-compose" aria-label="Start a discussion"><PenLine /></button>} />
        <Link href="/chat" aria-current={pathname === "/chat" ? "page" : undefined}><MessageCircle /><span>Live</span></Link>
        <Link href={`/members/${state.profile.handle}`} aria-current={pathname.startsWith("/members") ? "page" : undefined}><UserRound /><span>You</span></Link>
      </nav>
    </div>
  );
}
