import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Headphones,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Search,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/communities/growth")({ component: GrowthExperience });

const STORAGE_KEY = "unibud-growth-v1";

const lessons = [
  {
    id: "discipline",
    category: "Character",
    readTime: "8 min",
    title: "The promise you keep to yourself",
    subtitle: "Discipline is not punishment. It is self-respect made visible.",
    excerpt:
      "A person changes when their private promises begin to matter as much as the promises they make to everyone else.",
    body: [
      "There is a quiet kind of confidence that comes from doing what you told yourself you would do. Nobody has to applaud it. Nobody even has to know. You said you would get up, so you got up. You said you would train, so you went. You said you would finish the work, so you gave it your attention.",
      "Discipline is often described as force. A better way to understand it is as trust. Every small promise kept gives you another reason to trust yourself. Every honest adjustment teaches you that a difficult day does not have to become a lost week.",
      "Start smaller than your ambition. Choose one action you can complete today, make it specific, and give it a place in your day. When the plan stops fitting your real circumstances, adjust the plan without abandoning the purpose.",
    ],
    action: "Choose one promise you can keep today, and decide exactly when you will do it.",
  },
  {
    id: "wealth",
    category: "Ambition",
    readTime: "10 min",
    title: "Build value before chasing numbers",
    subtitle: "A strong financial future begins with useful skills and sound decisions.",
    excerpt:
      "Wealth is not a shortcut or a personality. It is built through value, patience, learning and decisions repeated over time.",
    body: [
      "A large number can be an exciting goal, but it is not a plan. A plan begins with the value you can create, the people you can serve, the skills you need and the way you will manage what you earn.",
      "Learn to understand cash flow, risk, saving, investing and the difference between an opportunity and a promise. Be curious, but verify claims. Be ambitious, but do not confuse urgency with evidence.",
      "Choose one valuable skill to improve this month. Find a practical way to use it, ask for feedback and keep a record of what you learn. Progress becomes easier to recognise when it has evidence behind it.",
    ],
    action: "Write down one skill that could create more value for someone else.",
  },
  {
    id: "wellbeing",
    category: "Wellness",
    readTime: "7 min",
    title: "Make movement part of your life",
    subtitle: "Consistency grows when the routine respects the body you have today.",
    excerpt:
      "You do not need a perfect workout to begin building a healthier relationship with movement.",
    body: [
      "A missed workout is information, not a verdict. Maybe the session was too long, the time was unrealistic or your body needed recovery. The useful question is not how to punish yourself for missing it. The useful question is what would make the next session possible.",
      "Build a routine around your current fitness, available time and health needs. Start at a level you can repeat. Increase gradually, recover properly and seek qualified advice when pain, illness or a medical concern changes what is safe.",
      "A short walk, a beginner session or a planned rest day can all be part of a thoughtful routine. The goal is not to win one day. It is to build a pattern that can live alongside the rest of your life.",
    ],
    action: "Choose a realistic movement session and put it on today's calendar.",
  },
];

const categories = ["For you", "Character", "Wellness", "Mindset", "Ambition", "Relationships", "Purpose"];

type SavedState = { saved: string[]; completed: string[]; reflection: string };

function GrowthExperience() {
  const [activeCategory, setActiveCategory] = useState("For you");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [catchUp, setCatchUp] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw) as Partial<SavedState>;
        setSaved(Array.isArray(state.saved) ? state.saved : []);
        setCompleted(Array.isArray(state.completed) ? state.completed : []);
        setReflection(typeof state.reflection === "string" ? state.reflection : "");
      }
    } catch {
      /* A damaged local reading state should never block the experience. */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: SavedState = { saved, completed, reflection };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [saved, completed, reflection, hydrated]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const current = lessons.find((lesson) => lesson.id === activeLesson);
  const filtered = activeCategory === "For you" ? lessons : lessons.filter((lesson) => lesson.category === activeCategory);
  const featured = filtered[0] ?? lessons[0];

  function toggleSaved(id: string) {
    setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    toast.success(saved.includes(id) ? "Removed from your reading list." : "Saved to your reading list on this device.");
  }

  function toggleComplete(id: string) {
    setCompleted((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function toggleSpeech(lesson = current ?? featured) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio narration is not supported by this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = [lesson.title, lesson.subtitle, ...lesson.body].join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function shareLesson(lesson = current ?? featured) {
    const text = lesson.title + " — " + lesson.subtitle;
    try {
      if (navigator.share) await navigator.share({ title: lesson.title, text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Lesson copied.");
      }
    } catch {
      /* Sharing dismissed by the user. */
    }
  }

  if (current) {
    return (
      <main className="min-h-dvh bg-[#080808] pb-16 text-[#f6f4ef]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#080808]/90 px-4 py-3 backdrop-blur-xl">
          <button type="button" onClick={() => { setActiveLesson(null); setSpeaking(false); window.speechSynthesis?.cancel(); }} className="flex items-center gap-2 text-sm text-white/70">
            <ArrowLeft className="size-4" /> Your growth
          </button>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#d9bd91]">READING ROOM</span>
          <button type="button" aria-label="Save lesson" onClick={() => toggleSaved(current.id)} className="grid size-9 place-items-center rounded-full border border-white/10">
            <Bookmark className={cn("size-4", saved.includes(current.id) && "fill-[#d9bd91] text-[#d9bd91]")} />
          </button>
        </header>
        <article className="mx-auto max-w-2xl px-5 pb-16 pt-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d9bd91] uppercase">{current.category} · {current.readTime} read</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white">{current.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/65">{current.subtitle}</p>
          <div className="my-7 flex items-center gap-3">
            <button type="button" onClick={() => toggleSpeech(current)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#e8d4b5] px-5 text-sm font-semibold text-[#111]">
              {speaking ? <Pause className="size-4" /> : <Play className="size-4" />}
              {speaking ? "Pause narration" : "Listen to this chapter"}
            </button>
            <button type="button" onClick={() => shareLesson(current)} aria-label="Share lesson" className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80">
              <Share2 className="size-4" />
            </button>
          </div>
          <div className="space-y-6 border-t border-white/10 pt-7">
            {current.body.map((paragraph, index) => <p key={index} className="font-sans text-[17px] leading-[1.9] text-white/85">{paragraph}</p>)}
          </div>
          <section className="mt-9 rounded-3xl border border-[#d9bd91]/25 bg-[#171512] p-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#d9bd91] uppercase">Put it into practice</p>
            <p className="mt-3 font-display text-2xl text-white">{current.action}</p>
            <button type="button" onClick={() => toggleComplete(current.id)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#e8d4b5] px-5 text-sm font-semibold text-[#111]">
              {completed.includes(current.id) ? <Check className="size-4" /> : <Heart className="size-4" />}
              {completed.includes(current.id) ? "Marked complete" : "I did this"}
            </button>
          </section>
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
            <button type="button" onClick={() => setActiveLesson(null)} className="text-sm text-white/60">Back to your feed</button>
            <button type="button" onClick={() => { setActiveLesson(null); setActiveCategory("For you"); }} className="inline-flex items-center gap-2 text-sm text-[#e8d4b5]">More to explore <ArrowRight className="size-4" /></button>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#080808] pb-16 text-[#f6f4ef]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080808]/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to="/communities" aria-label="Back to Quad" className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/80">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#d9bd91]">QUAD · PERSONAL GROWTH</p>
            <h1 className="font-display text-2xl text-white">Your next chapter</h1>
          </div>
          <button type="button" aria-label="Search lessons" onClick={() => toast.message("Lesson search is coming with the full library index.")} className="grid size-10 place-items-center rounded-full border border-white/10 text-white/80">
            <Search className="size-4" />
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-7 pt-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#b88e5b]/15 blur-3xl" />
        <p className="relative text-[10px] font-semibold tracking-[0.22em] text-[#d9bd91] uppercase">A life in progress</p>
        <h2 className="relative mt-3 max-w-[19rem] font-display text-[2.65rem] leading-[1.02] tracking-[-0.04em] text-white">
          Become who you keep promising yourself you’ll be.
        </h2>
        <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-white/60">
          Stories, ideas and small actions for the life you are building. Read when you can. Listen while you live.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/65">Learn at your pace</span>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/65">No lost days</span>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/65">Real-life practice</span>
        </div>
      </section>

      <section className="border-y border-white/10 py-4">
        <div className="mb-3 flex items-center justify-between px-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">Explore your life</p>
          <span className="text-[10px] text-white/35">One library · many directions</span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs transition", activeCategory === category ? "bg-[#e8d4b5] text-[#111]" : "border border-white/15 text-white/65")}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d9bd91] uppercase">Picked for today</p>
            <h2 className="mt-1 font-display text-2xl text-white">A lesson worth keeping</h2>
          </div>
          <span className="text-xs text-white/45">{featured.readTime}</span>
        </div>
        <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#121212]">
          <div className="relative min-h-48 overflow-hidden bg-[radial-gradient(ellipse_at_75%_10%,rgba(205,171,123,.24),transparent_42%),linear-gradient(135deg,#24211c,#0d0d0d_70%)] p-5">
            <div className="absolute right-5 top-5 size-24 rounded-full border border-[#d9bd91]/20" />
            <div className="absolute right-11 top-11 size-12 rounded-full border border-[#d9bd91]/30" />
            <p className="relative text-[10px] font-semibold tracking-[0.2em] text-[#d9bd91] uppercase">{featured.category} · DAILY READING</p>
            <h3 className="relative mt-8 max-w-[18rem] font-display text-3xl leading-tight text-white">{featured.title}</h3>
            <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/60">{featured.subtitle}</p>
          </div>
          <div className="p-5">
            <p className="text-sm leading-relaxed text-white/70">{featured.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setActiveLesson(featured.id)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#e8d4b5] px-5 text-sm font-semibold text-[#111]">
                Read chapter <ChevronRight className="size-4" />
              </button>
              <button type="button" onClick={() => toggleSpeech(featured)} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80">
                {speaking ? <Pause className="size-4" /> : <Headphones className="size-4" />}
                {speaking ? "Stop audio" : "Listen"}
              </button>
              <button type="button" onClick={() => toggleSaved(featured.id)} aria-label="Save lesson" className="grid size-11 place-items-center rounded-full border border-white/15 text-white/70">
                <Bookmark className={cn("size-4", saved.includes(featured.id) && "fill-[#d9bd91] text-[#d9bd91]")} />
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="px-5 pt-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">Your practice</p>
            <h2 className="mt-1 font-display text-2xl text-white">One small next step</h2>
          </div>
          <span className="text-xs text-white/40">{completed.length} completed</span>
        </div>
        <div className="mt-3 rounded-3xl border border-[#d9bd91]/20 bg-[#171512] p-5">
          <div className="flex items-center gap-2 text-[#d9bd91]"><Sparkles className="size-4" /><span className="text-[10px] font-semibold tracking-[0.18em] uppercase">Today’s action</span></div>
          <p className="mt-3 font-display text-xl text-white">{featured.action}</p>
          <button type="button" onClick={() => toggleComplete(featured.id)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#d9bd91]/40 px-4 text-xs font-semibold text-[#e8d4b5]">
            {completed.includes(featured.id) ? <Check className="size-4" /> : <Heart className="size-4" />}
            {completed.includes(featured.id) ? "Completed" : "Mark as done"}
          </button>
        </div>
      </section>

      <section className="px-5 pt-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">Keep exploring</p>
            <h2 className="mt-1 font-display text-2xl text-white">More for your journey</h2>
          </div>
          <span className="text-xs text-white/40">{lessons.length} starter lessons</span>
        </div>
        <div className="mt-3 space-y-2">
          {lessons.filter((lesson) => lesson.id !== featured.id).map((lesson) => (
            <article key={lesson.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111] p-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#211e19] text-[#d9bd91]"><Volume2 className="size-5" /></div>
              <button type="button" onClick={() => setActiveLesson(lesson.id)} className="min-w-0 flex-1 text-left">
                <p className="text-[10px] tracking-[0.15em] text-[#d9bd91] uppercase">{lesson.category} · {lesson.readTime}</p>
                <p className="mt-1 truncate font-display text-lg text-white">{lesson.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/45">{lesson.subtitle}</p>
              </button>
              <button type="button" onClick={() => toggleSaved(lesson.id)} aria-label="Save lesson" className="grid size-9 shrink-0 place-items-center rounded-full text-white/55">
                <Bookmark className={cn("size-4", saved.includes(lesson.id) && "fill-[#d9bd91] text-[#d9bd91]")} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pt-7">
        <div className="rounded-3xl border border-white/10 bg-[#111] p-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d9bd91] uppercase">When life gets in the way</p>
          <h2 className="mt-2 font-display text-2xl text-white">You can always find your way back.</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/55">Missed a day or lost your rhythm? Make the next step smaller and continue without starting over.</p>
          <button type="button" onClick={() => setCatchUp((value) => !value)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e8d4b5]">
            {catchUp ? "Hide recovery plan" : "Make a lighter plan"} <ArrowRight className="size-4" />
          </button>
          {catchUp ? <div className="mt-4 rounded-2xl bg-white/[0.04] p-4 text-sm leading-relaxed text-white/75">Today: listen to the chapter for five minutes, choose one small action, and move the remaining reading to a time that works for you. Your progress is not erased by a difficult day.</div> : null}
        </div>
      </section>

      <section className="px-5 pb-10 pt-7">
        <div className="rounded-3xl border border-[#d9bd91]/20 bg-[linear-gradient(135deg,#211d17,#101010)] p-5">
          <div className="flex items-center gap-2 text-[#d9bd91]"><MessageCircle className="size-4" /><span className="text-[10px] font-semibold tracking-[0.18em] uppercase">Take it into the conversation</span></div>
          <h2 className="mt-3 font-display text-2xl text-white">What does discipline look like in real life?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/55">Share a perspective, hear how other people approach the same challenge, and keep the conversation going.</p>
          <Link to="/riff" className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#d9bd91]/40 px-4 text-sm font-medium text-[#e8d4b5]">Join the discussion <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <div className="mx-5 flex items-center justify-between border-t border-white/10 py-5 text-[10px] text-white/35">
        <span>Progress and saved lessons stay on this device for now.</span>
        <span>{saved.length} saved</span>
      </div>
    </main>
  );
}
