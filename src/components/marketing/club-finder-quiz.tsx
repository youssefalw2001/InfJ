"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { spaces } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type RoomSlug = "anime-and-character-study" | "creativity" | "books-and-ideas" | "quiet-corner" | "inner-worlds" | "relationships" | "ask-manywise";
type Choice = { label: string; note: string; room: RoomSlug };
type Question = { eyebrow: string; title: string; choices: Choice[] };

const questions: Question[] = [
  {
    eyebrow: "CHANNEL SCAN // 01",
    title: "Which channel would you open at 02:13?",
    choices: [
      { label: "The screening room", note: "Character arcs, symbolism, and scenes I cannot stop thinking about", room: "anime-and-character-study" },
      { label: "The art room", note: "Sketches, stories, edits, and work that can stay unfinished", room: "creativity" },
      { label: "The library table", note: "Big ideas, marginal notes, and respectful argument", room: "books-and-ideas" },
      { label: "The quiet stairwell", note: "Low-pressure company and somewhere to exhale", room: "quiet-corner" },
    ],
  },
  {
    eyebrow: "PATTERN READ // 02",
    title: "A character makes the choice nobody understands. What do you read first?",
    choices: [
      { label: "The hidden motive", note: "I want to understand the inner logic beneath the action", room: "inner-worlds" },
      { label: "The relationship fallout", note: "Who stays, who repairs, and what trust costs", room: "relationships" },
      { label: "The visual metaphor", note: "Color, framing, music, and the story under the story", room: "anime-and-character-study" },
      { label: "The debate afterward", note: "I want three interpretations and a careful disagreement", room: "books-and-ideas" },
    ],
  },
  {
    eyebrow: "RETURN SIGNAL // 03",
    title: "What makes a hidden forum worth returning to?",
    choices: [
      { label: "Someone gets the reference", note: "Fandom friends who care about why a story matters", room: "anime-and-character-study" },
      { label: "A real question", note: "I want perspectives, not a rapid-fire answer", room: "ask-manywise" },
      { label: "A gentler pace", note: "I want to read, listen, and answer later", room: "quiet-corner" },
      { label: "Creative momentum", note: "Kind, specific company around something I am making", room: "creativity" },
    ],
  },
];

export function ClubFinderQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RoomSlug[]>([]);
  const complete = step >= questions.length;
  const result = useMemo(() => {
    if (!complete) return null;
    const totals = answers.reduce<Partial<Record<RoomSlug, number>>>((score, room) => ({ ...score, [room]: (score[room] ?? 0) + 1 }), {});
    const slug = (Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "anime-and-character-study") as RoomSlug;
    return spaces.find((space) => space.slug === slug) ?? spaces[0];
  }, [answers, complete]);

  function choose(room: RoomSlug) {
    setAnswers((current) => [...current.slice(0, step), room]);
    setStep((current) => current + 1);
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  return (
    <section className="club-quiz" id="club-finder" aria-labelledby="club-finder-title">
      <div className="quiz-rail">
        <p className="eyebrow">SIGNAL CALIBRATION // 60 SEC</p>
        <span className="quiz-number">{complete ? "✓" : `0${step + 1}`}</span>
        <div className="quiz-progress" aria-label={`Quiz progress: ${Math.min(step, questions.length)} of ${questions.length}`}>
          {questions.map((_, index) => <i key={index} className={cn(index < step && "complete", index === step && !complete && "current")} />)}
        </div>
        <p>Route finder.<br /><strong>Not an identity test.</strong></p>
      </div>
      <div className="quiz-main">
        {!complete && <>
          <header><p className="eyebrow">{questions[step].eyebrow}</p><h2 id="club-finder-title">{questions[step].title}</h2><p>Choose the signal you would follow. There is no correct or “most INFJ” answer.</p></header>
          <div className="quiz-choices">{questions[step].choices.map((choice, index) => <button key={choice.label} onClick={() => choose(choice.room)}><span>{String.fromCharCode(65 + index)}</span><div><strong>{choice.label}</strong><small>{choice.note}</small></div><ArrowRight size={19} /></button>)}</div>
          <footer>{step > 0 ? <button onClick={goBack}><ArrowLeft size={15} />Previous question</button> : <span />}</footer>
        </>}
        {complete && result && <div className="quiz-result"><div className={`result-stamp result-${result.color}`}><Check size={28} /><small>Route found</small></div><p className="eyebrow">ACCESS PATH // CALIBRATED</p><h2 id="club-finder-title">Your first channel: {result.name}.</h2><p>{result.description}</p><blockquote>“{result.prompt}”</blockquote><div><Link href={`/spaces/${result.slug}`} className="button button-primary button-lg">OPEN CHANNEL <ArrowRight size={18} /></Link><button onClick={restart}><RotateCcw size={15} />Try again</button></div><small><Sparkles size={13} />Your result stays in this browser and is not added to a profile.</small></div>}
      </div>
    </section>
  );
}
