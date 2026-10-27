"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Flag, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button, IconButton } from "@/components/ui/primitives";
import { useManywise } from "@/components/providers/manywise-provider";
import type { ReportReason } from "@/lib/types";

const reasons = [
  ["harassment", "Harassment or unwanted contact"],
  ["hate_or_abuse", "Hate or abusive behavior"],
  ["spam", "Spam or manipulation"],
  ["privacy", "Privacy or personal information"],
  ["self_harm_concern", "Concern for someone’s immediate safety"],
  ["misinformation", "Harmful misinformation"],
  ["off_topic", "Type policing or off-topic behavior"],
  ["other", "Something else"],
] as const;

export function ReportDialog({ targetId, trigger, onBlock, memberName, returnFocusId }: { targetId: string; trigger?: ReactNode; onBlock?: () => void; memberName?: string; returnFocusId?: string }) {
  const { report } = useManywise();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const returnFocusRef = useRef<HTMLElement | null>(null);

  function rememberReturnTarget() {
    returnFocusRef.current = document.querySelector<HTMLElement>('[aria-haspopup="menu"][aria-expanded="true"]')
      ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen && !returnFocusRef.current?.isConnected) rememberReturnTarget();
    setOpen(nextOpen);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    report({ targetId, reason, details });
    setOpen(false);
    setDetails("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>{trigger ?? <button className="menu-item" onPointerDown={rememberReturnTarget} onKeyDown={rememberReturnTarget}><Flag size={16} />Report</button>}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog report-dialog" aria-describedby="report-description" onCloseAutoFocus={(event) => {
          const returnTarget = (returnFocusId ? document.getElementById(returnFocusId) : null) ?? returnFocusRef.current;
          if (returnTarget?.isConnected) {
            event.preventDefault();
            returnTarget.focus();
          }
          returnFocusRef.current = null;
        }}>
          <div className="dialog-heading"><div><Dialog.Title>Tell a steward</Dialog.Title><Dialog.Description id="report-description">Reports are private. The person you report will not see who sent it.</Dialog.Description></div><Dialog.Close asChild><IconButton label="Close report"><X size={20} /></IconButton></Dialog.Close></div>
          <form onSubmit={submit}>
            <fieldset className="report-reasons"><legend>What is happening?</legend>{reasons.map(([value, label]) => <label key={value} className="radio-row"><input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} /><span>{label}</span></label>)}</fieldset>
            <label className="field"><span>Anything else stewards should know? <em>Optional</em></span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} rows={4} placeholder="Add context without repeating harmful content unnecessarily." /></label>
            {reason === "self_harm_concern" && <p className="safety-note"><strong>If danger is immediate:</strong> contact local emergency services. Manywise is not a crisis service.</p>}
            {onBlock && <button type="button" className="block-inline" onClick={() => { onBlock(); setOpen(false); }}>Block {memberName ?? "this member"} instead</button>}
            <div className="dialog-actions"><Dialog.Close asChild><Button type="button" variant="quiet">Cancel</Button></Dialog.Close><Button type="submit">Send private report</Button></div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
