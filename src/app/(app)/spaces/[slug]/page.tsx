import type { Metadata } from "next";
import { SpaceDetail } from "@/components/community/space-detail";
import { spaces } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const space = spaces.find((item) => item.slug === slug);
  return { title: space?.name ?? "Room", description: space?.description ?? "A Manywise conversation room.", robots: { index: Boolean(space), follow: true } };
}

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SpaceDetail slug={slug} />;
}
