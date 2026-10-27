import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger"; size?: "sm" | "md" | "lg" }) {
  return <button className={cn("button", `button-${variant}`, `button-${size}`, className)} {...props} />;
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button className={cn("icon-button", className)} aria-label={label} title={label} {...props}>{children}</button>;
}

export function Avatar({ member, size = "md" }: { member?: Member; size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <AvatarPrimitive.Root className={cn("avatar", `avatar-${size}`, member && `avatar-${member.color}`)}>
      {member?.avatarDataUrl && <AvatarPrimitive.Image src={member.avatarDataUrl} alt="" />}
      <AvatarPrimitive.Fallback delayMs={0}>{member?.initials ?? "MW"}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("badge", className)}>{children}</span>;
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("section-label", className)}>{children}</p>;
}

export function Surface({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface", className)} {...props}>{children}</div>;
}

export function DemoBadge() {
  return <span className="demo-badge" title="Changes persist in this browser only"><span aria-hidden="true" />Local demo</span>;
}
