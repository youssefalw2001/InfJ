import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = { title: "Join", description: "Make your place in Manywise thoughtfully." };
export default function JoinPage() { return <AuthScreen mode="join" />; }
