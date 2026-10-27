import { ShieldX } from "lucide-react";
import { getViewer } from "@/lib/dal/auth";
import { ModerationConsole } from "@/components/moderation/moderation-console";

export default async function ModerationPage() {
  const viewer = await getViewer();
  if (!viewer || !["moderator", "admin"].includes(viewer.role)) return <div className="page-shell"><div className="access-denied"><ShieldX /><p className="eyebrow">Restricted route</p><h1>Steward access required.</h1><p>Administrative controls are authorized on the server and are never exposed to ordinary members. The local demo intentionally does not simulate elevated access.</p></div></div>;
  return <ModerationConsole stewardName={viewer.displayName} />;
}
