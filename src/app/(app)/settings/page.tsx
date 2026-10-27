import { SettingsPage } from "@/components/settings/settings-page";

export default async function SettingsRoute({ searchParams }: { searchParams: Promise<{ section?: string }> }) { const { section } = await searchParams; return <SettingsPage initialSection={section} />; }
