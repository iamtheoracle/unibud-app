import { createFileRoute, Link } from "@tanstack/react-router";
import { personByHandle } from "@/lib/unibud/catalog";
import { useCampusStore } from "@/lib/unibud/campus-store";
import { UnibudMusic } from "@/lib/music";
import { useStudioStore } from "@/lib/studio/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/audio/$id")({ component: AudioPage });

function AudioPage() {
  const { id } = Route.useParams();
  const originals = useCampusStore((s) => s.originalAudios ?? []);
  const saved = useCampusStore((s) => s.savedAudioIds ?? []);
  const saveAudio = useCampusStore((s) => s.saveAudio);
  const unsaveAudio = useCampusStore((s) => s.unsaveAudio);
  const reportAudio = useCampusStore((s) => s.reportAudio);
  const setComposeOpen = useCampusStore((s) => s.setComposeOpen);
  const localPosts = useCampusStore((s) => s.localPosts);
  const audio = originals.find((a) => a.audioId === id);

  if (!audio) {
    return (
      <main className="px-5 py-10">
        <p className="text-sm text-muted-foreground">That audio isn’t on UNIBUD.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium">
          Back to Square
        </Link>
      </main>
    );
  }

  const selectedAudio = audio;
  const person = personByHandle(selectedAudio.creatorHandle ?? "");
  const uses = localPosts.filter((p) => p.audioId === selectedAudio.audioId || selectedAudio.usedBy.includes(p.id));
  const on = saved.includes(selectedAudio.audioId);

  function useIt() {
    if (selectedAudio.status === "removed" || selectedAudio.status === "restricted") {
      toast.message("This audio isn’t available.");
      return;
    }
    const studio = useStudioStore.getState();
    studio.snapshot();
    studio.addMix({
      id: `oa-${selectedAudio.audioId}`,
      kind: "catalogue",
      name: selectedAudio.title,
      src: selectedAudio.src,
      volume: 0.85,
      mute: false,
      fadeIn: 0,
      fadeOut: 0,
      artistName: person?.name ?? selectedAudio.creatorHandle,
      trackId: selectedAudio.audioId,
    });
    studio.setMusicRef({
      providerId: "unibud-original",
      trackId: selectedAudio.audioId,
      audioId: selectedAudio.audioId,
      title: selectedAudio.title,
      artistName: person?.name ?? selectedAudio.creatorHandle,
      startMs: 0,
      durationMs: selectedAudio.durationMs,
      entitlement: "free",
      sourceType: "ORIGINAL_AUDIO",
      creatorHandle: selectedAudio.creatorHandle,
    });
    studio.setView("camera");
    setComposeOpen(true);
    toast.message(`Using “${selectedAudio.title}” — still ${person?.name ?? selectedAudio.creatorHandle}’s original.`);
  }

  return (
    <main className="px-5 py-6">
      <p className="kicker">{selectedAudio.sourceType === "LICENSED_MUSIC" ? "Music" : "Original audio"}</p>
      <h1 className="mt-2 font-display text-4xl">{selectedAudio.title}</h1>
      {selectedAudio.sourceType === "ORIGINAL_AUDIO" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          by{" "}
          {selectedAudio.creatorHandle ? (
            <Link to="/u/$handle" params={{ handle: selectedAudio.creatorHandle }} className="font-medium text-ink">
              {person?.name ?? selectedAudio.creatorHandle}
            </Link>
          ) : (
            "a UNIBUD creator"
          )}
          {selectedAudio.claimedOriginal ? " · claimed original — reports still apply" : null}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{selectedAudio.artistName} · licensed catalogue</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {selectedAudio.usageCount} use{selectedAudio.usageCount === 1 ? "" : "s"}
        {selectedAudio.durationMs ? ` · ${(selectedAudio.durationMs / 1000).toFixed(1)}s` : ""}
        {selectedAudio.status !== "active" ? ` · ${selectedAudio.status}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={selectedAudio.sourceType === "LICENSED_MUSIC" && !UnibudMusic.ready()}
          onClick={() => {
            if (selectedAudio.src) {
              const el = document.getElementById("audio-preview") as HTMLAudioElement | null;
              void el?.play();
              return;
            }
            toast.message(
              selectedAudio.sourceType === "LICENSED_MUSIC"
                ? UnibudMusic.reason()
                : "This original has no detached stem yet. Use audio still attaches the credit.",
            );
          }}
        >
          Preview
        </Button>
        <Button size="sm" onClick={useIt} disabled={selectedAudio.status !== "active"}>
          Use audio
        </Button>
        <Button size="sm" variant="ghost" onClick={() => (on ? unsaveAudio(selectedAudio.audioId) : saveAudio(selectedAudio.audioId))}>
          {on ? "Saved" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => reportAudio(selectedAudio.audioId, "rights")}>
          Report
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            useCampusStore.getState().setPendingShare({ kind: "audio", audioId: selectedAudio.audioId, title: selectedAudio.title });
            void toast.message("Open a chat and attach Audio — or share from Chat.");
          }}
        >
          Share
        </Button>
      </div>
      {selectedAudio.src ? <audio id="audio-preview" className="mt-3 w-full" src={selectedAudio.src} controls /> : null}
      <p className="mt-8 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Used in</p>
      {uses.length ? (
        <ul className="mt-2 space-y-2">
          {uses.map((p) => (
            <li key={p.id} className="text-sm">
              <Link to="/" className="font-medium">
                @{p.authorHandle}
              </Link>
              <span className="text-muted-foreground"> — {p.body.slice(0, 80)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">The original post is the first use. Reuses will list here.</p>
      )}
      {!UnibudMusic.ready() && selectedAudio.sourceType === "LICENSED_MUSIC" ? (
        <p className="mt-6 text-xs text-muted-foreground">{UnibudMusic.reason()}</p>
      ) : null}
    </main>
  );
}
