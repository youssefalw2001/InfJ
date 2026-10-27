import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";

function ShellFallback() {
  return <main className="page-shell" aria-busy="true" aria-label="Preparing community"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-tabs" /><div className="skeleton skeleton-card" /></main>;
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellFallback />}><AppShell>{children}</AppShell></Suspense>;
}
