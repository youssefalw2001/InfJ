import type { Metadata } from "next";
import { MemberProfile } from "@/components/community/member-profile";
import { members } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> { const { handle } = await params; const member = members.find((item) => item.handle === handle); return { title: member?.name ?? "Member", description: member ? `${member.name} on Manywise.` : "A privacy-respecting Manywise profile.", robots: { index: false, follow: false } }; }
export default async function MemberPage({ params }: { params: Promise<{ handle: string }> }) { const { handle } = await params; return <MemberProfile handle={handle} />; }
