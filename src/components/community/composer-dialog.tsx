"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { ImagePlus, Link2, PenLine, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, IconButton } from "@/components/ui/primitives";
import { useManywise } from "@/components/providers/manywise-provider";
import { spaces } from "@/lib/demo-data";

const DRAFT_KEY = "manywise-composer-draft-v1";

type Draft = { title: string; body: string; spaceSlug: string; tags: string; linkUrl: string; imageDataUrl?: string; imageName?: string };
const emptyDraft: Draft = { title: "", body: "", spaceSlug: "inner-worlds", tags: "", linkUrl: "" };

export function ComposerDialog({ trigger, defaultSpace }: { trigger?: ReactNode; defaultSpace?: string }) {
  const router = useRouter();
  const { createDiscussion, toast } = useManywise();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, spaceSlug: defaultSpace ?? emptyDraft.spaceSlug });
  const [tab, setTab] = useState("write");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      try {
        const saved = window.localStorage.getItem(DRAFT_KEY);
        if (saved) setDraft(JSON.parse(saved) as Draft);
      } catch { window.localStorage.removeItem(DRAFT_KEY); }
    }
    setOpen(nextOpen);
  }

  useEffect(() => {
    if (open) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, open]);

  function update<Key extends keyof Draft>(key: Key, value: Draft[Key]) { setDraft((current) => ({ ...current, [key]: value })); }

  function pickImage(file?: File) {
    if (!file) return;
    if (file.size > 1_500_000) { toast("For the local demo, choose an image under 1.5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, imageDataUrl: String(reader.result), imageName: file.name }));
    reader.readAsDataURL(file);
  }

  function publish(event: React.FormEvent) {
    event.preventDefault();
    let linkUrl = draft.linkUrl.trim() || undefined;
    if (linkUrl && !/^https?:\/\//i.test(linkUrl)) linkUrl = `https://${linkUrl}`;
    const id = createDiscussion({ title: draft.title, body: draft.body, spaceSlug: draft.spaceSlug, tags: draft.tags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).slice(0, 4), linkUrl, imageDataUrl: draft.imageDataUrl });
    if (!id) return;
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft({ ...emptyDraft, spaceSlug: defaultSpace ?? emptyDraft.spaceSlug });
    setOpen(false);
    router.push(`/discussions/${id}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger ?? <Button><PenLine size={17} />Start a discussion</Button>}</Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog composer-dialog" aria-describedby="composer-description">
        <div className="dialog-heading"><div><Dialog.Title>Start a thoughtful thread</Dialog.Title><Dialog.Description id="composer-description">Context helps people respond with care. Your draft stays in this browser.</Dialog.Description></div><Dialog.Close asChild><IconButton label="Close composer"><X size={20} /></IconButton></Dialog.Close></div>
        <Tabs.Root value={tab} onValueChange={setTab} className="composer-tabs"><Tabs.List aria-label="Composer view"><Tabs.Trigger value="write">Write</Tabs.Trigger><Tabs.Trigger value="preview">Preview</Tabs.Trigger></Tabs.List>
          <form onSubmit={publish}>
            <Tabs.Content value="write" className="composer-fields">
              <label className="field"><span>Room</span><select value={draft.spaceSlug} onChange={(event) => update("spaceSlug", event.target.value)}>{spaces.map((space) => <option key={space.slug} value={space.slug}>{space.name}</option>)}</select></label>
              <label className="field"><span>Title</span><input autoFocus value={draft.title} onChange={(event) => update("title", event.target.value)} maxLength={180} placeholder="Name the question or thought clearly" required /></label>
              <label className="field"><span>Your reflection or question</span><textarea value={draft.body} onChange={(event) => update("body", event.target.value)} maxLength={50000} rows={9} placeholder="What have you noticed? What kind of response would be useful?" required /></label>
              <div className="composer-extras">
                <button type="button" onClick={() => fileRef.current?.click()}><ImagePlus size={18} />{draft.imageName ?? "Add image"}</button><input ref={fileRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => pickImage(event.target.files?.[0])} />
                <label><Link2 size={18} /><span className="sr-only">Optional link</span><input type="url" value={draft.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} placeholder="Optional link" /></label>
              </div>
              {draft.imageDataUrl && <div className="image-preview"><Image src={draft.imageDataUrl} alt="Image preview" width={900} height={520} unoptimized /><button type="button" onClick={() => setDraft((current) => ({ ...current, imageDataUrl: undefined, imageName: undefined }))}>Remove</button></div>}
              <label className="field"><span>Tags <em>Up to 4, separated by commas</em></span><input value={draft.tags} onChange={(event) => update("tags", event.target.value)} placeholder="reflection, boundaries" /></label>
            </Tabs.Content>
            <Tabs.Content value="preview" className="post-preview"><p className="section-label">Preview</p><h2>{draft.title || "Your title will appear here"}</h2>{(draft.body || "Your words will appear here, with paragraphs preserved.").split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || <br />}</p>)}{draft.imageDataUrl && <Image src={draft.imageDataUrl} alt="Preview of member-selected upload" width={900} height={520} unoptimized />}</Tabs.Content>
            <div className="composer-footer"><span>Saved locally just now</span><div><Button type="button" variant="quiet" onClick={() => { window.localStorage.removeItem(DRAFT_KEY); setDraft({ ...emptyDraft, spaceSlug: defaultSpace ?? emptyDraft.spaceSlug }); }}>Clear draft</Button><Button type="submit">Publish thread</Button></div></div>
          </form>
        </Tabs.Root>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  );
}
