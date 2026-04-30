import {
  CATEGORY_SEQUENCE,
  DIFFICULTIES,
  LEARNING_CATEGORIES,
  getCategoryCompletionCount,
  getCategoryLabel,
  getCategoryLevelNumber,
  getDifficultyLabel,
  isCategoryMastered,
  isCategoryUnlocked,
  type CategoryCompletionMap,
  type CategoryId,
  type DifficultyId,
} from "@/game/questions";
import { cn } from "@/lib/utils";

type Props = {
  completionMap: CategoryCompletionMap;
  selectedCategory: CategoryId | null;
  selectedDifficulty: DifficultyId | null;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectDifficulty: (categoryId: CategoryId, difficultyId: DifficultyId) => void;
  onBack: () => void;
};

const LOCK_ICON = "🔒";
const UNLOCKED_ICON = "✨";
const MASTERED_ICON = "👑";

const LEVEL_EMOJIS: Record<CategoryId, string> = {
  variables: "🧠",
  loops: "🔁",
  arrays: "🧩",
  strings: "🔤",
  functions: "⚙️",
};

const DIFFICULTY_THEME: Record<
  DifficultyId,
  {
    accent: string;
    chip: string;
    label: string;
    emoji: string;
  }
> = {
  easy: {
    accent:
      "border-emerald-400/45 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/20",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    label: "text-emerald-300",
    emoji: "🟢",
  },
  medium: {
    accent:
      "border-amber-400/45 bg-amber-500/10 text-amber-100 hover:border-amber-300 hover:bg-amber-500/20",
    chip: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    label: "text-amber-300",
    emoji: "🟡",
  },
  hard: {
    accent:
      "border-rose-400/45 bg-rose-500/10 text-rose-100 hover:border-rose-300 hover:bg-rose-500/20",
    chip: "bg-rose-500/15 text-rose-100 border-rose-400/30",
    label: "text-rose-300",
    emoji: "🔴",
  },
};

export function LevelSelectScreen({
  completionMap,
  selectedCategory,
  selectedDifficulty,
  onSelectCategory,
  onSelectDifficulty,
  onBack,
}: Props) {
  const firstUnlockedCategory =
    CATEGORY_SEQUENCE.find((categoryId) => isCategoryUnlocked(completionMap, categoryId)) ??
    CATEGORY_SEQUENCE[0];
  const activeCategory =
    selectedCategory && isCategoryUnlocked(completionMap, selectedCategory)
      ? selectedCategory
      : firstUnlockedCategory;

  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(circle_at_top,_rgba(0,229,255,0.18),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(255,61,172,0.16),_transparent_38%)] px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="rounded-[2rem] border border-primary/25 bg-card/85 p-4 shadow-[0_0_50px_rgba(0,229,255,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-background/45 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary sm:text-xs">
                <span aria-hidden="true">🎮</span>
                Main Event
              </div>
              <h1 className="mt-4 text-3xl font-black text-glow-yellow sm:text-4xl lg:text-5xl">
                Levels Of The Game
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Finish every difficulty in a level to unlock the next one. Pick a difficulty and we
                will take you straight to the rules page before the run starts.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-primary/15 bg-background/35 p-3 text-center">
              {DIFFICULTIES.map((difficulty) => {
                const theme = DIFFICULTY_THEME[difficulty.id];
                return (
                  <div
                    key={difficulty.id}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.18em]",
                      theme.chip,
                    )}
                  >
                    <div>{theme.emoji}</div>
                    <div className="mt-1">{difficulty.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[2rem] border border-primary/20 bg-card/85 p-4 shadow-[0_0_40px_rgba(0,229,255,0.06)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.24em] text-primary sm:text-base">
                  Level Path
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Locked levels stay disabled until the previous level is fully mastered.
                </p>
              </div>
              <div className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-accent">
                5 Levels
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {LEARNING_CATEGORIES.map((category) => {
                const unlocked = isCategoryUnlocked(completionMap, category.id);
                const mastered = isCategoryMastered(completionMap, category.id);
                const completedCount = getCategoryCompletionCount(completionMap, category.id);
                const levelNumber = getCategoryLevelNumber(category.id);
                const selected = activeCategory === category.id;
                const previousCategory = CATEGORY_SEQUENCE[levelNumber - 2];
                const lockMessage =
                  unlocked || !previousCategory
                    ? mastered
                      ? "Fully mastered"
                      : "Unlocked for play"
                    : `Unlock after Level ${levelNumber - 1}: ${getCategoryLabel(previousCategory)}`;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => unlocked && onSelectCategory(category.id)}
                    disabled={!unlocked}
                    className={cn(
                      "rounded-[1.6rem] border p-4 text-left transition-all duration-300",
                      unlocked
                        ? "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/45"
                        : "cursor-not-allowed opacity-55",
                      selected && unlocked
                        ? "border-primary bg-primary/12 shadow-[0_0_28px_rgba(0,229,255,0.12)]"
                        : "border-primary/15 bg-background/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
                          <span>Level {levelNumber}</span>
                          <span aria-hidden="true">{LEVEL_EMOJIS[category.id]}</span>
                          {mastered && <span className="text-accent">{MASTERED_ICON}</span>}
                        </div>
                        <div className="mt-2 text-lg font-black text-foreground sm:text-xl">
                          {category.badge}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{category.label}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <div
                          className={cn(
                            "inline-flex h-11 w-11 items-center justify-center rounded-full border text-lg",
                            mastered
                              ? "border-accent/45 bg-accent/15 text-accent"
                              : unlocked
                                ? "border-primary/25 bg-background/60 text-primary"
                                : "border-primary/10 bg-background/40 text-muted-foreground",
                          )}
                          aria-hidden="true"
                        >
                          {mastered ? MASTERED_ICON : unlocked ? UNLOCKED_ICON : LOCK_ICON}
                        </div>
                        <div className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {completedCount}/{DIFFICULTIES.length} clear
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="flex gap-2">
                        {DIFFICULTIES.map((difficulty) => {
                          const done = completionMap[category.id][difficulty.id];
                          return (
                            <div
                              key={difficulty.id}
                              className={cn(
                                "rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]",
                                done
                                  ? "border-accent/35 bg-accent/12 text-accent"
                                  : "border-primary/15 bg-background/50 text-muted-foreground",
                              )}
                            >
                              {done ? "✅" : "⬜"} {difficulty.label}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {lockMessage}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/20 bg-card/85 p-4 shadow-[0_0_40px_rgba(255,61,172,0.06)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.24em] text-primary sm:text-base">
                  Pick Difficulty
                </div>
                <h2 className="mt-2 text-2xl font-black text-glow-cyan sm:text-3xl">
                  Level {getCategoryLevelNumber(activeCategory)} {LEVEL_EMOJIS[activeCategory]}{" "}
                  {getCategoryLabel(activeCategory)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tap a difficulty below. Your choice will open the rules page automatically.
                </p>
              </div>
              <div className="rounded-full border border-primary/25 bg-background/45 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                {getCategoryCompletionCount(completionMap, activeCategory)}/{DIFFICULTIES.length}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {DIFFICULTIES.map((difficulty) => {
                const theme = DIFFICULTY_THEME[difficulty.id];
                const completed = completionMap[activeCategory][difficulty.id];
                const selected =
                  selectedCategory === activeCategory && selectedDifficulty === difficulty.id;

                return (
                  <button
                    key={difficulty.id}
                    type="button"
                    onClick={() => onSelectDifficulty(activeCategory, difficulty.id)}
                    className={cn(
                      "rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300",
                      theme.accent,
                      selected && "scale-[1.01] shadow-[0_0_24px_rgba(255,255,255,0.08)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div
                          className={cn(
                            "text-xs font-black uppercase tracking-[0.22em]",
                            theme.label,
                          )}
                        >
                          {theme.emoji} {getDifficultyLabel(difficulty.id)}
                        </div>
                        <div className="mt-2 text-base font-bold text-foreground sm:text-lg">
                          {difficulty.description}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                          completed ? "border-accent/35 bg-accent/12 text-accent" : theme.chip,
                        )}
                      >
                        {completed ? "Completed" : "Start"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-primary/15 bg-background/35 p-4 text-sm text-muted-foreground">
              <div className="font-black uppercase tracking-[0.2em] text-primary">
                Progress Rule
              </div>
              <p className="mt-2">
                Finish <span className="text-foreground">Easy</span>,{" "}
                <span className="text-foreground">Medium</span>, and{" "}
                <span className="text-foreground">Hard</span> in the current level to unlock the
                next one. Keep climbing. 🚀
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-xl border bg-secondary py-3 text-sm font-bold uppercase tracking-wider text-secondary-foreground transition hover:bg-secondary/80 sm:text-base"
              >
                Back
              </button>
              <div className="flex-1 rounded-xl border border-primary/15 bg-background/35 px-4 py-3 text-center text-sm font-semibold text-muted-foreground">
                Select a difficulty to continue ✨
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
