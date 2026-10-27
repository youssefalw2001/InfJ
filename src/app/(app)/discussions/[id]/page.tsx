import type { Metadata } from "next";
import { DiscussionDetail } from "@/components/community/discussion-detail";
import { initialDiscussions } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const discussion = initialDiscussions.find((item) => item.id === id);
  return { title: discussion?.title ?? "Conversation", description: discussion ? discussion.body.slice(0, 150) : "A conversation on Manywise.", robots: { index: false, follow: false } };
}
export default async function DiscussionPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DiscussionDetail id={id} />; }
