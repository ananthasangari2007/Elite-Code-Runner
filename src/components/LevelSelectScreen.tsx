import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CircleCheckBig,
  Code2,
  Coins,
  Flame,
  Gem,
  Gift,
  Lock,
  Menu,
  Sparkles,
  Shield,
  ShoppingBag,
  Trophy,
  Zap,
} from "lucide-react";
import { AVATARS } from "@/game/avatars";
import {
  CATEGORY_SEQUENCE,
  getCategoryCompletionCount,
  getCategoryLabel,
  getCategoryLevelNumber,
  isCategoryMastered,
  isCategoryUnlocked,
  type CategoryCompletionMap,
  type CategoryId,
  type DifficultyId,
} from "@/game/questions";
import {
  DIFFICULTY_RUN_CONFIG,
  FEATURED_AVATAR_SHOP,
  LEVEL_THEMES,
  LEVEL_TOPICS,
  buildDailyChallenge,
  buildXpLeaderboard,
  canSpinWheel,
  getAchievementBadges,
  getCompletedLevelsCount,
  getPlayerLevel,
  getProgressRingPercent,
  getSpinWheelCountdown,
  getStreakMilestones,
  getXpIntoCurrentLevel,
  getXpProgressPercent,
  type PlayerProgress,
} from "@/game/progression";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ROADMAP_PREVIEW_LABELS: Record<CategoryId, string> = {
  variables: "Variables & Datatypes, Conditional Statements",
  loops: "(for, while, do while)",
  arrays: "(1D, 2D & 3D)",
  strings: "String Functions",
  functions: "Functions + Final Challenge",
};

const ROADMAP_COLOR_THEMES: Record<
  CategoryId,
  {
    line: string;
    platformClassName: string;
    pillarClassName: string;
    badgeClassName: string;
    cardClassName: string;
    accentTextClassName: string;
    glowShadow: string;
  }
> = {
  variables: {
    line: "#40f59a",
    platformClassName:
      "border-emerald-300/60 bg-emerald-500/10 shadow-[0_0_30px_rgba(64,245,154,0.34)]",
    pillarClassName:
      "border-emerald-300/50 bg-[linear-gradient(180deg,rgba(74,222,128,0.55),rgba(16,185,129,0.14),transparent)]",
    badgeClassName:
      "border-emerald-200/70 bg-[linear-gradient(180deg,#32d97b_0%,#15803d_100%)] text-white",
    cardClassName: "border-emerald-300/22 bg-slate-950/82 shadow-[0_0_22px_rgba(64,245,154,0.16)]",
    accentTextClassName: "text-emerald-200",
    glowShadow: "shadow-[0_0_34px_rgba(64,245,154,0.22)]",
  },
  loops: {
    line: "#f5bb3c",
    platformClassName:
      "border-amber-300/60 bg-amber-500/10 shadow-[0_0_30px_rgba(245,187,60,0.34)]",
    pillarClassName:
      "border-amber-300/50 bg-[linear-gradient(180deg,rgba(250,204,21,0.5),rgba(245,158,11,0.16),transparent)]",
    badgeClassName:
      "border-amber-200/70 bg-[linear-gradient(180deg,#f6c74d_0%,#b45309_100%)] text-white",
    cardClassName: "border-amber-300/22 bg-slate-950/82 shadow-[0_0_22px_rgba(245,187,60,0.16)]",
    accentTextClassName: "text-amber-200",
    glowShadow: "shadow-[0_0_34px_rgba(245,187,60,0.22)]",
  },
  arrays: {
    line: "#32b4ff",
    platformClassName: "border-cyan-300/60 bg-cyan-500/10 shadow-[0_0_30px_rgba(50,180,255,0.34)]",
    pillarClassName:
      "border-cyan-300/50 bg-[linear-gradient(180deg,rgba(56,189,248,0.54),rgba(37,99,235,0.16),transparent)]",
    badgeClassName:
      "border-cyan-200/70 bg-[linear-gradient(180deg,#34c8ff_0%,#2563eb_100%)] text-white",
    cardClassName: "border-cyan-300/22 bg-slate-950/82 shadow-[0_0_22px_rgba(50,180,255,0.16)]",
    accentTextClassName: "text-cyan-200",
    glowShadow: "shadow-[0_0_34px_rgba(50,180,255,0.22)]",
  },
  strings: {
    line: "#b56cff",
    platformClassName:
      "border-violet-300/60 bg-violet-500/10 shadow-[0_0_30px_rgba(181,108,255,0.34)]",
    pillarClassName:
      "border-violet-300/50 bg-[linear-gradient(180deg,rgba(192,132,252,0.54),rgba(147,51,234,0.16),transparent)]",
    badgeClassName:
      "border-violet-200/70 bg-[linear-gradient(180deg,#ba78ff_0%,#7e22ce_100%)] text-white",
    cardClassName: "border-violet-300/22 bg-slate-950/82 shadow-[0_0_22px_rgba(181,108,255,0.16)]",
    accentTextClassName: "text-violet-200",
    glowShadow: "shadow-[0_0_34px_rgba(181,108,255,0.22)]",
  },
  functions: {
    line: "#ff4fbc",
    platformClassName: "border-pink-300/60 bg-pink-500/10 shadow-[0_0_30px_rgba(255,79,188,0.34)]",
    pillarClassName:
      "border-pink-300/50 bg-[linear-gradient(180deg,rgba(244,114,182,0.54),rgba(225,29,72,0.16),transparent)]",
    badgeClassName:
      "border-pink-200/70 bg-[linear-gradient(180deg,#ff67c2_0%,#be185d_100%)] text-white",
    cardClassName: "border-pink-300/22 bg-slate-950/82 shadow-[0_0_22px_rgba(255,79,188,0.16)]",
    accentTextClassName: "text-pink-200",
    glowShadow: "shadow-[0_0_34px_rgba(255,79,188,0.22)]",
  },
};

type RoadmapLane = "top" | "bottom";

const ROADMAP_LANES: Record<CategoryId, RoadmapLane> = {
  variables: "top",
  loops: "bottom",
  arrays: "top",
  strings: "bottom",
  functions: "top",
};

const ROADMAP_MASCOTS: Record<CategoryId, { emoji: string; label: string }> = {
  variables: { emoji: "\uD83E\uDD16", label: "Syntax Scout" },
  loops: { emoji: "\uD83E\uDD8A", label: "Loop Runner" },
  arrays: { emoji: "\uD83D\uDC2C", label: "Array Surfer" },
  strings: { emoji: "\uD83E\uDE84", label: "String Sprite" },
  functions: { emoji: "\uD83D\uDE80", label: "Boss Coder" },
};

const ROADMAP_REWARD_PREVIEWS: Record<CategoryId, string> = {
  variables: "+60 XP and starter coins",
  loops: "+90 XP and combo coins",
  arrays: "+120 XP and logic gems",
  strings: "+150 XP and sparkle streak",
  functions: "+200 XP and a treasury key",
};

const TREASURE_COINS = [
  "\uD83E\uDE99",
  "\uD83D\uDCB0",
  "\uD83E\uDE99",
  "\u2728",
  "\uD83D\uDC8E",
  "\uD83E\uDE99",
];
const TREASURE_ICON = "\uD83D\uDCB0";
const TREASURE_GUARDIAN = "\uD83D\uDC32";

type Props = {
  playerName: string;
  avatarId: number;
  progress: PlayerProgress;
  completionMap: CategoryCompletionMap;
  selectedCategory: CategoryId | null;
  selectedDifficulty: DifficultyId | null;
  spinWheelReward: string | null;
  shopMessage: string | null;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectDifficulty: (categoryId: CategoryId, difficultyId: DifficultyId) => void;
  onSpinWheel: () => void;
  onBuyAvatar: (avatarId: number) => void;
  onBack: () => void;
};

export function LevelSelectScreen({
  playerName,
  avatarId,
  progress,
  completionMap,
  selectedCategory,
  selectedDifficulty,
  spinWheelReward,
  shopMessage,
  onSelectCategory,
  onSelectDifficulty,
  onSpinWheel,
  onBuyAvatar,
  onBack,
}: Props) {
  const isMobile = useIsMobile();
  const [featureHubOpen, setFeatureHubOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [levelPanelOpen, setLevelPanelOpen] = useState(false);

  const selectedAvatar = AVATARS[avatarId];
  const firstUnlockedCategory =
    CATEGORY_SEQUENCE.find((categoryId) => isCategoryUnlocked(completionMap, categoryId)) ??
    CATEGORY_SEQUENCE[0];
  const activeCategory =
    selectedCategory && isCategoryUnlocked(completionMap, selectedCategory)
      ? selectedCategory
      : firstUnlockedCategory;

  const activeLevelTheme = LEVEL_THEMES[activeCategory];
  const playerLevel = getPlayerLevel(progress.xp);
  const xpProgress = getXpProgressPercent(progress.xp);
  const xpInLevel = getXpIntoCurrentLevel(progress.xp);
  const completedLevels = getCompletedLevelsCount(completionMap);
  const ringPercent = getProgressRingPercent(completionMap);
  const dailyChallenge = buildDailyChallenge();
  const leaderboard = buildXpLeaderboard(progress, playerName).slice(0, 5);
  const achievements = getAchievementBadges(progress, completionMap);
  const canSpin = canSpinWheel(progress);
  const streakMilestones = getStreakMilestones();
  const notificationCount = progress.notifications.length;

  const openLevelPanel = (categoryId: CategoryId) => {
    if (!isCategoryUnlocked(completionMap, categoryId)) return;
    onSelectCategory(categoryId);
    setLevelPanelOpen(true);
  };

  const selectedLevelCompletion = useMemo(
    () => getCategoryCompletionCount(completionMap, activeCategory),
    [activeCategory, completionMap],
  );

  return (
    <div className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_16%,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,#040714_0%,#081122_48%,#03060e_100%)] px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }, (_, index) => (
          <span
            key={index}
            className="absolute h-2 w-2 animate-particle-float rounded-full bg-cyan-300/35 blur-[1px]"
            style={{
              left: `${(index * 17) % 100}%`,
              top: `${(index * 11) % 100}%`,
              animationDelay: `${index * 220}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1400px]">
        <header className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-4 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <button
                  type="button"
                  onClick={() => setFeatureHubOpen(true)}
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
                  aria-label="Open feature menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(168,85,247,0.16))] text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                    <Code2 className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                      C Quest
                    </div>
                    <h1 className="mt-1 max-w-[220px] text-2xl font-black leading-tight text-white sm:max-w-none sm:truncate sm:text-3xl">
                      Welcome, {playerName}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">Master C. Code the Future.</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:flex-nowrap lg:justify-end">
                <StatChip
                  icon={<Coins className="h-4 w-4" />}
                  label="Coins"
                  value={progress.coins}
                  accent="amber"
                />
                <StatChip
                  icon={<Gem className="h-4 w-4" />}
                  label="Gems"
                  value={progress.gems}
                  accent="violet"
                />
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-100 transition hover:bg-white/[0.1]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {notificationCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-3 rounded-[1.35rem] border border-cyan-300/18 bg-white/[0.06] px-3 py-2 text-left transition hover:bg-white/[0.1]"
                  aria-label="Open profile"
                >
                  <img
                    src={selectedAvatar.image}
                    alt={selectedAvatar.label}
                    width={52}
                    height={52}
                    className="h-11 w-11 rounded-2xl border border-cyan-300/30 object-cover shadow-[0_0_20px_rgba(34,211,238,0.24)]"
                  />
                  <div className="hidden sm:block">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                      Profile
                    </div>
                    <div className="text-sm font-bold text-white">{selectedAvatar.label}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-violet-200">
                      Level {playerLevel}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                <span>XP Core</span>
                <span>{xpInLevel} / 500 XP</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_55%,#ec4899_100%)] shadow-[0_0_18px_rgba(34,211,238,0.28)]"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mt-5 rounded-[2rem] border border-white/8 bg-slate-950/58 p-4 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-5">
          <div className="rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.1),transparent_22%),rgba(6,9,18,0.88)] p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[1.5rem] border border-cyan-300/25 bg-cyan-400/8 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.14)]">
                  <Code2 className="h-9 w-9" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                    Roadmap
                  </div>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-4xl">
                    {isMobile ? "C ROADMAP" : "C PROGRAMMING JOURNEY"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 sm:text-base">5 Levels to Master C</p>
                </div>
              </div>

              <div className="rounded-[1.3rem] border border-violet-300/15 bg-violet-500/10 px-4 py-3 text-sm text-slate-200">
                <div className="font-black uppercase tracking-[0.22em] text-violet-300">
                  Sequential Unlocks
                </div>
                <p className="mt-2 max-w-sm">
                  Complete `Easy`, `Medium`, and `Hard` in the current level to unlock the next
                  island.
                </p>
              </div>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_50%_12%,rgba(34,211,238,0.08),transparent_24%),radial-gradient(circle_at_18%_82%,rgba(64,245,154,0.1),transparent_18%),radial-gradient(circle_at_82%_72%,rgba(255,79,188,0.1),transparent_18%),rgba(5,8,16,0.86)] px-4 py-4 sm:px-6 sm:py-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.02),transparent_35%)]" />

              <div className="relative z-10">
                <div className="flex flex-col gap-3 border-b border-white/8 pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full border border-cyan-300/18 bg-cyan-400/8 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                      Start at Level 1
                    </div>
                    <div className="rounded-full border border-emerald-300/18 bg-emerald-400/8 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100 sm:text-xs sm:tracking-[0.18em]">
                      {isMobile
                        ? `${completedLevels}/5 Cleared`
                        : `${completedLevels}/5 Levels Cleared`}
                    </div>
                    <div className="rounded-full border border-amber-300/18 bg-amber-400/8 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-amber-100 sm:text-xs sm:tracking-[0.18em]">
                      {isMobile ? "Treasure After 5" : "Treasury After Level 5"}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-2 text-sm text-slate-300">
                    <Sparkles className="h-4 w-4 animate-road-bob text-amber-300" />
                    <span className="leading-relaxed">
                      {isMobile
                        ? "Swipe the zig-zag roadmap to explore every level."
                        : "The roadmap stays aligned in a clean left-to-right zig-zag flow."}
                    </span>
                  </div>
                </div>

                <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 overscroll-x-contain sm:-mx-6 sm:px-6">
                  <div className="min-w-[1040px] lg:min-w-full">
                    <div className="grid grid-cols-[repeat(6,minmax(0,1fr))] gap-4">
                      {CATEGORY_SEQUENCE.map((categoryId, index) => {
                        const unlocked = isCategoryUnlocked(completionMap, categoryId);
                        const mastered = isCategoryMastered(completionMap, categoryId);
                        const highlighted =
                          selectedCategory != null
                            ? selectedCategory === categoryId
                            : activeCategory === categoryId;
                        const completedCount = getCategoryCompletionCount(
                          completionMap,
                          categoryId,
                        );

                        return (
                          <RoadmapLevelStop
                            key={categoryId}
                            categoryId={categoryId}
                            lane={ROADMAP_LANES[categoryId]}
                            unlocked={unlocked}
                            mastered={mastered}
                            selected={highlighted}
                            completedCount={completedCount}
                            showLeftConnector={index > 0}
                            showRightConnector
                            onClick={() => openLevelPanel(categoryId)}
                          />
                        );
                      })}

                      <RoadmapTreasureStop completedLevels={completedLevels} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  Tap any level card on the zig-zag road to open its level panel and choose a
                  difficulty mode.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={featureHubOpen} onOpenChange={setFeatureHubOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className="overflow-y-auto border-white/10 bg-slate-950/96 p-0 text-white sm:max-w-[420px]"
        >
          <SheetHeader className="border-b border-white/8 px-6 py-5">
            <SheetTitle className="text-left text-2xl font-black text-white">
              Feature Hub
            </SheetTitle>
            <SheetDescription className="text-left text-slate-400">
              Daily Challenge, Spin Wheel Reward, Avatar Shop, and Leaderboard all live here.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4 sm:px-6">
            <FeatureCard
              icon={<CalendarDays className="h-5 w-5 text-cyan-200" />}
              eyebrow="Daily Challenge"
              title={dailyChallenge.title}
              description={dailyChallenge.question}
              footerLeft={dailyChallenge.category}
              footerRight={dailyChallenge.reward}
            />

            <FeatureCard
              icon={<Gift className="h-5 w-5 text-fuchsia-200" />}
              eyebrow="Spin Wheel Reward"
              title={canSpin ? "Spin is ready" : "Spin locked"}
              description="One spin every 24 hours. Stack coins, gems, and bonus XP."
              action={
                <button
                  type="button"
                  onClick={onSpinWheel}
                  disabled={!canSpin}
                  className="w-full rounded-[1rem] border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-fuchsia-100 transition hover:bg-fuchsia-500/18 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {canSpin ? "Spin Now" : `Available In ${getSpinWheelCountdown(progress)}`}
                </button>
              }
              extra={
                spinWheelReward ? (
                  <div className="rounded-[1rem] border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                    Reward unlocked: {spinWheelReward}
                  </div>
                ) : null
              }
            />

            <FeatureCard
              icon={<ShoppingBag className="h-5 w-5 text-amber-200" />}
              eyebrow="Avatar Shop"
              title="Buy premium avatars"
              description="Use your coins to unlock new styles for the roadmap."
              extra={
                <div className="grid gap-3">
                  {FEATURED_AVATAR_SHOP.map((item) => {
                    const avatar = AVATARS[item.avatarId];
                    const owned = progress.unlockedAvatarIds.includes(item.avatarId);

                    return (
                      <div
                        key={item.avatarId}
                        className="flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.04] p-3"
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.label}
                          width={52}
                          height={52}
                          className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-slate-400">{item.price} coins</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBuyAvatar(item.avatarId)}
                          disabled={owned || progress.coins < item.price}
                          className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {owned ? "Owned" : "Buy"}
                        </button>
                      </div>
                    );
                  })}

                  {shopMessage && (
                    <div className="rounded-[1rem] border border-cyan-300/15 bg-cyan-400/8 px-3 py-2 text-sm text-cyan-100">
                      {shopMessage}
                    </div>
                  )}
                </div>
              }
            />

            <FeatureCard
              icon={<Trophy className="h-5 w-5 text-emerald-200" />}
              eyebrow="Leaderboard"
              title="Top players by XP"
              description="See who is climbing the C Quest arena the fastest."
              extra={
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={`${entry.rank}-${entry.name}`}
                      className={cn(
                        "flex items-center justify-between rounded-[1rem] border px-3 py-2",
                        entry.isPlayer
                          ? "border-cyan-300/22 bg-cyan-400/10"
                          : "border-white/8 bg-white/[0.04]",
                      )}
                    >
                      <div>
                        <div className="text-sm font-bold text-white">
                          #{entry.rank} {entry.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Level {getPlayerLevel(entry.xp)}
                        </div>
                      </div>
                      <div className="text-sm font-black text-cyan-200">{entry.xp} XP</div>
                    </div>
                  ))}
                </div>
              }
            />

            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-[1.1rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/[0.1]"
            >
              Exit Dashboard
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="overflow-y-auto border-white/10 bg-slate-950/96 p-0 text-white sm:max-w-[420px]"
        >
          <SheetHeader className="border-b border-white/8 px-6 py-5">
            <div className="flex items-center gap-4">
              <img
                src={selectedAvatar.image}
                alt={selectedAvatar.label}
                width={72}
                height={72}
                className="h-16 w-16 rounded-[1.4rem] border border-cyan-300/30 object-cover shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              />
              <div className="text-left">
                <SheetTitle className="text-2xl font-black text-white">
                  {selectedAvatar.label}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  Player profile, progress, streaks, and badges.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4 sm:px-6">
            <GlassPanel>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                    Player Progress
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {completedLevels} / 5 Levels Complete
                  </div>
                  <div className="mt-2 text-sm text-slate-400">Level {playerLevel}</div>
                </div>
                <ProgressRing value={ringPercent} />
              </div>

              <div className="mt-5 rounded-[1.1rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                  <span>XP to next level</span>
                  <span>{xpInLevel}/500</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_55%,#ec4899_100%)]"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-orange-300">
                <Flame className="h-4 w-4 animate-streak-pulse" />
                Current Streak: {progress.streakDays} Days
              </div>
              <div className="mt-4 grid gap-2">
                {streakMilestones.map((milestone) => (
                  <div
                    key={milestone}
                    className={cn(
                      "rounded-[0.95rem] border px-3 py-2 text-sm",
                      progress.streakDays >= milestone
                        ? "border-emerald-300/25 bg-emerald-400/8 text-emerald-200"
                        : "border-white/8 bg-white/[0.03] text-slate-400",
                    )}
                  >
                    {milestone} Day Streak
                    <span className="ml-2 text-xs">
                      {milestone === 3
                        ? "+50 Coins"
                        : milestone === 7
                          ? "+1 Gem"
                          : milestone === 15
                            ? "Rare Badge"
                            : "Golden Avatar Frame"}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-emerald-300">
                <Shield className="h-4 w-4" />
                Achievement Badges
              </div>
              <div className="mt-4 grid gap-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={cn(
                      "rounded-[1rem] border px-3 py-3",
                      achievement.unlocked
                        ? "border-emerald-300/22 bg-emerald-400/8"
                        : "border-white/8 bg-white/[0.03]",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      {achievement.unlocked ? (
                        <CircleCheckBig className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-500" />
                      )}
                      {achievement.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={levelPanelOpen} onOpenChange={setLevelPanelOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="overflow-y-auto border-white/10 bg-slate-950/96 p-0 text-white sm:max-w-[460px]"
        >
          <SheetHeader className="border-b border-white/8 px-6 py-5">
            <div className="flex items-start justify-between gap-4 text-left">
              <div>
                <SheetTitle className="text-2xl font-black text-white">
                  Level {getCategoryLevelNumber(activeCategory)}
                </SheetTitle>
                <SheetDescription className="mt-1 text-slate-400">
                  {getCategoryLabel(activeCategory)}
                </SheetDescription>
              </div>
              <div
                className={cn(
                  "rounded-[1rem] border px-3 py-2 text-sm font-black text-white",
                  activeLevelTheme.islandClass,
                )}
              >
                {activeLevelTheme.badge}
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4 sm:px-6">
            <GlassPanel>
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  Level Progress
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-200">
                  {selectedLevelCompletion}/3 Modes Clear
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {LEVEL_TOPICS[activeCategory].map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </GlassPanel>

            <div className="space-y-3">
              {Object.values(DIFFICULTY_RUN_CONFIG).map((difficulty) => {
                const completed = completionMap[activeCategory][difficulty.id];
                const selected =
                  selectedCategory === activeCategory && selectedDifficulty === difficulty.id;

                return (
                  <button
                    key={difficulty.id}
                    type="button"
                    onClick={() => onSelectDifficulty(activeCategory, difficulty.id)}
                    className={cn(
                      "w-full rounded-[1.35rem] border p-4 text-left transition-all duration-300",
                      "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-cyan-300/22",
                      selected && "border-cyan-300/28 bg-cyan-400/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={cn(
                            "text-xs font-black uppercase tracking-[0.24em]",
                            difficulty.accent,
                          )}
                        >
                          {difficulty.label}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {difficulty.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
                          completed
                            ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                            : "border-white/10 bg-white/5 text-slate-300",
                        )}
                      >
                        {completed ? "Completed" : "Select"}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <RewardPill
                        label={`${difficulty.questionCount} questions`}
                        icon={<Code2 className="h-3.5 w-3.5" />}
                      />
                      <RewardPill
                        label={`+${difficulty.baseXp} XP`}
                        icon={<Zap className="h-3.5 w-3.5" />}
                      />
                      <RewardPill
                        label={`+${difficulty.coins} Coins`}
                        icon={<Coins className="h-3.5 w-3.5" />}
                      />
                      <RewardPill
                        label={
                          difficulty.gems > 0
                            ? `+${difficulty.gems} Gems`
                            : difficulty.timerSeconds
                              ? `${difficulty.timerSeconds}s timer`
                              : "No timer"
                        }
                        icon={
                          difficulty.gems > 0 ? (
                            <Gem className="h-3.5 w-3.5" />
                          ) : (
                            <Flame className="h-3.5 w-3.5" />
                          )
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <GlassPanel>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-violet-200">
                <Gift className="h-4 w-4" />
                Reward Chest System
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Master the full level to trigger a treasure chest with coins, gems, XP boosts,
                avatar unlocks, or theme rewards.
              </p>
            </GlassPanel>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[1.45rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
      {children}
    </section>
  );
}

function FeatureCard({
  icon,
  eyebrow,
  title,
  description,
  footerLeft,
  footerRight,
  action,
  extra,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footerLeft?: string;
  footerRight?: string;
  action?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
            {eyebrow}
          </div>
          <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
        </div>
        {icon}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>

      {(footerLeft || footerRight) && (
        <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm">
          <span className="text-slate-300">{footerLeft}</span>
          <span className="font-bold text-cyan-200">{footerRight}</span>
        </div>
      )}

      {action && <div className="mt-4">{action}</div>}
      {extra && <div className="mt-4">{extra}</div>}
    </section>
  );
}

function StatChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "amber" | "violet";
}) {
  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-[1.15rem] border px-3 py-2 text-sm font-bold sm:inline-flex",
        accent === "amber"
          ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
          : "border-violet-300/20 bg-violet-500/10 text-violet-100",
      )}
    >
      {icon}
      <span className="text-xs uppercase tracking-[0.18em] opacity-75">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(rgba(34,211,238,0.95) ${value}%, rgba(255,255,255,0.08) ${value}% 100%)`,
      }}
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-slate-950 text-lg font-black text-white">
        {value}%
      </div>
    </div>
  );
}
function RoadmapLevelStop({
  categoryId,
  lane,
  unlocked,
  mastered,
  selected,
  completedCount,
  showLeftConnector,
  showRightConnector,
  onClick,
}: {
  categoryId: CategoryId;
  lane: RoadmapLane;
  unlocked: boolean;
  mastered: boolean;
  selected: boolean;
  completedCount: number;
  showLeftConnector: boolean;
  showRightConnector: boolean;
  onClick: () => void;
}) {
  const theme = ROADMAP_COLOR_THEMES[categoryId];
  const levelNumber = getCategoryLevelNumber(categoryId);
  const mascot = ROADMAP_MASCOTS[categoryId];
  const card = (
    <button
      type="button"
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        "min-h-[190px] w-full rounded-[1.5rem] border p-4 text-left backdrop-blur-xl transition-all duration-300",
        theme.cardClassName,
        selected && "ring-1 ring-white/20",
        unlocked ? "hover:-translate-y-1" : "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[11px] font-black uppercase tracking-[0.24em]",
              theme.accentTextClassName,
            )}
          >
            Level {levelNumber}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-2xl animate-road-bob"
              style={{ animationDelay: `${levelNumber * 140}ms` }}
            >
              {mascot.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-base font-black leading-tight text-white">
                {LEVEL_THEMES[categoryId].shortTitle}
              </div>
              <div className="mt-1 text-xs text-slate-400">{mascot.label}</div>
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
          {mastered ? "Done" : unlocked ? "Open" : "Locked"}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-300">
        {ROADMAP_PREVIEW_LABELS[categoryId]}
      </p>

      <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
        {LEVEL_THEMES[categoryId].badge}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: 3 }, (_, segmentIndex) => (
            <span
              key={segmentIndex}
              className={cn(
                "h-2.5 w-2.5 rounded-full border",
                segmentIndex < completedCount
                  ? "border-transparent bg-current"
                  : "border-white/12 bg-white/8",
                theme.accentTextClassName,
              )}
            />
          ))}
        </div>
        <div className="text-[11px] font-semibold text-slate-300">{completedCount}/3 clear</div>
      </div>

      <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/[0.04] px-3 py-2 text-[11px] text-slate-300">
        <span className={cn("font-black", theme.accentTextClassName)}>Reward:</span>{" "}
        {ROADMAP_REWARD_PREVIEWS[categoryId]}
      </div>
    </button>
  );

  return (
    <div className="grid min-h-[460px] grid-rows-[minmax(0,1fr)_92px_minmax(0,1fr)] gap-4">
      <div className={cn("flex", lane === "top" ? "items-end" : "items-start")}>
        {lane === "top" ? card : <div className="h-full w-full" aria-hidden="true" />}
      </div>

      <div className="relative flex items-center justify-center">
        {showLeftConnector && (
          <>
            <div className="absolute left-0 right-1/2 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-white/8" />
            <div
              className="absolute left-0 right-1/2 top-1/2 h-[2px] -translate-y-1/2 rounded-full animate-road-shimmer"
              style={{
                background: `linear-gradient(90deg, rgba(255,255,255,0.04) 0%, ${theme.line} 65%, rgba(255,255,255,0.02) 100%)`,
                backgroundSize: "180% 100%",
                animationDelay: `${levelNumber * 140}ms`,
              }}
            />
          </>
        )}

        {showRightConnector && (
          <>
            <div className="absolute left-1/2 right-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-white/8" />
            <div
              className="absolute left-1/2 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full animate-road-shimmer"
              style={{
                background: `linear-gradient(90deg, rgba(255,255,255,0.02) 0%, ${theme.line} 35%, rgba(255,255,255,0.04) 100%)`,
                backgroundSize: "180% 100%",
                animationDelay: `${levelNumber * 140}ms`,
              }}
            />
          </>
        )}

        <div
          className="absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full opacity-80"
          style={{
            [lane === "top" ? "top" : "bottom"]: 0,
            height: "46px",
            background:
              lane === "top"
                ? `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, ${theme.line} 100%)`
                : `linear-gradient(0deg, rgba(255,255,255,0.04) 0%, ${theme.line} 100%)`,
          }}
        />

        <button
          type="button"
          onClick={onClick}
          disabled={!unlocked}
          className={cn(
            "relative z-10 flex h-18 w-18 items-center justify-center rounded-[1.55rem] border text-white shadow-[0_0_24px_rgba(255,255,255,0.12)] transition-all duration-300",
            theme.badgeClassName,
            theme.glowShadow,
            unlocked ? "hover:-translate-y-1" : "cursor-not-allowed opacity-60",
            selected && "scale-105 ring-2 ring-white/20",
          )}
          aria-label={`Open level ${levelNumber}`}
        >
          {!showLeftConnector && (
            <span className="absolute -top-4 rounded-full border border-violet-300/25 bg-violet-500/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
              Start
            </span>
          )}
          {mastered ? (
            <CircleCheckBig className="h-7 w-7" />
          ) : (
            <span className="text-2xl font-black">{levelNumber}</span>
          )}

          {!unlocked && (
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-slate-950/90 text-slate-200">
              <Lock className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>

      <div className={cn("flex", lane === "bottom" ? "items-start" : "items-end")}>
        {lane === "bottom" ? card : <div className="h-full w-full" aria-hidden="true" />}
      </div>
    </div>
  );
}

function RoadmapTreasureStop({ completedLevels }: { completedLevels: number }) {
  const unlocked = completedLevels === CATEGORY_SEQUENCE.length;

  return (
    <div className="grid min-h-[460px] grid-rows-[minmax(0,1fr)_92px_minmax(0,1fr)] gap-4">
      <div className="h-full w-full" aria-hidden="true" />

      <div className="relative flex items-center justify-center">
        <div className="absolute left-0 right-1/2 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-white/8" />
        <div
          className="absolute left-0 right-1/2 top-1/2 h-[2px] -translate-y-1/2 rounded-full animate-road-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, #fbbf24 68%, rgba(255,255,255,0.02) 100%)",
            backgroundSize: "180% 100%",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[46px] w-[3px] -translate-x-1/2 rounded-full opacity-80"
          style={{
            background:
              "linear-gradient(0deg, rgba(255,255,255,0.04) 0%, rgba(251,191,36,0.95) 100%)",
          }}
        />

        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[1.65rem] border border-amber-200/60 bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.9),transparent_38%),linear-gradient(180deg,#f59e0b_0%,#b45309_100%)] text-3xl shadow-[0_0_34px_rgba(245,158,11,0.32)] animate-road-bob">
          <span aria-hidden="true">{TREASURE_ICON}</span>
        </div>
      </div>

      <div className="flex items-start">
        <section className="relative w-full overflow-hidden rounded-[1.65rem] border border-amber-300/30 bg-[radial-gradient(circle_at_top,rgba(253,224,71,0.2),transparent_34%),linear-gradient(180deg,rgba(120,53,15,0.96)_0%,rgba(69,26,3,0.92)_100%)] p-4 shadow-[0_0_36px_rgba(245,158,11,0.16)]">
          <div
            aria-hidden="true"
            className="absolute right-4 top-3 text-3xl animate-road-bob"
            style={{ animationDelay: "180ms" }}
          >
            {TREASURE_GUARDIAN}
          </div>

          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-100">
            Final Treasury
          </div>
          <h3 className="mt-2 text-lg font-black text-white">Gold Coin Vault</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-50/85">
            Beat every mode in Level 5 to open the treasury packed with coins, gems, and surprise
            rewards.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xl">
            {TREASURE_COINS.map((coin, index) => (
              <span
                key={`${coin}-${index}`}
                aria-hidden="true"
                className="animate-road-bob"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                {coin}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-[1rem] border border-amber-200/18 bg-black/15 px-3 py-2 text-[11px] text-amber-50/85">
            Gold Guardian unlocks once all five level badges are complete.
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[1rem] border border-amber-200/18 bg-black/20 px-3 py-2">
            <span className="text-[11px] font-semibold text-amber-100">
              {completedLevels}/5 levels cleared
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                unlocked
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                  : "border-white/10 bg-white/10 text-amber-50",
              )}
            >
              {unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function RewardPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
      <span className="text-cyan-200">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
