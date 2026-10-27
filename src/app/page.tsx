import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Logo, Mark } from "@/components/ui/logo";
import { Badge } from "@/components/ui/primitives";
import { spaces } from "@/lib/demo-data";

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manywise",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    description: "A thoughtful community for adults who use INFJ as a lens for self-reflection, never a box.",
    inLanguage: "en",
    audience: { "@type": "Audience", audienceType: "Adults interested in thoughtful personality-type reflection and community" },
    publisher: { "@type": "Organization", name: "Manywise" },
  };
  return (
    <div className="landing-page">
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      <header className="landing-header"><Logo /><nav aria-label="Welcome navigation"><a href="#inside">Inside</a><a href="#values">Values</a><Link href="/guidelines">Community guide</Link></nav><div className="landing-auth"><Link href="/login">Sign in</Link><Link href="/join" className="button button-primary button-sm">Join thoughtfully</Link></div></header>
      <main id="main-content">
        <section className="hero">
          <div className="hero-copy"><Badge>For people who identify with INFJ · and arrive with nuance</Badge><h1>A place to be<br /><em>more than a type.</em></h1><p>Manywise is a calmer online community for considered conversation, creative courage, friendship, and the useful complexity of being human.</p><div className="hero-actions"><Link href="/join" className="button button-primary button-lg">Find your room <ArrowRight size={18} /></Link><Link href="/home" className="button button-secondary button-lg">Explore the demo</Link></div><p className="hero-note">Personality type is a reflection lens—not a diagnosis, proof, or rulebook.</p></div>
          <div className="hero-art" aria-label="An abstract illustration of four distinct perspectives making a shared whole">
            <div className="art-grid"><span className="art-tile tile-one"><i>notice</i></span><span className="art-tile tile-two"><i>question</i></span><span className="art-tile tile-three"><i>make</i></span><span className="art-tile tile-four"><i>revise</i></span><Mark /></div>
            <div className="art-caption"><span>01</span><p>Distinct edges.<br />Shared attention.</p></div>
          </div>
        </section>

        <section className="landing-marquee" aria-label="Community qualities"><span>Depth without performance</span><i /> <span>Belonging without sameness</span><i /> <span>Curiosity without certainty</span></section>

        <section className="landing-preview" id="inside">
          <div className="preview-intro"><p className="eyebrow">Inside Manywise</p><h2>Conversation with<br />room to breathe.</h2><p>No popularity ladders. No infinite feed. Find a room, follow a question, return when you have something real to add.</p><Link href="/spaces">See all conversation rooms <ArrowRight size={16} /></Link></div>
          <article className="sample-thread"><div className="sample-label"><span>Demo conversation preview</span><span>Inner Worlds</span></div><h3>A two-minute ritual for hearing the quieter answer</h3><p>“I have been trying a tiny pause before decisions: two columns titled <em>what is loud</em> and <em>what is true</em>…”</p><div className="sample-author"><span className="sample-avatar">ML</span><span><strong>Mira Lantern</strong><small>Fictional demo member · 18 min ago</small></span></div><div className="sample-actions"><span>♡ 18 resonate</span><span>◌ 8 replies</span><span>3 min read</span></div></article>
        </section>

        <section className="room-field"><div className="room-field-heading"><p className="eyebrow">A room for the thought you are carrying</p><h2>Start somewhere specific.</h2></div><div className="landing-rooms">{spaces.slice(0, 6).map((space, index) => <Link href={`/spaces/${space.slug}`} className={`landing-room room-${space.color}`} key={space.slug}><span>0{index + 1}</span><div><small>{space.label}</small><h3>{space.name}</h3><p>{space.description}</p></div><ArrowRight size={18} /></Link>)}</div></section>

        <section className="values-section" id="values"><div className="values-heading"><p className="eyebrow">Designed around human limits</p><h2>Not another machine<br />for being noticed.</h2></div><div className="values-grid"><article><MessagesSquare /><span>01</span><h3>Depth at your pace</h3><p>Durable threads, finite feeds, drafts, and quiet notification defaults make leaving and returning feel normal.</p></article><article><HeartHandshake /><span>02</span><h3>Connection with consent</h3><p>Contact requests, private presence, pseudonyms, blocking, and clear audience choices put boundaries before access.</p></article><article><ShieldCheck /><span>03</span><h3>Stewardship you can see</h3><p>Plain-language rules, private reporting, scoped moderator roles, and accountable decisions protect the container.</p></article><article><Sparkles /><span>04</span><h3>A lens, never a label</h3><p>No rarity claims, compatibility scores, type policing, amateur diagnosis, or pretending four letters explain a life.</p></article></div></section>

        <section className="safety-callout"><div className="safety-mark"><ShieldCheck /></div><div><p className="eyebrow">Care is infrastructure</p><h2>Warmth needs<br />good boundaries.</h2></div><div><p>Manywise is built for adults, with a clear Community Guide, in-context reporting, block and mute controls, and no expectation that members provide professional care.</p><Link href="/guidelines">Read how we gather <ArrowRight size={16} /></Link></div></section>

        <section className="landing-cta"><BookOpen size={26} /><p className="eyebrow">Bring the unfinished thought</p><h2>Come as nuanced<br />as you are.</h2><p>Make a profile that sounds like a person, choose your pace, and find the room that fits today.</p><Link href="/join" className="button button-primary button-lg">Begin with intention <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="landing-footer"><div><Logo /><p>A thoughtful social home for people who use INFJ as a lens, never a box.</p></div><div><strong>Explore</strong><Link href="/home">Product demo</Link><Link href="/spaces">Rooms</Link><Link href="/guidelines">Community guide</Link></div><div><strong>Project</strong><Link href="/privacy">Privacy</Link><a href="/api/health">System health</a><span>Source-ready build</span></div><p className="footer-legal">Independent and not affiliated with, endorsed by, or sponsored by any personality-typing trademark owner. © 2026 Manywise.</p></footer>
    </div>
  );
}
