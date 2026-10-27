"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Gauge, Lock, MessagesSquare, ShieldCheck } from "lucide-react";
import { useManywise } from "@/components/providers/manywise-provider";
import { Button } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import type { ProfileSettings } from "@/lib/types";

const interests = ["Inner life", "Relationships", "Creative practice", "Work & purpose", "Growth", "Books & ideas", "Nature & service", "Quiet company"];
const goals = ["Thoughtful conversation", "Friendship", "Creative exchange", "New perspectives", "Gentle accountability", "Simply exploring"];

export default function OnboardingPage() {
  const { hydrated } = useManywise();
  if (!hydrated) return <main className="session-gate" id="main-content" aria-busy="true"><Logo /><p>Preparing your profile…</p></main>;
  return <OnboardingFlow />;
}

function OnboardingFlow() {
  const router = useRouter();
  const { state, completeOnboarding, toast } = useManywise();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileSettings>(state.profile);
  const [guideAccepted, setGuideAccepted] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  function update<Key extends keyof ProfileSettings>(key: Key, value: ProfileSettings[Key]) { setProfile((current) => ({ ...current, [key]: value })); }
  function toggleList(key: "interests" | "goals", value: string) { update(key, profile[key].includes(value) ? profile[key].filter((item) => item !== value) : [...profile[key], value]); }
  function continueStep() {
    if (step === 1 && (profile.displayName.trim().length < 2 || !/^[a-z0-9][a-z0-9_-]{2,31}$/.test(profile.handle))) { toast("Add a display name and a valid handle to continue."); return; }
    if (step === 2 && profile.interests.length < 2) { toast("Choose at least two interests so discovery has somewhere honest to begin."); return; }
    if (step === 3 && !guideAccepted) { toast("Agree to the Community Guide before entering Manywise."); return; }
    if (step < 3) setStep((value) => value + 1); else { completeOnboarding(profile); router.push("/home?welcome=1"); }
  }
  function chooseAvatar(file?: File) { if (!file) return; if (file.size > 1_500_000) { toast("Choose an image under 1.5 MB for the local demo."); return; } const reader = new FileReader(); reader.onload = () => update("avatarDataUrl", String(reader.result)); reader.readAsDataURL(file); }

  return <main className="onboarding-page" id="main-content"><header><Logo /><span>Step {step} of 3</span><button onClick={() => router.push("/")}>Leave for now</button></header><div className="onboarding-progress" aria-label={`Onboarding step ${step} of 3`}><span className={step >= 1 ? "complete" : ""} /><span className={step >= 2 ? "complete" : ""} /><span className={step >= 3 ? "complete" : ""} /></div>
    <section className="onboarding-card">
      {step === 1 && <div className="onboarding-step"><p className="eyebrow">In your own words</p><h1>Make a profile,<br />not a verdict.</h1><p className="step-intro">You can change all of this later. Pronouns and a photo are optional.</p><div className="profile-start"><button className="avatar-upload" onClick={() => fileRef.current?.click()} aria-label="Choose profile photo">{profile.avatarDataUrl ? <Image src={profile.avatarDataUrl} alt="Your profile preview" width={94} height={94} unoptimized /> : <span>{profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}<i><Camera size={15} /></i></button><input ref={fileRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseAvatar(event.target.files?.[0])} /><div className="field-pair"><label className="field"><span>Display name</span><input value={profile.displayName} onChange={(event) => update("displayName", event.target.value)} maxLength={80} required /></label><label className="field"><span>Handle</span><span className="handle-input"><i>@</i><input value={profile.handle} onChange={(event) => update("handle", event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} maxLength={32} required /></span></label></div></div><label className="field"><span>A little about you</span><textarea value={profile.bio} onChange={(event) => update("bio", event.target.value)} rows={4} maxLength={500} placeholder="Interests, questions, current seasons—whatever gives people context." /></label><div className="field-pair"><label className="field"><span>Pronouns <em>Optional</em></span><input value={profile.pronouns} onChange={(event) => update("pronouns", event.target.value)} maxLength={80} placeholder="they/them" /></label><label className="field"><span>Timezone</span><select value={profile.timezone} onChange={(event) => update("timezone", event.target.value)}><option>UTC−8</option><option>UTC−5</option><option>UTC</option><option>UTC+1</option><option>UTC+5:30</option><option>UTC+10</option></select></label></div></div>}
      {step === 2 && <div className="onboarding-step"><p className="eyebrow">Your starting points</p><h1>What draws your<br />attention lately?</h1><p className="step-intro">Choose at least two. Suggestions use only what you declare here—not hidden behavior.</p><fieldset className="choice-field"><legend>Interests</legend><div className="choice-grid">{interests.map((item) => <label key={item} className={profile.interests.includes(item) ? "selected" : ""}><input type="checkbox" checked={profile.interests.includes(item)} onChange={() => toggleList("interests", item)} /><span>{profile.interests.includes(item) && <Check size={15} />}{item}</span></label>)}</div></fieldset><fieldset className="choice-field goals"><legend>What would make this place useful?</legend><div className="choice-grid">{goals.map((item) => <label key={item} className={profile.goals.includes(item) ? "selected" : ""}><input type="checkbox" checked={profile.goals.includes(item)} onChange={() => toggleList("goals", item)} /><span>{profile.goals.includes(item) && <Check size={15} />}{item}</span></label>)}</div></fieldset></div>}
      {step === 3 && <div className="onboarding-step"><p className="eyebrow">Your pace and boundaries</p><h1>Choose how the<br />community reaches you.</h1><p className="step-intro">Calm is specific. Set expectations now; revise them whenever life changes.</p><fieldset className="pace-picker"><legend>Conversation pace</legend>{([ ["slow", "Unhurried", "A weekly digest and fewer live suggestions", Gauge], ["balanced", "Balanced", "A mix of timely and slower conversation", MessagesSquare], ["lively", "Lively", "More active rooms and timely notices", ArrowRight] ] as const).map(([value, title, copy, Icon]) => <label key={value} className={profile.conversationPace === value ? "selected" : ""}><input type="radio" name="pace" checked={profile.conversationPace === value} onChange={() => update("conversationPace", value)} /><Icon /><span><strong>{title}</strong><small>{copy}</small></span>{profile.conversationPace === value && <Check />}</label>)}</fieldset><div className="privacy-choices"><label><span><Lock /><span><strong>Profile visibility</strong><small>Who can open your full profile</small></span></span><select value={profile.profileVisibility} onChange={(event) => update("profileVisibility", event.target.value as ProfileSettings["profileVisibility"])}><option value="members">Members</option><option value="public">Anyone</option><option value="private">Only me</option></select></label><label><span><MessagesSquare /><span><strong>Direct contact</strong><small>Who may start a private conversation</small></span></span><select value={profile.directMessages} onChange={(event) => update("directMessages", event.target.value as ProfileSettings["directMessages"])}><option value="requests">Requests first</option><option value="connections">People I keep up with</option><option value="off">No one</option></select></label></div><label className="guideline-check"><input type="checkbox" required checked={guideAccepted} onChange={(event) => setGuideAccepted(event.target.checked)} /><span><ShieldCheck /><span><strong>I will help make depth safe.</strong><small>I agree to the Community Guide: curiosity over certainty, consent before access, no diagnosis or type policing, and clear reporting when harm happens.</small></span></span></label></div>}
      <footer className="onboarding-actions"><Button variant="quiet" onClick={() => step > 1 ? setStep((value) => value - 1) : router.back()}><ArrowLeft size={17} />Back</Button><Button size="lg" onClick={continueStep}>{step === 3 ? "Enter Manywise" : "Continue"}<ArrowRight size={17} /></Button></footer>
    </section><aside className="onboarding-aside"><span>0{step}</span><p>{step === 1 ? "A useful profile gives others context without asking you to disclose more than you want." : step === 2 ? "You are not an algorithmic category. Declared interests are enough for a respectful beginning." : "Presence, contact, and notifications are separate choices—not a hidden bundle."}</p></aside></main>;
}
