import Link from "next/link";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={cn("mark", className)} viewBox="0 0 40 40" role="img" aria-label="Manywise mark">
      <path d="M8 8h9v9H8z" fill="currentColor" />
      <path d="M23 8h9v9h-9zM8 23h9v9H8z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M23 23h9v9h-9z" fill="currentColor" opacity=".45" />
      <path d="M17 12.5h6M12.5 17v6M27.5 17v6M17 27.5h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("logo", className)} aria-label="Manywise home">
      <Mark />
      {!compact && <span>Manywise</span>}
    </Link>
  );
}
