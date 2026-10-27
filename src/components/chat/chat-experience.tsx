"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BellOff, ChevronDown, CornerDownRight, Heart, Info, MoreHorizontal, Send, Signal, Users, WifiOff, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReportDialog } from "@/components/community/report-dialog";
import { useManywise } from "@/components/providers/manywise-provider";
import { Avatar, Badge, Button, IconButton } from "@/components/ui/primitives";
import { chatRooms, members } from "@/lib/demo-data";
import type { ChatMessage, Member } from "@/lib/types";
import { cn } from "@/lib/utils";

function getMember(handle: string, viewer: Member) { return members.find((member) => member.handle === handle) ?? viewer; }

export function ChatExperience({ initialRoom }: { initialRoom?: string }) {
  const { state, sendMessage, toggleMessageReaction, blockMember, toast } = useManywise();
  const [roomId, setRoomId] = useState(chatRooms.some((room) => room.id === initialRoom) ? initialRoom! : chatRooms[0].id);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [muted, setMuted] = useState(false);
  const [leftRoomIds, setLeftRoomIds] = useState<string[]>([]);
  const [online, setOnline] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableRooms = chatRooms.filter((item) => !leftRoomIds.includes(item.id));
  const room = availableRooms.find((item) => item.id === roomId) ?? availableRooms[0] ?? chatRooms[0];
  const viewer: Member = { handle: state.profile.handle, name: state.profile.displayName, initials: state.profile.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2), bio: state.profile.bio, interests: state.profile.interests, color: "clay", joined: "Today", avatarDataUrl: state.profile.avatarDataUrl };
  const messages = useMemo(() => state.chatMessages.filter((message) => message.roomId === roomId && !state.blockedMembers.includes(message.authorHandle)), [roomId, state.blockedMembers, state.chatMessages]);

  useEffect(() => { const update = () => setOnline(navigator.onLine); update(); window.addEventListener("online", update); window.addEventListener("offline", update); return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); }; }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length, roomId]);
  useEffect(() => { if (!("BroadcastChannel" in window)) return; const channel = new BroadcastChannel("manywise-demo-typing"); channel.onmessage = (event: MessageEvent<{ roomId: string; name: string; typing: boolean }>) => { if (event.data.roomId === roomId) { setTyping(event.data.typing ? event.data.name : null); if (typingTimer.current) clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(null), 2500); } }; return () => channel.close(); }, [roomId]);

  function changeBody(value: string) { setBody(value); if ("BroadcastChannel" in window) { const channel = new BroadcastChannel("manywise-demo-typing"); channel.postMessage({ roomId, name: state.profile.displayName, typing: Boolean(value) }); channel.close(); } }
  function submit(event: React.FormEvent) { event.preventDefault(); if (sendMessage(roomId, body, replyTo?.id)) { setBody(""); setReplyTo(null); } }
  function leaveRoom() {
    const nextRoom = availableRooms.find((item) => item.id !== roomId);
    setLeftRoomIds((current) => [...current, roomId]);
    if (nextRoom) setRoomId(nextRoom.id);
    toast("You left the live room for this visit. Reopen Chat to restore the local demo list.");
  }

  return <div className="chat-page"><aside className="chat-rooms"><header><div><p className="eyebrow">Live rooms</p><h1>Now, together</h1></div><Badge><Signal size={12} />Demo realtime</Badge></header><p className="chat-intro">Presence is approximate and opt-in. Listening counts as being here.</p><nav aria-label="Chat rooms">{availableRooms.map((item) => <button key={item.id} className={cn(item.id === roomId && "active")} onClick={() => { setRoomId(item.id); setReplyTo(null); }}><span className={`chat-room-icon room-${item.id}`}><Users size={17} /></span><span><strong>{item.name}</strong><small>{item.topic}</small></span><i>{item.activeNow}</i>{item.unread > 0 && item.id !== roomId && <b>{item.unread}</b>}</button>)}</nav><footer><Info size={16} /><p>Live rooms fall back to local persistence if realtime is unavailable. Messages never pretend to have reached other people.</p></footer></aside>
    <section className="chat-conversation"><header><div className="mobile-room-select"><select value={roomId} onChange={(event) => setRoomId(event.target.value)} aria-label="Choose live room">{availableRooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown /></div><div className="chat-title"><h2>{room.name}</h2><p><span className="presence-dot" />{room.activeNow} here · {room.topic}</p></div><div className="chat-tools"><span className={cn("connection-status", !online && "offline")}>{online ? <Signal size={14} /> : <WifiOff size={14} />}{online ? "Local realtime ready" : "Offline · saved locally"}</span><IconButton label={muted ? "Unmute room" : "Mute room"} onClick={() => { setMuted((value) => !value); toast(muted ? "Room notices restored." : "Room muted. Visit on your own terms."); }}><BellOff size={18} /></IconButton><DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton id={`report-menu-room-${room.id}`} label="Room options"><MoreHorizontal size={19} /></IconButton></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="dropdown" align="end"><DropdownMenu.Item asChild><ReportDialog targetId={room.id} returnFocusId={`report-menu-room-${room.id}`} /></DropdownMenu.Item><DropdownMenu.Item className="menu-item" onSelect={leaveRoom}><X size={16} />Leave room</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></header>
      <div className="chat-notice"><strong>Come and go freely.</strong> This room has no read receipts. Ask before moving a conversation into private messages.</div>
      <div className="messages" aria-live="polite">{messages.map((message, index) => { const member = getMember(message.authorHandle, viewer); const previous = messages[index - 1]; const grouped = previous?.authorHandle === message.authorHandle && !message.replyTo; const original = message.replyTo ? state.chatMessages.find((item) => item.id === message.replyTo) : undefined; return <article className={cn("message", grouped && "grouped", message.authorHandle === state.profile.handle && "own")} key={message.id}>{!grouped && <Link href={`/members/${member.handle}`}><Avatar member={member} size="sm" /></Link>}<div>{!grouped && <header><Link href={`/members/${member.handle}`}>{member.name}</Link>{member.role === "steward" && <Badge>Steward</Badge>}<span>{message.createdAt}</span></header>}{original && <button className="message-reply-context" onClick={() => document.getElementById(original.id)?.scrollIntoView({ behavior: "smooth" })}><CornerDownRight size={13} />{getMember(original.authorHandle, viewer).name}: {original.body.slice(0, 70)}</button>}<p id={message.id}>{message.body}</p><div className="message-actions"><button onClick={() => toggleMessageReaction(message.id)} className={message.reacted ? "active" : ""} aria-pressed={message.reacted} aria-label={`${message.reacted ? "Remove resonance from" : "Resonate with"} ${member.name}’s message`}><Heart size={14} fill={message.reacted ? "currentColor" : "none"} />{message.reactions || ""}</button><button onClick={() => setReplyTo(message)}><CornerDownRight size={14} />Reply</button><DropdownMenu.Root><DropdownMenu.Trigger asChild><button id={`report-menu-message-${message.id}`} aria-label="Message options"><MoreHorizontal size={15} /></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="dropdown"><DropdownMenu.Item asChild><ReportDialog targetId={message.id} returnFocusId={`report-menu-message-${message.id}`} onBlock={() => blockMember(member.handle)} memberName={member.name} /></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></div></article>; })}<div ref={endRef} />{typing && typing !== state.profile.displayName && <p className="typing-state"><i /><i /><i />{typing} is choosing words…</p>}</div>
      <form className="chat-composer" onSubmit={submit}>{replyTo && <div className="chat-replying"><CornerDownRight size={15} /><span>Replying to <strong>{getMember(replyTo.authorHandle, viewer).name}</strong>: {replyTo.body.slice(0, 72)}</span><IconButton type="button" label="Cancel reply" onClick={() => setReplyTo(null)}><X size={16} /></IconButton></div>}<div><Avatar member={viewer} size="sm" /><label className="sr-only" htmlFor="message-body">Message {room.name}</label><textarea id="message-body" value={body} onChange={(event) => changeBody(event.target.value)} rows={1} placeholder={`Message ${room.name}`} maxLength={10000} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (sendMessage(roomId, body, replyTo?.id)) { setBody(""); setReplyTo(null); } } }} /><Button type="submit" size="sm" disabled={!body.trim()} aria-label="Send message"><Send size={17} /><span>Send</span></Button></div><small>Enter to send · Shift + Enter for a new line · Demo messages stay in this browser</small></form>
    </section>
  </div>;
}
