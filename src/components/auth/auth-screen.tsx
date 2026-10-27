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
      <section className="auth-brand signal-auth"><Link href="/" className="back-link"><ArrowLeft size={16} />RETURN TO GATE</Link><div className="auth-brand-copy"><p className="eyebrow">MANYWISE // ROOM ZERO</p><h1>{joining ? "Request a node inside." : "Re-enter the network."}</h1><p>{joining ? "Choose a handle, unlock your channels, and set who can reach you. No personality verification. No public rank." : "Your channels are where you left them. No streak. No catch-up punishment. Open the signal you came for."}</p></div><div className="auth-quote"><span>∕∕</span><p>Some conversations<br />need no translation.</p></div></section>
      <section className="auth-panel"><div className="auth-panel-inner"><Logo /><div className="auth-title"><DemoBadge /><h2>{joining ? "Request access" : "Access recognized"}</h2><p>{cloudReady ? "Use your email to continue securely." : "Cloud auth is not configured. Use the complete local demo flow below."}</p></div>
        {cloudReady ? <form action={action} className="auth-form">
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-describedby={state.errors?.email ? "email-error" : undefined} /></label>{state.errors?.email && <p className="field-error" id="email-error">{state.errors.email[0]}</p>}
          <label className="field"><span>Password</span><span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={joining ? "new-password" : "current-password"} minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>{state.errors?.password && <p className="field-error">{state.errors.password[0]}</p>}
          {state.message && <p className="form-message" role="alert">{state.message}</p>}
          <Button type="submit" size="lg" disabled={pending}>{pending ? "Checking signal…" : joining ? "Continue to node setup" : "Enter Room Zero"}<ArrowRight size={17} /></Button>
        </form> : <div className="demo-auth-card"><LockKeyhole size={23} /><h3>Local access tunnel</h3><p>Open the complete forum, channels, anime analysis, live nodes, search, profiles, and controls. Everything stays in this browser.</p><Button size="lg" onClick={enterLocalDemo}>{joining ? "Create local node" : "Enter as Avery // demo"}<ArrowRight size={17} /></Button><small>NO CREDENTIALS // FICTIONAL NETWORK // LOCAL ONLY</small></div>}
        <p className="auth-switch">{joining ? "Already have clearance?" : "No node yet?"} <Link href={joining ? "/login" : "/join"}>{joining ? "Sign in" : "Request access"}</Link></p>
        <p className="terms-note">By continuing, you agree to the <Link href="/guidelines">Community Guide</Link> and confirm you are 18 or older. Read our <Link href="/privacy">privacy approach</Link>.</p>
      </div></section>
    </main>
  );
}
