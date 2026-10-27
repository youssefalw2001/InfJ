import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return <main className="not-found" id="main-content"><Logo /><div className="empty-art" aria-hidden="true"><i /><i /><i /></div><p className="eyebrow">404 · a quiet blank</p><h1>This thought isn’t here.</h1><p>It may have moved, been made private, or never existed. There is nothing you need to solve.</p><Link href="/home" className="button button-primary"><ArrowLeft size={17} />Return home</Link></main>;
}
