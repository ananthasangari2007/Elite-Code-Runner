import { useEffect, useState } from "react";
import { AVATARS } from "@/game/avatars";
import type { PlayMode } from "@/game/store";

type Props = {
  demoPlaysUsed: number;
  onStart: (name: string, avatarId: number, mode: PlayMode) => void;
};

const MAX_DEMO_PLAYS = 3;

export function PlayerSetup({ demoPlaysUsed, onStart }: Props) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("cre-player");
    if (!saved) return;

    try {
      const player = JSON.parse(saved);
      setName(player.name ?? "");
      setSelected(typeof player.avatarId === "number" ? player.avatarId : 0);
    } catch {
      // Ignore corrupted saved data and keep defaults.
    }
  }, []);

  const submit = (mode: PlayMode) => {
    if (!name.trim()) return;
    localStorage.setItem("cre-player", JSON.stringify({ name: name.trim(), avatarId: selected }));
    onStart(name.trim(), selected, mode);
  };

  const selectedAvatar = AVATARS[selected];
  const demoRemaining = Math.max(0, MAX_DEMO_PLAYS - demoPlaysUsed);
  const demoDisabled = demoRemaining === 0;

  return (
    <div className="min-h-dvh w-full px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl font-black tracking-tight text-glow-cyan sm:text-5xl md:text-6xl">
          CODE RUNNER <span className="text-glow-pink">ELITE</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground sm:mt-3 sm:text-base">
          Run. Dodge. Solve. Master C programming with demo practice and your main event run.
        </p>

        <div className="mt-5 rounded-2xl border bg-card p-4 shadow-2xl sm:mt-8 sm:p-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your runner name"
            className="mt-2 w-full rounded-xl border bg-input px-4 py-3 text-base outline-none ring-primary focus:ring-2 sm:text-lg"
            maxLength={20}
          />

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold sm:text-lg">
              Choose your avatar{" "}
              <span className="text-xs font-normal text-muted-foreground sm:text-sm">
                ({AVATARS.length} characters)
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <img
                src={selectedAvatar.image}
                alt={selectedAvatar.label}
                width={48}
                height={48}
                className="h-10 w-10 rounded-full border-2 border-primary object-cover sm:h-12 sm:w-12"
              />
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {selectedAvatar.label}
              </span>
            </div>
          </div>

          <div className="mt-3 grid max-h-[42dvh] grid-cols-4 gap-2 overflow-y-auto rounded-xl bg-secondary/40 p-2 sm:mt-4 sm:max-h-[45vh] sm:grid-cols-6 sm:gap-3 md:grid-cols-8">
            {AVATARS.map((avatar) => {
              const isSelected = selected === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelected(avatar.id)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "scale-110 animate-glow border-primary ring-2 ring-primary"
                      : "border-border hover:scale-105 hover:border-accent"
                  }`}
                  title={avatar.label}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.label}
                    width={128}
                    height={128}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-primary/25 bg-background/30 p-4 sm:mt-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-primary sm:text-base">
                  Choose Mode
                </h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Demo play can be used only 3 times. Main event scores go to the controlled
                  leaderboard.
                </p>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-glow-yellow sm:text-sm">
                Demo plays left: {demoRemaining}/{MAX_DEMO_PLAYS}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => submit("demo")}
                disabled={!name.trim() || demoDisabled}
                className="rounded-2xl border border-primary/40 bg-secondary px-4 py-4 text-left transition hover:border-primary hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="text-base font-black uppercase tracking-widest text-glow-cyan">
                  Demo Play
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Practice with a separate 10-question demo set. Demo results never open the event
                  leaderboard.
                </div>
              </button>

              <button
                onClick={() => submit("competition")}
                disabled={!name.trim()}
                className="rounded-2xl border border-accent/50 bg-accent/15 px-4 py-4 text-left transition hover:scale-[1.01] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="text-base font-black uppercase tracking-widest text-glow-pink">
                  Start Game
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Join the real event. Your score, avatar, feedback, and leaderboard status will be
                  tracked for the admin panel.
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
