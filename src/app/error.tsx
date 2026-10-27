"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/primitives";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="not-found" id="main-content"><p className="eyebrow">A seam came loose</p><h1>We couldn’t hold that page together.</h1><p>Your local work should still be here. Try the view again; if it keeps happening, return home.</p><Button onClick={reset}><RotateCcw size={17} />Try again</Button></main>;
}
