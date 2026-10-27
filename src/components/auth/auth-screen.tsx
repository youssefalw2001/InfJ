"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { signIn, signUp, type AuthActionState } from "@/app/actions/auth";
import { useManywise } from "@/components/providers/manywise-provider";
import { Logo } from "@/components/ui/logo";
import { Button, DemoBadge } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const initialState: AuthActionState = {};

export function AuthScreen({ mode }: { mode: "login" | "join" }) {
  const router = useRouter();
  const { enterDemo } = useManywise();
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(mode === "login" ? signIn : signUp, initialState);
  const cloudReady = isSupabaseConfigured();
  const joining = mode === "join";

  function enterLocalDemo() {
    enterDemo(!joining);
    router.push(joining ? "/onboarding" : "/home");
  }

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-brand"><Link href="/" className="back-link"><ArrowLeft size={16} />Back to welcome</Link><div className="auth-brand-copy"><p className="eyebrow">Many perspectives. Distinct edges.</p><h1>{joining ? "Begin with what feels true now." : "Return without catching up."}</h1><p>{joining ? "You will choose your pace, interests, and boundaries next. No personality test. No proof required." : "No streaks were lost. No feed is waiting to scold you. Pick up where your attention leads."}</p></div><div className="auth-quote"><span>“</span><p>Recognition is useful.<br />Being fully known takes context.</p></div></section>
      <section className="auth-panel"><div className="auth-panel-inner"><Logo /><div className="auth-title"><DemoBadge /><h2>{joining ? "Create your account" : "Welcome back"}</h2><p>{cloudReady ? "Use your email to continue securely." : "Cloud auth is not configured. Use the complete local demo flow below."}</p></div>
        {cloudReady ? <form action={action} className="auth-form">
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-describedby={state.errors?.email ? "email-error" : undefined} /></label>{state.errors?.email && <p className="field-error" id="email-error">{state.errors.email[0]}</p>}
          <label className="field"><span>Password</span><span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={joining ? "new-password" : "current-password"} minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>{state.errors?.password && <p className="field-error">{state.errors.password[0]}</p>}
          {state.message && <p className="form-message" role="alert">{state.message}</p>}
          <Button type="submit" size="lg" disabled={pending}>{pending ? "One moment…" : joining ? "Continue to your profile" : "Enter Manywise"}<ArrowRight size={17} /></Button>
        </form> : <div className="demo-auth-card"><LockKeyhole size={23} /><h3>Private browser demo</h3><p>Explore onboarding, posting, replies, reactions, chat, search, profiles, settings, and safety flows. Your changes stay in this browser.</p><Button size="lg" onClick={enterLocalDemo}>{joining ? "Create demo profile" : "Enter as Avery Rowan"}<ArrowRight size={17} /></Button><small>No credentials required · Clearly fictional demo content</small></div>}
        <p className="auth-switch">{joining ? "Already have a place here?" : "New to Manywise?"} <Link href={joining ? "/login" : "/join"}>{joining ? "Sign in" : "Create an account"}</Link></p>
        <p className="terms-note">By continuing, you agree to the <Link href="/guidelines">Community Guide</Link> and confirm you are 18 or older. Read our <Link href="/privacy">privacy approach</Link>.</p>
      </div></section>
    </main>
  );
}
