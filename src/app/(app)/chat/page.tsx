import { ChatExperience } from "@/components/chat/chat-experience";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const { room } = await searchParams;
  return <ChatExperience initialRoom={room} />;
}
