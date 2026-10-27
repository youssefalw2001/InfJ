import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles, Star } from "lucide-react";
import { ClubFinderQuiz } from "@/components/marketing/club-finder-quiz";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/primitives";
import { spaces } from "@/lib/demo-data";

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manywise",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    description: "The after-class club for adults who love meaningful conversation, anime character study, and INFJ as a reflection lens.",
    inLanguage: "en",
    audience: { "@type": "Audience", audienceType: "Adults interested in INFJ reflection, anime character study, creative fandom, and thoughtful community" },
    publisher: { "@type": "Organization", name: "Manywise" },
  };

  return (
    <div className="landing-page club-era">
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      <header className="landing-header"><Logo /><nav aria-label="Welcome navigation"><a href="#inside">Inside</a><a href="#rarity">The 1–2%</a><a href="#club-finder">Room finder</a><Link href="/guidelines">Community guide</Link></nav><div className="landing-auth"><Link href="/login">Sign in</Link><Link href="/join" className="button button-primary button-sm">Join the clubroom</Link></div></header>
      <main id="main-content">
        <section className="hero club-hero">
          <div className="hero-copy"><Badge><Star size={11} />The 1–2% club* · rare does not mean ranked</Badge><p className="club-note">Club bulletin № 01 / Adults 18+</p><h1>Meet us<br />after class.<br /><em>Bring your whole<br />inner world.</em></h1><p>Manywise is a high-craft online clubroom for INFJ reflection, anime character study, creative courage, friendship, and the conversations that continue after the episode ends.</p><div className="hero-actions"><Link href="/join" className="button button-primary button-lg">Claim a club card <ArrowRight size={18} /></Link><a href="#club-finder" className="button button-secondary button-lg">Find your room</a></div><p className="hero-note">*Some MBTI samples place INFJ around 1–2%. Estimates vary by sample, place, and method. It is not a measure of intelligence or worth.</p></div>
          <div className="hero-art club-poster" aria-label="Four original illustrated Manywise characters sharing an after-class clubroom">
            <div className="poster-tape" aria-hidden="true" />
            <Image src="/after-class-cast.svg" alt="Aya, Ren, Sol, and Mika, four original Manywise characters, talking around a clubroom table after class" width={960} height={720} priority />
            <div className="poster-stamp"><strong>01</strong><span>Original cast<br />No borrowed worlds</span></div>
          </div>
        </section>

        <section className="landing-marquee" aria-label="Community qualities"><span>Character arcs over power rankings</span><i /> <span>Belonging without sameness</span><i /> <span>Rare does not mean ranked</span><i /> <span>Curiosity after the credits</span></section>

        <section className="rarity-club" id="rarity">
          <div className="rarity-number"><span>about</span><strong>1–2%</strong><small>in some MBTI samples*</small></div>
          <div className="rarity-copy"><p className="eyebrow">A small signal, not a superiority badge</p><h2>Rare can explain the relief.<br /><em>It cannot explain the person.</em></h2><p>Shared language can feel like spotting a clubroom light still on. We celebrate that recognition without turning a disputed population estimate into a hierarchy. You still arrive with your own culture, contradictions, fandoms, humor, and changing mind.</p><div><span>01</span><p><strong>Use the estimate honestly.</strong> Samples, regions, instruments, and dates produce different results.</p><span>02</span><p><strong>Make rarity responsible.</strong> A smaller group needs better listening, not louder claims.</p></div><a href="https://www.themyersbriggs.com/en-us/access-resources/articles/leadership-and-the-intuitionfeeling-nf-process-pair" target="_blank" rel="noreferrer">Read the under-2% source and context <ArrowRight size={15} /></a></div>
        </section>

        <section className="landing-preview" id="inside">
          <div className="preview-intro"><p className="eyebrow">Inside Manywise</p><h2>Conversation with<br />room to breathe.</h2><p>No popularity ladders. No infinite feed. Find a room, follow a question, return when you have something real to add.</p><Link href="/spaces">See all conversation rooms <ArrowRight size={16} /></Link></div>
          <article className="sample-thread anime-sample"><div className="sample-label"><span>Demo conversation preview</span><span>Anime & Character Study</span></div><h3>Which character taught you that kindness can have boundaries?</h3><p>“I keep thinking about the moment a gentle character finally says <em>no</em>—not as a transformation into someone colder, but as proof their care includes themselves…”</p><div className="sample-author"><span className="sample-avatar">AS</span><span><strong>Aya Sori</strong><small>Original fictional club member · 12 min ago</small></span></div><div className="sample-actions"><span>♡ 24 resonate</span><span>◌ 11 replies</span><span>4 min read</span></div></article>
        </section>

        <section className="anime-clubroom">
          <div className="anime-panel"><Image src="/after-class-cast.svg" alt="The original Manywise club cast around their shared table" width={960} height={720} /></div>
          <div className="anime-copy"><p className="eyebrow">New room · Media club</p><h2>Love the character.<br /><em>Study the choice.</em></h2><p>Anime & Character Study is for arcs, visual metaphors, music, moral tension, comfort characters, and the friendships built around a shared scene. Bring the reference; leave the franchise wars outside.</p><ul><li><span>01</span>Original fan art and properly credited links</li><li><span>02</span>Spoiler labels and respectful interpretation</li><li><span>03</span>No diagnosing or declaring a character’s “true” type</li></ul><Link href="/spaces/anime-and-character-study" className="button button-primary">Enter the media club <ArrowRight size={17} /></Link></div>
        </section>

        <section className="room-field"><div className="room-field-heading"><p className="eyebrow">A room for the thought you are carrying</p><h2>Pick your after-class table.</h2></div><div className="landing-rooms">{spaces.slice(0, 6).map((space, index) => <Link href={`/spaces/${space.slug}`} className={`landing-room room-${space.color}`} key={space.slug}><span>0{index + 1}</span><div><small>{space.label}</small><h3>{space.name}</h3><p>{space.description}</p></div><ArrowRight size={18} /></Link>)}</div></section>

        <ClubFinderQuiz />

        <section className="values-section" id="values"><div className="values-heading"><p className="eyebrow">A small club with serious standards</p><h2>Special atmosphere.<br />No superiority story.</h2></div><div className="values-grid"><article><MessagesSquare /><span>01</span><h3>Depth at your pace</h3><p>Durable threads, finite feeds, drafts, and quiet notification defaults make leaving and returning feel normal.</p></article><article><HeartHandshake /><span>02</span><h3>Fandom with consent</h3><p>Share enthusiasm without gatekeeping taste, pressuring disclosure, or treating a favorite character as a diagnosis.</p></article><article><ShieldCheck /><span>03</span><h3>Stewardship you can see</h3><p>Plain-language rules, spoiler care, private reporting, scoped moderator roles, and accountable decisions protect the room.</p></article><article><Sparkles /><span>04</span><h3>A lens, never a label</h3><p>No intelligence claims, compatibility scores, type policing, or pretending four letters explain a whole life.</p></article></div></section>

        <section className="safety-callout"><div className="safety-mark"><ShieldCheck /></div><div><p className="eyebrow">Care is club infrastructure</p><h2>Warmth needs<br />good boundaries.</h2></div><div><p>The nostalgic after-school energy is an art direction; Manywise remains an adult community. Reporting, block and mute controls, spoiler etiquette, and clear source/credit rules keep expressive fandom safer.</p><Link href="/guidelines">Read how we gather <ArrowRight size={16} /></Link></div></section>

        <section className="landing-cta"><BookOpen size={26} /><p className="eyebrow">The clubroom light is on</p><h2>Find the people<br />who get the subtext.</h2><p>Make a profile that sounds like a person, add the stories you love, choose your pace, and take the seat that fits today.</p><Link href="/join" className="button button-primary button-lg">Join the 1–2% clubroom <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="landing-footer"><div><Logo /><p>The after-class clubroom for INFJ reflection, anime character study, and people who always notice the subtext.</p></div><div><strong>Explore</strong><Link href="/home">Product demo</Link><Link href="/spaces/anime-and-character-study">Anime clubroom</Link><a href="#club-finder">Room finder</a><Link href="/guidelines">Community guide</Link></div><div><strong>Project</strong><Link href="/privacy">Privacy</Link><a href="/api/health">System health</a><span>Original character artwork</span></div><p className="footer-legal">*INFJ prevalence estimates vary. Rare does not mean better, smarter, or more authentic. Manywise is independent and not affiliated with any personality-typing or anime trademark owner. © 2026 Manywise.</p></footer>
    </div>
  );
}
