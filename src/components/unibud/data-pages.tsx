import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, Database, HelpCircle, History, Settings2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCampusStore } from "@/lib/unibud/campus-store";
import { relativeTime } from "@/lib/unibud/format";

const nav = [
  ["/dashboard", "Dashboard"],
  ["/data-list", "Data Management"],
  ["/account-activity", "Account Activity"],
  ["/settings", "Settings"],
  ["/data-preferences", "Data Preferences"],
  ["/help", "Help Center"],
  ["/getting-started", "Quick Start"],
] as const;

function Shell({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <main className="safe-bottom min-h-[calc(100vh-80px)] bg-card px-5 pb-12 pt-7">
      <p className="kicker">{eyebrow}</p>
      <div className="mt-2">
        <h1 className="font-display text-4xl font-medium">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Data pages">
        {nav.map(([href, label]) => (
          <Link key={href} to={href} className="shrink-0 rounded-full bg-card px-3 py-2 text-xs font-medium ring-1 ring-border [&.active]:bg-ink [&.active]:text-paper">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-7">{children}</div>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

export function DashboardPage() {
  const posts = useCampusStore((s) => s.localPosts);
  const notes = useCampusStore((s) => s.notes);
  const saved = useCampusStore((s) => s.savedPosts);
  const hidden = useCampusStore((s) => s.hiddenPosts);
  const recent = useMemo(() => posts.slice(0, 5), [posts]);
  return <Shell eyebrow="Workspace" title="Dashboard" body="A high-level view of your data, recent activity, and the places you can manage it.">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Posts" value={posts.length} detail="Your saved local posts" />
      <Stat label="Saved" value={saved.length} detail="Items you kept" />
      <Stat label="Notifications" value={notes.filter((n) => !n.read).length} detail="Unread updates" />
      <Stat label="Removed" value={hidden.length} detail="Hidden from your feed" />
    </div>
    <section className="mt-7 rounded-2xl bg-background p-4 ring-1 ring-border">
      <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Recent items</p><p className="text-xs text-muted-foreground">Your newest locally stored posts.</p></div><Link to="/data-list" className="text-xs font-semibold">Manage</Link></div>
      <div className="mt-4 space-y-2">{recent.length ? recent.map((p) => <div key={p.id} className="rounded-xl bg-card p-3 ring-1 ring-border"><p className="text-sm">{p.body}</p><p className="mt-1 text-xs text-muted-foreground">{relativeTime(p.createdAt)}</p></div>) : <p className="py-6 text-sm text-muted-foreground">No recent items yet.</p>}</div>
    </section>
    <section className="mt-4 grid gap-3 md:grid-cols-3">
      <Quick href="/data-list" icon={<Database className="size-4" />} title="Manage data" body="View, edit, and remove your stored posts." />
      <Quick href="/account-activity" icon={<History className="size-4" />} title="Review activity" body="See what has been added, saved, or removed." />
      <Quick href="/settings" icon={<Settings2 className="size-4" />} title="Account settings" body="Update profile and privacy preferences." />
    </section>
  </Shell>;
}

function Quick({ href, icon, title, body }: { href: string; icon: React.ReactNode; title: string; body: string }) {
  return <Link to={href} className="group rounded-2xl bg-background p-4 ring-1 ring-border"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-card ring-1 ring-border">{icon}</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></div><p className="mt-4 text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p></Link>;
}

export function DataListPage() {
  const posts = useCampusStore((s) => s.localPosts);
  const hide = useCampusStore((s) => s.hidePost);
  const update = useCampusStore((s) => s.updateLocalPost);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  return <Shell eyebrow="Data" title="Data Management" body="View the entries stored for your account. Edit a post or remove it from your active data.">
    <div className="space-y-3">{posts.length ? posts.map((p) => editing === p.id ? (
      <div key={p.id} className="rounded-2xl bg-background p-4 ring-1 ring-border">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-24 w-full rounded-xl bg-card p-3 text-sm ring-1 ring-border outline-none" />
        <div className="mt-3 flex gap-2"><button type="button" onClick={() => { update(p.id, draft.trim() || p.body); setEditing(null); }} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-xs ring-1 ring-border">Cancel</button></div>
      </div>
    ) : (
      <article key={p.id} className="rounded-2xl bg-background p-4 ring-1 ring-border">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm leading-relaxed">{p.body}</p><p className="mt-2 text-xs text-muted-foreground">{relativeTime(p.createdAt)}</p></div><div className="flex gap-1"><button type="button" aria-label="Edit post" onClick={() => { setEditing(p.id); setDraft(p.body); }} className="rounded-full px-3 py-2 text-xs ring-1 ring-border">Edit</button><button type="button" aria-label="Delete post" onClick={() => hide(p.id)} className="grid size-9 place-items-center rounded-full ring-1 ring-border"><Trash2 className="size-4" /></button></div></div>
        {p.image ? <img src={p.image} alt="" className="mt-3 h-40 w-full rounded-xl object-cover" /> : null}
      </article>
    )) : <Empty title="No stored entries" body="Posts you create locally will appear here." />}</div>
  </Shell>;
}

export function SettingsPage() {
  const name = useCampusStore((s) => s.legalName);
  const setName = useCampusStore((s) => s.setLegalName);
  const visibility = useCampusStore((s) => s.profileVisibility);
  const setVisibility = useCampusStore((s) => s.setProfileVisibility);
  const prefs = useCampusStore((s) => s.prefs);
  const setPrefs = useCampusStore((s) => s.setPrefs);
  const [draft, setDraft] = useState(name);
  return <Shell eyebrow="Account" title="Settings" body="Manage account preferences, profile visibility, and notification behavior.">
    <div className="space-y-4">
      <section className="rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-sm font-semibold">Account name</p><input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => setName(draft.trim())} placeholder="Your name" className="mt-3 h-11 w-full rounded-xl bg-card px-3 text-sm ring-1 ring-border outline-none" /></section>
      <section className="rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-sm font-semibold">Profile visibility</p><select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "campus" | "connections")} className="mt-3 h-11 w-full rounded-xl bg-card px-3 text-sm ring-1 ring-border"><option value="public">Public</option><option value="campus">Campus</option><option value="connections">Connections</option></select></section>
      <section className="rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-sm font-semibold">Notifications</p><Toggle label="Push notifications" on={prefs.push} onChange={(v) => setPrefs({ push: v })} /><Toggle label="Read updates" on={prefs.reads} onChange={(v) => setPrefs({ reads: v })} /><Toggle label="Marketplace updates" on={prefs.market} onChange={(v) => setPrefs({ market: v })} /></section>
    </div>
  </Shell>;
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!on)} className="mt-3 flex w-full items-center justify-between rounded-xl bg-card p-3 text-left ring-1 ring-border"><span className="text-sm">{label}</span><span className={on ? "grid size-6 place-items-center rounded-full bg-ink text-paper" : "size-6 rounded-full ring-1 ring-border"}>{on ? <Check className="size-3" /> : null}</span></button>;
}

export function HelpPage() {
  const items = [
    ["Manage data", "Open Data Management to review your stored posts. Use Edit to change text or the trash control to remove an entry from your active data."],
    ["Feed", "Use Latest on Square when you want the newest posts first. Like and comment directly on a post."],
    ["Profile", "Open a person’s profile to review their public post, like, and comment history."],
    ["Privacy", "Use Settings for profile visibility. Use Data Preferences for retention and automatic cleanup."],
  ];
  return <Shell eyebrow="Support" title="Help Center" body="Short instructions for the application's core data and social features."><div className="space-y-3">{items.map(([title, body]) => <details key={title} className="group rounded-2xl bg-background p-4 ring-1 ring-border"><summary className="cursor-pointer list-none text-sm font-semibold">{title}<ChevronRight className="float-right size-4 transition-transform group-open:rotate-90" /></summary><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></details>)}</div></Shell>;
}

export function GettingStartedPage() {
  const done = useCampusStore((s) => s.onboardingDone);
  const setDone = useCampusStore((s) => s.setOnboardingDone);
  const steps = [
    ["Set up your account", "Open Settings and add your name and preferred profile visibility."],
    ["Choose your data rules", "Open Data Preferences and decide how long history should be kept."],
    ["Create something", "Return to Square and publish your first post. Images can be attached from the publishing flow."],
    ["Review your data", "Use Dashboard and Data Management to see recent items and manage stored entries."],
  ];
  return <Shell eyebrow="Welcome" title="Quick Start" body="A short path from a new account to a working UNIBUD workspace."><div className="space-y-3">{steps.map(([title, body], i) => <div key={title} className="flex gap-4 rounded-2xl bg-background p-4 ring-1 ring-border"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm text-paper">{i + 1}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p></div></div>)}<button type="button" onClick={() => setDone(true)} className="mt-2 rounded-full bg-ink px-5 py-3 text-xs font-semibold text-paper">{done ? "Setup complete" : "Mark setup complete"}</button></div></Shell>;
}

export function AccountActivityPage() {
  const posts = useCampusStore((s) => s.localPosts);
  const hidden = useCampusStore((s) => s.hiddenPosts);
  const saved = useCampusStore((s) => s.savedPosts);
  const searches = useCampusStore((s) => s.recentSearches);
  const events = [
    ...posts.map((p) => ({ key: "post-"+p.id, text: "Added a post", detail: p.body, at: p.createdAt, type: "added" })),
    ...saved.map((id) => ({ key: "save-"+id, text: "Saved an item", detail: id, at: new Date().toISOString(), type: "saved" })),
    ...hidden.map((id) => ({ key: "hide-"+id, text: "Removed a post from the feed", detail: id, at: new Date().toISOString(), type: "removed" })),
    ...searches.map((q) => ({ key: "search-"+q, text: "Searched", detail: q, at: new Date().toISOString(), type: "searched" })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 30);
  return <Shell eyebrow="History" title="Account Activity" body="A clear record of recent account actions derived from your current stored data."><div className="space-y-2">{events.length ? events.map((e) => <div key={e.key} className="flex items-start gap-3 rounded-xl bg-background p-3 ring-1 ring-border"><span className="mt-1 size-2 rounded-full bg-ink" /><div><p className="text-sm font-medium">{e.text}</p><p className="mt-1 text-xs text-muted-foreground">{e.detail}</p><p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(e.at)}</p></div></div>) : <Empty title="No activity yet" body="Your additions and removals will appear here." />}</div></Shell>;
}

export function DataPreferencesPage() {
  const days = useCampusStore((s) => s.dataHistoryDays);
  const auto = useCampusStore((s) => s.autoCleanup);
  const setDays = useCampusStore((s) => s.setDataHistoryDays);
  const setAuto = useCampusStore((s) => s.setAutoCleanup);
  return <Shell eyebrow="Data" title="Data Preferences" body="Control how long your history is kept and whether automatic cleanup is enabled.">
    <section className="rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-sm font-semibold">History retention</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choose how long account history should remain available in this device's stored workspace.</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{[30,90,365,1095].map((n) => <button key={n} type="button" onClick={() => setDays(n)} className={`rounded-xl px-3 py-3 text-sm ring-1 ring-border ${days === n ? "bg-ink text-paper" : "bg-card"}`}>{n === 1095 ? "3 years" : n + " days"}</button>)}</div></section>
    <section className="mt-4 rounded-2xl bg-background p-4 ring-1 ring-border"><p className="text-sm font-semibold">Automatic cleanup</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">When enabled, the application may remove history older than your retention window when cleanup support is available.</p><Toggle label="Automatically clean old history" on={auto} onChange={setAuto} /></section>
  </Shell>;
}

function Empty({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl bg-background p-8 text-center ring-1 ring-border"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>; }
