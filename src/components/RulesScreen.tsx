import {
  ChevronLeft,
  Clock3,
  Gem,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import {
  getCategoryLabel,
  getDifficultyLabel,
  type CategoryId,
  type DifficultyId,
} from "@/game/questions";
import type { DifficultyRunConfig } from "@/game/progression";
import type { PlayMode } from "@/game/store";
import { startMusic } from "@/game/audio";
import { cn } from "@/lib/utils";

type Props = {
  mode: PlayMode;
  selectedCategory: CategoryId | null;
  selectedDifficulty: DifficultyId | null;
  runConfig: DifficultyRunConfig | null;
  onStart: () => void;
  onBack: () => void;
};

export function RulesScreen({
  mode,
  selectedCategory,
  selectedDifficulty,
  runConfig,
  onStart,
  onBack,
}: Props) {
  const isDemo = mode === "demo";
  const canContinue = isDemo || Boolean(selectedCategory && selectedDifficulty);
  const activeRunConfig =
    runConfig ??
    ({
      label: "Demo Play",
      questionCount: 10,
      baseXp: 0,
      coins: 0,
      gems: 0,
      timerSeconds: null,
      hintLimit: "unlimited",
    } as DifficultyRunConfig);

  const rules = [
    "Complete levels in order.",
    "Higher difficulty gives more rewards.",
    "Missing daily play resets streak.",
    "Hard mode gives gems.",
    "Finish all 5 levels to unlock Champion Badge.",
    "Use hints wisely.",
    "Score is based on speed and accuracy.",
  ];

  const handleContinue = () => {
    if (!canContinue) return;
    startMusic();
    onStart();
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.18),transparent_22%),linear-gradient(180deg,#050816_0%,#090f1f_55%,#050814_100%)] px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-cyan-400/18 bg-slate-950/65 p-4 shadow-[0_0_55px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onBack}
                className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isDemo ? "Demo Simulation" : "Mission Rules"}
                </div>
                <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Rules Page</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Review the mission rules, rewards, and difficulty modifiers before you start the
                  run.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-violet-300/15 bg-violet-500/8 px-4 py-3 text-sm text-slate-200">
              <div className="font-black uppercase tracking-[0.22em] text-violet-300">
                Selected Run
              </div>
              <div className="mt-2 text-base font-bold text-white">
                {isDemo
                  ? "Demo Play"
                  : `${selectedCategory ? getCategoryLabel(selectedCategory) : "Choose a level"} / ${
                      selectedDifficulty ? getDifficultyLabel(selectedDifficulty) : "Choose a mode"
                    }`}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <section className="rounded-[2rem] border border-white/8 bg-slate-950/60 p-5 shadow-[0_0_50px_rgba(34,211,238,0.06)] backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <RuleStat
                icon={<Sparkles className="h-5 w-5" />}
                label="Questions"
                value={activeRunConfig.questionCount}
                accent="cyan"
              />
              <RuleStat
                icon={<Zap className="h-5 w-5" />}
                label="XP Reward"
                value={`+${activeRunConfig.baseXp}`}
                accent="violet"
              />
              <RuleStat
                icon={<Clock3 className="h-5 w-5" />}
                label="Question Timer"
                value={activeRunConfig.timerSeconds ? `${activeRunConfig.timerSeconds}s` : "None"}
                accent="amber"
              />
              <RuleStat
                icon={<Lightbulb className="h-5 w-5" />}
                label="Hints"
                value={
                  activeRunConfig.hintLimit === "unlimited"
                    ? "Unlimited"
                    : activeRunConfig.hintLimit
                }
                accent="emerald"
              />
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-cyan-300/14 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_35%),rgba(255,255,255,0.03)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                    Mission Rules
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Follow the order, use hints carefully, and clear every difficulty to keep the
                    roadmap moving.
                  </p>
                </div>
                <div className="rounded-full border border-pink-300/20 bg-pink-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-pink-200">
                  Continue starts gameplay instantly
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {rules.map((rule) => (
                  <div
                    key={rule}
                    className="rounded-[1.15rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoTile
                icon={<Zap className="h-5 w-5 text-cyan-200" />}
                title="Combo System"
                detail="3 correct in a row gives +10 XP. 5 correct in a row gives +25 XP and a coin shower animation."
              />
              <InfoTile
                icon={<Trophy className="h-5 w-5 text-amber-200" />}
                title="Unlock Rule"
                detail="The next level opens only after Easy, Medium, and Hard are all completed in the current level."
              />
              <InfoTile
                icon={<Gem className="h-5 w-5 text-violet-200" />}
                title="Reward Chest"
                detail="Mastering a full level opens a treasure chest with premium progression rewards."
              />
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-white/8 bg-slate-950/60 p-5 shadow-[0_0_50px_rgba(168,85,247,0.06)] backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
                Difficulty Snapshot
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">{activeRunConfig.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {activeRunConfig.description}
              </p>

              <div className="mt-5 grid gap-3">
                <RewardRow label="Questions" value={`${activeRunConfig.questionCount}`} />
                <RewardRow label="XP Reward" value={`+${activeRunConfig.baseXp}`} />
                <RewardRow label="Coin Reward" value={`+${activeRunConfig.coins}`} />
                <RewardRow
                  label="Gem Reward"
                  value={activeRunConfig.gems > 0 ? `+${activeRunConfig.gems}` : "None"}
                />
                <RewardRow
                  label="Hints"
                  value={
                    activeRunConfig.hintLimit === "unlimited"
                      ? "Unlimited"
                      : `${activeRunConfig.hintLimit} total`
                  }
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-emerald-300/12 bg-emerald-400/8 p-5">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                Final Reminder
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                After you click Continue to Play, the runner starts and the selected questions for
                this level and mode will be used automatically.
              </p>
            </section>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full rounded-[1.4rem] bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_55%,#ec4899_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue to Play
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RuleStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: "cyan" | "violet" | "amber" | "emerald";
}) {
  const tone =
    accent === "cyan"
      ? "border-cyan-300/15 bg-cyan-400/10 text-cyan-100"
      : accent === "violet"
        ? "border-violet-300/15 bg-violet-500/10 text-violet-100"
        : accent === "amber"
          ? "border-amber-300/15 bg-amber-400/10 text-amber-100"
          : "border-emerald-300/15 bg-emerald-400/10 text-emerald-100";

  return (
    <div className={cn("rounded-[1.3rem] border p-4", tone)}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.22em] opacity-75">
          {label}
        </span>
      </div>
      <div className="mt-4 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function InfoTile({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-black text-white">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{detail}</p>
    </div>
  );
}

function RewardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
