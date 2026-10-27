import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Hash, LockKeyhole, Radio, ShieldCheck, Terminal } from "lucide-react";
import { ClubFinderQuiz } from "@/components/marketing/club-finder-quiz";
import { Logo } from "@/components/ui/logo";
import { spaces } from "@/lib/demo-data";

const forumThreads = [
  { code: "SIG-091", channel: "# anime-analysis", title: "The quiet character who understood everything first", author: "@aya-sori", replies: 31, status: "ACTIVE" },
  { code: "INT-204", channel: "# inner-worlds", title: "Do you trust the thought you cannot explain yet?", author: "@mira-lantern", replies: 18, status: "NEW" },
  { code: "ARC-017", channel: "# relationships", title: "When being understood feels more intimate than being liked", author: "@noor-vale", replies: 46, status: "ACTIVE" },
  { code: "LOG-338", channel: "# creation-lab", title: "Making something nobody asked for", author: "@jonah-moss", replies: 12, status: "OPEN" },
];

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manywise",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    description: "A private-feeling forum for adults who catch the subtext: INFJ reflection, anime character analysis, live channels, and deep conversation.",
    inLanguage: "en",
    audience: { "@type": "Audience", audienceType: "Adults interested in INFJ reflection, anime character analysis, and forum culture" },
    publisher: { "@type": "Organization", name: "Manywise" },
  };

  return (
    <div className="underground-era">
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      <header className="underground-header"><Logo /><span className="gate-code">GATE://01</span><nav aria-label="Welcome navigation"><a href="#forum">FORUM</a><a href="#channels">CHANNELS</a><a href="#club-finder">SIGNAL TEST</a><Link href="/guidelines">PROTOCOL</Link></nav><div><span className="network-status"><i />NETWORK OPEN</span><Link href="/login">SIGN IN</Link><Link href="/join" className="access-button">REQUEST ACCESS</Link></div></header>
      <main id="main-content">
        <section className="underground-hero">
          <div className="underground-hero-copy"><div className="access-kicker"><Radio size={14} /><span>PRIVATE SIGNAL NETWORK</span><b>ADULTS 18+</b></div><h1>NOT EVERYONE<br />READS THE LAYER<br /><em>UNDERNEATH.</em></h1><p className="hero-decode">IF YOU CAUGHT THAT, YOU’RE ALREADY CLOSE.</p><p className="hero-intro">Manywise is the forum behind the obvious conversation. INFJ is the entry signal. Anime, character analysis, strange ideas, creative work, and the things you notice before they have language are what happen inside.</p><div className="underground-actions"><Link href="/join"><LockKeyhole size={17} />ENTER ROOM ZERO <ArrowRight size={16} /></Link><a href="#club-finder"><Terminal size={17} />RUN SIGNAL TEST</a></div><div className="hero-proof"><span>EST. // 2026</span><span>NO PUBLIC RANKS</span><span>NO ALGORITHM BAIT</span><span>1–2% SIGNAL*</span></div><small>*A sample-dependent INFJ estimate, never a claim of intelligence or human value.</small></div>
          <div className="transmission-panel"><header><span>LIVE TRANSMISSION // ROOM ZERO</span><i /><i /><i /></header><div className="cast-frame"><Image src="/after-class-cast.svg" alt="Four original adult Manywise characters sharing a late Room Zero conversation" width={960} height={720} priority /><span className="scanline" /></div><div className="transmission-roster"><span><i className="online" />AYA // ANALYSIS</span><span><i className="online" />REN // CREATION</span><span><i />SOL // OBSERVING</span><span><i className="online" />MIKA // ARCHIVE</span></div><footer><span>ORIGINAL CAST // NO BORROWED WORLDS</span><b>04 ONLINE</b></footer></div>
        </section>

        <section className="signal-ticker" aria-label="Manywise principles"><span>SIGNAL: SOME CONVERSATIONS NEED NO TRANSLATION</span><i>01</i><span>SIGNAL: CHARACTER ARCS &gt; POWER RANKINGS</span><i>02</i><span>SIGNAL: RARE DOES NOT MEAN RANKED</span><i>03</i></section>

        <section className="forum-terminal" id="forum"><header><div><p className="terminal-label">MANYWISE_FORUM / LIVE INDEX</p><h2>The threads people<br />cannot have anywhere else.</h2></div><div className="terminal-stats"><span><b>09</b>CHANNELS</span><span><b>24</b>OPEN SIGNALS</span><span><b>∞</b>ROOM FOR NUANCE</span></div></header><div className="thread-index"><div className="thread-head"><span>CODE / CHANNEL</span><span>TRANSMISSION</span><span>NODE</span><span>REPLIES</span><span>STATUS</span></div>{forumThreads.map((thread) => <Link href="/home" key={thread.code} className="thread-row"><span><b>{thread.code}</b><small>{thread.channel}</small></span><strong>{thread.title}</strong><span>{thread.author}</span><span>{thread.replies}</span><span className={`status status-${thread.status.toLowerCase()}`}>{thread.status}</span></Link>)}</div><footer><p><Eye size={16} />Read publicly. Contribute after access. Leave without performing.</p><Link href="/home">OPEN THE DEMO FORUM <ArrowRight size={15} /></Link></footer></section>

        <section className="rarity-node"><div className="rarity-code"><span>SIGNAL DENSITY</span><strong>01—02%</strong><small>ESTIMATED IN SOME MBTI SAMPLES*</small></div><div className="rarity-message"><p className="terminal-label">RARE // NOT RANKED</p><h2>You are not “better.”<br />You may be harder to find.</h2><p>The number is not the product. The recognition is. Manywise turns that uncommon feeling of being on the same wavelength into channels, running jokes, shared references, lore, and people who remember what you meant.</p><a href="https://www.themyersbriggs.com/en-us/access-resources/articles/leadership-and-the-intuitionfeeling-nf-process-pair" target="_blank" rel="noreferrer">SOURCE / CONTEXT <ArrowRight size={14} /></a></div></section>

        <section className="channel-directory" id="channels"><header><p className="terminal-label">CHANNEL DIRECTORY // CHOOSE YOUR FREQUENCY</p><h2>No wellness categories.<br />Just places worth opening.</h2></header><div>{spaces.map((space, index) => <Link href={`/spaces/${space.slug}`} key={space.slug} className={`channel-node channel-${space.color}`}><span className="channel-hash">#</span><div><small>CH-{String(index + 1).padStart(2, "0")} · {space.label}</small><h3>{space.name}</h3><p>{space.description}</p></div><span className="channel-meta"><i className="online" />{space.activeNow} LIVE</span><ArrowRight size={18} /></Link>)}</div></section>

        <section className="anime-signal"><div className="anime-signal-visual"><Image src="/after-class-cast.svg" alt="The original adult Manywise cast in their hidden late-session forum room" width={960} height={720} /><span>FRAME_004 // AFTER THE CREDITS</span></div><div><p className="terminal-label"># ANIME-ANALYSIS</p><h2>The episode ended.<br />The real conversation did not.</h2><p>Character motives. Visual codes. Moral choices. The side character who saw everything. The scene that changed meaning three days later. No fandom wars. No copied characters. No surface-level ranking threads.</p><ul><li><Hash />SPOILERS_MARKED</li><li><Hash />ART_CREDITED</li><li><Hash />INTERPRETATION_OPEN</li></ul><Link href="/spaces/anime-and-character-study">ENTER #ANIME-ANALYSIS <ArrowRight size={15} /></Link></div></section>

        <ClubFinderQuiz />

        <section className="underground-manifesto"><header><ShieldCheck /><p className="terminal-label">ROOM ZERO PROTOCOL</p><h2>Hidden feeling.<br />Visible standards.</h2></header><div><article><span>01</span><h3>NO TYPE POLICE.</h3><p>Four letters open a conversation. They do not decide who belongs or who is authentic.</p></article><article><span>02</span><h3>NO PUBLIC SCORE.</h3><p>No follower totals, karma ladder, streak, or leaderboard deciding whose voice counts.</p></article><article><span>03</span><h3>NO FORCED ACCESS.</h3><p>DM requests, blocks, private reporting, and presence controls are part of the architecture.</p></article><article><span>04</span><h3>KEEP THE SIGNAL CLEAN.</h3><p>Credit creators. Mark spoilers. Debate the idea. Do not turn a person into a target.</p></article></div><Link href="/guidelines">READ THE FULL PROTOCOL <ArrowRight size={15} /></Link></section>

        <section className="access-cta"><span className="access-orbit" aria-hidden="true">01</span><p className="terminal-label">ACCESS WINDOW // OPEN</p><h2>Stop translating<br />the subtext.</h2><p>Enter Room Zero. Pick your channels. Find the people who already caught it.</p><Link href="/join">REQUEST ACCESS <ArrowRight size={18} /></Link><small>18+ // PSEUDONYMS WELCOME // EXIT ANYTIME</small></section>
      </main>
      <footer className="underground-footer"><Logo /><p>MANYWISE // THE FORUM BEHIND THE OBVIOUS CONVERSATION.</p><nav><Link href="/home">FORUM</Link><Link href="/spaces">CHANNELS</Link><Link href="/guidelines">PROTOCOL</Link><Link href="/privacy">PRIVACY</Link></nav><span>*Prevalence varies by sample and method. No intelligence, superiority, or diagnostic claim. Independent of personality-typing and anime trademark owners.</span></footer>
    </div>
  );
}
