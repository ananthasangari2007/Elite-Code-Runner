import { AVATARS } from "@/game/avatars";
import type { GameSummary } from "@/game/store";
import {
  CATEGORY_SEQUENCE,
  getAllQuestions,
  isCategoryMastered,
  type CategoryCompletionMap,
  type CategoryId,
  type DifficultyId,
} from "@/game/questions";

const PROFILE_STORAGE_KEY = "cquest-player-progress";

export type DifficultyRunConfig = {
  id: DifficultyId;
  label: string;
  cardLabel: string;
  questionCount: number;
  baseXp: number;
  coins: number;
  gems: number;
  timerSeconds: number | null;
  hintLimit: number | "unlimited" | 0;
  description: string;
  chip: string;
  accent: string;
};

export type LevelTheme = {
  accent: string;
  glow: string;
  icon: string;
  badge: string;
  islandClass: string;
  shortTitle: string;
};

export type ShopItem = {
  avatarId: number;
  price: number;
  title: string;
};

export type ChestReward = {
  type: "coins" | "gems" | "xpBoost" | "avatarUnlock" | "themeUnlock" | "badge";
  title: string;
  description: string;
  coins?: number;
  gems?: number;
  xp?: number;
  avatarId?: number;
  theme?: string;
  badge?: string;
};

export type PlayerNotification = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type PlayerProgress = {
  xp: number;
  coins: number;
  gems: number;
  streakDays: number;
  lastCompletedOn: string | null;
  highestCombo: number;
  completedRuns: number;
  earnedBadges: string[];
  unlockedAvatarIds: number[];
  unlockedThemes: string[];
  claimedLevelChests: CategoryId[];
  claimedStreakMilestones: number[];
  lastSpinAt: string | null;
  notifications: PlayerNotification[];
};

export type RunRewardSummary = {
  clearedRun: boolean;
  newlyCompletedDifficulty: boolean;
  levelMastered: boolean;
  unlockedNextLevel: CategoryId | null;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  comboBonusXp: number;
  comboCoinBonus: number;
  streakDays: number;
  chestReward: ChestReward | null;
  streakReward: ChestReward | null;
  badgesEarned: string[];
  totalXp: number;
  totalCoins: number;
  totalGems: number;
  playerLevel: number;
  completedLevels: number;
};

export const DIFFICULTY_RUN_CONFIG: Record<DifficultyId, DifficultyRunConfig> = {
  easy: {
    id: "easy",
    label: "Easy Mode",
    cardLabel: "Starter Orbit",
    questionCount: 10,
    baseXp: 100,
    coins: 50,
    gems: 0,
    timerSeconds: null,
    hintLimit: "unlimited",
    description: "10 simple questions, hints available, and no timer pressure.",
    chip: "from-emerald-400/25 via-emerald-300/10 to-transparent",
    accent: "text-emerald-300",
  },
  medium: {
    id: "medium",
    label: "Medium Mode",
    cardLabel: "Pulse Drift",
    questionCount: 15,
    baseXp: 150,
    coins: 75,
    gems: 0,
    timerSeconds: 20,
    hintLimit: 1,
    description: "15 moderate questions, one hint, and a 20 second timer per question.",
    chip: "from-amber-400/25 via-orange-300/10 to-transparent",
    accent: "text-amber-300",
  },
  hard: {
    id: "hard",
    label: "Hard Mode",
    cardLabel: "Boss Reactor",
    questionCount: 20,
    baseXp: 250,
    coins: 100,
    gems: 2,
    timerSeconds: 15,
    hintLimit: 0,
    description: "20 tough coding questions, zero hints, and a 15 second timer per question.",
    chip: "from-pink-500/25 via-fuchsia-400/10 to-transparent",
    accent: "text-pink-300",
  },
};

export const LEVEL_TOPICS: Record<CategoryId, string[]> = {
  variables: ["Variables & Datatypes", "Conditional Statements", "Operators"],
  loops: ["for loop", "while loop", "do while"],
  arrays: ["1D Array", "2D Array", "3D Array"],
  strings: ["String Basics", "strlen / strcpy / strcat", "Character Arrays"],
  functions: ["Function Syntax", "Return Values", "Final Challenge Boss Level"],
};

export const LEVEL_THEMES: Record<CategoryId, LevelTheme> = {
  variables: {
    accent: "from-emerald-400/35 via-cyan-400/25 to-blue-500/20",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.28)]",
    icon: "</>",
    badge: "Syntax Gate",
    islandClass: "border-emerald-300/50 bg-emerald-500/10",
    shortTitle: "Variables & Conditionals",
  },
  loops: {
    accent: "from-amber-400/35 via-yellow-300/20 to-orange-500/20",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.28)]",
    icon: "LOOP",
    badge: "Loop Reactor",
    islandClass: "border-amber-300/50 bg-amber-500/10",
    shortTitle: "Looping Statements",
  },
  arrays: {
    accent: "from-cyan-400/35 via-sky-400/25 to-indigo-500/20",
    glow: "shadow-[0_0_30px_rgba(56,189,248,0.28)]",
    icon: "[]",
    badge: "Array Matrix",
    islandClass: "border-cyan-300/50 bg-cyan-500/10",
    shortTitle: "Arrays",
  },
  strings: {
    accent: "from-violet-400/35 via-fuchsia-400/20 to-purple-500/20",
    glow: "shadow-[0_0_30px_rgba(192,132,252,0.28)]",
    icon: '"C"',
    badge: "String Portal",
    islandClass: "border-violet-300/50 bg-violet-500/10",
    shortTitle: "String Functions",
  },
  functions: {
    accent: "from-pink-500/35 via-rose-400/20 to-orange-400/20",
    glow: "shadow-[0_0_32px_rgba(244,114,182,0.32)]",
    icon: "fn",
    badge: "Boss Forge",
    islandClass: "border-pink-300/50 bg-pink-500/10",
    shortTitle: "Functions & Final Challenge",
  },
};

export const FEATURED_AVATAR_SHOP: ShopItem[] = [
  { avatarId: 12, price: 180, title: "Quantum Finn" },
  { avatarId: 18, price: 220, title: "Nova Max" },
  { avatarId: 27, price: 260, title: "Pulse Nora" },
  { avatarId: 35, price: 320, title: "Boss Zoe" },
];

const LEVEL_CHEST_REWARDS: Record<CategoryId, ChestReward> = {
  variables: {
    type: "coins",
    title: "Treasure Chest Opened",
    description: "Syntax Gate cleared. You found a starter coin cache.",
    coins: 120,
  },
  loops: {
    type: "gems",
    title: "Treasure Chest Opened",
    description: "Loop Reactor stabilized. A crystal gem dropped from the core.",
    gems: 1,
  },
  arrays: {
    type: "xpBoost",
    title: "Treasure Chest Opened",
    description: "Array Matrix mastered. XP Boost Card activated.",
    xp: 120,
  },
  strings: {
    type: "avatarUnlock",
    title: "Treasure Chest Opened",
    description: "String Portal cracked open a new avatar unlock.",
    avatarId: 35,
  },
  functions: {
    type: "themeUnlock",
    title: "Treasure Chest Opened",
    description: "Boss Forge conquered. Champion Neon theme unlocked.",
    theme: "Champion Neon",
  },
};

const STREAK_MILESTONES = [3, 7, 15, 30] as const;

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function dedupeNumbers(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values));
}

function appendNotification(
  profile: PlayerProgress,
  title: string,
  detail: string,
): PlayerProgress {
  const nextNotification: PlayerNotification = {
    id: crypto.randomUUID(),
    title,
    detail,
    createdAt: new Date().toISOString(),
  };

  return {
    ...profile,
    notifications: [nextNotification, ...profile.notifications].slice(0, 8),
  };
}

function defaultProgress(): PlayerProgress {
  return {
    xp: 0,
    coins: 140,
    gems: 0,
    streakDays: 0,
    lastCompletedOn: null,
    highestCombo: 0,
    completedRuns: 0,
    earnedBadges: [],
    unlockedAvatarIds: [0, 1, 2, 3, 4, 5],
    unlockedThemes: [],
    claimedLevelChests: [],
    claimedStreakMilestones: [],
    lastSpinAt: null,
    notifications: [],
  };
}

function normalizeProfile(raw: Partial<PlayerProgress> | null | undefined): PlayerProgress {
  const base = defaultProgress();

  return {
    ...base,
    ...raw,
    xp: typeof raw?.xp === "number" ? raw.xp : base.xp,
    coins: typeof raw?.coins === "number" ? raw.coins : base.coins,
    gems: typeof raw?.gems === "number" ? raw.gems : base.gems,
    streakDays: typeof raw?.streakDays === "number" ? raw.streakDays : base.streakDays,
    lastCompletedOn: raw?.lastCompletedOn ?? base.lastCompletedOn,
    highestCombo: typeof raw?.highestCombo === "number" ? raw.highestCombo : base.highestCombo,
    completedRuns: typeof raw?.completedRuns === "number" ? raw.completedRuns : base.completedRuns,
    earnedBadges: dedupeStrings(raw?.earnedBadges ?? base.earnedBadges),
    unlockedAvatarIds: dedupeNumbers(raw?.unlockedAvatarIds ?? base.unlockedAvatarIds),
    unlockedThemes: dedupeStrings(raw?.unlockedThemes ?? base.unlockedThemes),
    claimedLevelChests: dedupeStrings(
      raw?.claimedLevelChests ?? base.claimedLevelChests,
    ) as CategoryId[],
    claimedStreakMilestones: dedupeNumbers(
      raw?.claimedStreakMilestones ?? base.claimedStreakMilestones,
    ),
    lastSpinAt: raw?.lastSpinAt ?? base.lastSpinAt,
    notifications: Array.isArray(raw?.notifications)
      ? raw.notifications.slice(0, 8)
      : base.notifications,
  };
}

export function getPlayerProgress() {
  if (typeof window === "undefined") return defaultProgress();

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return defaultProgress();

  try {
    return normalizeProfile(JSON.parse(raw) as Partial<PlayerProgress>);
  } catch {
    return defaultProgress();
  }
}

export function savePlayerProgress(progress: PlayerProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(progress));
}

export function ensurePlayerProgress(selectedAvatarId: number) {
  const current = getPlayerProgress();
  const next = normalizeProfile({
    ...current,
    unlockedAvatarIds: [...current.unlockedAvatarIds, selectedAvatarId],
  });
  savePlayerProgress(next);
  return next;
}

export function getPlayerLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}

export function getXpIntoCurrentLevel(xp: number) {
  return xp % 500;
}

export function getXpProgressPercent(xp: number) {
  return Math.min(100, Math.round((getXpIntoCurrentLevel(xp) / 500) * 100));
}

export function getCompletedLevelsCount(completionMap: CategoryCompletionMap) {
  return CATEGORY_SEQUENCE.filter((categoryId) => isCategoryMastered(completionMap, categoryId))
    .length;
}

export function getProgressRingPercent(completionMap: CategoryCompletionMap) {
  return Math.round((getCompletedLevelsCount(completionMap) / CATEGORY_SEQUENCE.length) * 100);
}

export function buildDailyChallenge() {
  const allQuestions = getAllQuestions();
  const today = todayKey();
  const indexSeed = today.split("-").reduce((sum, chunk) => sum + Number(chunk), 0);
  const question = allQuestions[indexSeed % allQuestions.length];

  return {
    title: "Daily Challenge",
    question: question.q,
    category: question.category,
    reward: "+40 XP / +20 Coins",
  };
}

export function canSpinWheel(progress: PlayerProgress) {
  if (!progress.lastSpinAt) return true;
  return Date.now() - new Date(progress.lastSpinAt).getTime() >= 86_400_000;
}

export function getSpinWheelCountdown(progress: PlayerProgress) {
  if (canSpinWheel(progress)) return "Ready now";
  const remainingMs = 86_400_000 - (Date.now() - new Date(progress.lastSpinAt ?? "").getTime());
  const totalMinutes = Math.max(0, Math.ceil(remainingMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function spinWheel(progress: PlayerProgress) {
  const rewards = [
    {
      label: "+80 Coins",
      apply: (profile: PlayerProgress) => ({ ...profile, coins: profile.coins + 80 }),
    },
    {
      label: "+120 Coins",
      apply: (profile: PlayerProgress) => ({ ...profile, coins: profile.coins + 120 }),
    },
    {
      label: "+1 Gem",
      apply: (profile: PlayerProgress) => ({ ...profile, gems: profile.gems + 1 }),
    },
    { label: "+60 XP", apply: (profile: PlayerProgress) => ({ ...profile, xp: profile.xp + 60 }) },
  ];

  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  let next = reward.apply(progress);
  next = appendNotification(next, "Spin Wheel Reward", `You won ${reward.label}.`);
  next = {
    ...next,
    lastSpinAt: new Date().toISOString(),
  };
  savePlayerProgress(next);

  return {
    progress: next,
    rewardLabel: reward.label,
  };
}

export function buyAvatar(progress: PlayerProgress, avatarId: number) {
  const shopItem = FEATURED_AVATAR_SHOP.find((item) => item.avatarId === avatarId);
  if (!shopItem) {
    return { progress, purchased: false, message: "Avatar not found." };
  }

  if (progress.unlockedAvatarIds.includes(avatarId)) {
    return { progress, purchased: false, message: "Avatar already unlocked." };
  }

  if (progress.coins < shopItem.price) {
    return { progress, purchased: false, message: "Not enough coins." };
  }

  let next = normalizeProfile({
    ...progress,
    coins: progress.coins - shopItem.price,
    unlockedAvatarIds: [...progress.unlockedAvatarIds, avatarId],
  });
  next = appendNotification(
    next,
    "Avatar Purchased",
    `${AVATARS[avatarId].label} joined your collection.`,
  );
  savePlayerProgress(next);

  return {
    progress: next,
    purchased: true,
    message: `${shopItem.title} unlocked.`,
  };
}

export function buildXpLeaderboard(progress: PlayerProgress, playerName: string) {
  const rivals = [
    { name: "Nova", xp: 2140 },
    { name: "Cipher", xp: 1680 },
    { name: "Mika", xp: 1450 },
    { name: "Rex", xp: 1210 },
    { name: playerName || "You", xp: progress.xp },
  ];

  return rivals
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isPlayer: entry.name === (playerName || "You"),
    }));
}

export function getAchievementBadges(
  progress: PlayerProgress,
  completionMap: CategoryCompletionMap,
) {
  const allLevelsComplete = getCompletedLevelsCount(completionMap) === CATEGORY_SEQUENCE.length;

  return [
    {
      name: "First Win",
      unlocked: progress.earnedBadges.includes("First Win"),
      description: "Finish your first difficulty run.",
    },
    {
      name: "7 Day Streak",
      unlocked: progress.earnedBadges.includes("7 Day Streak"),
      description: "Complete a challenge seven days in a row.",
    },
    {
      name: "Array Master",
      unlocked: progress.earnedBadges.includes("Array Master"),
      description: "Master all array difficulties.",
    },
    {
      name: "String Hero",
      unlocked: progress.earnedBadges.includes("String Hero"),
      description: "Master all string function difficulties.",
    },
    {
      name: "C Champion",
      unlocked: progress.earnedBadges.includes("C Champion") || allLevelsComplete,
      description: "Finish all 5 levels and claim the champion badge.",
    },
  ];
}

function applyStreakMilestoneRewards(profile: PlayerProgress, streakDays: number) {
  let next = profile;
  let reward: ChestReward | null = null;

  if (streakDays === 3 && !next.claimedStreakMilestones.includes(3)) {
    next = normalizeProfile({
      ...next,
      coins: next.coins + 50,
      claimedStreakMilestones: [...next.claimedStreakMilestones, 3],
    });
    reward = {
      type: "coins",
      title: "3 Day Streak Reward",
      description: "Consistency bonus unlocked.",
      coins: 50,
    };
  }

  if (streakDays === 7 && !next.claimedStreakMilestones.includes(7)) {
    next = normalizeProfile({
      ...next,
      gems: next.gems + 1,
      claimedStreakMilestones: [...next.claimedStreakMilestones, 7],
      earnedBadges: [...next.earnedBadges, "7 Day Streak"],
    });
    reward = {
      type: "gems",
      title: "7 Day Streak Reward",
      description: "Daily learning chain upgraded into a gem reward.",
      gems: 1,
    };
  }

  if (streakDays === 15 && !next.claimedStreakMilestones.includes(15)) {
    next = normalizeProfile({
      ...next,
      claimedStreakMilestones: [...next.claimedStreakMilestones, 15],
      earnedBadges: [...next.earnedBadges, "Rare Badge"],
    });
    reward = {
      type: "badge",
      title: "15 Day Streak Reward",
      description: "Rare Badge earned for your consistency run.",
      badge: "Rare Badge",
    };
  }

  if (streakDays === 30 && !next.claimedStreakMilestones.includes(30)) {
    next = normalizeProfile({
      ...next,
      claimedStreakMilestones: [...next.claimedStreakMilestones, 30],
      unlockedThemes: [...next.unlockedThemes, "Golden Avatar Frame"],
    });
    reward = {
      type: "themeUnlock",
      title: "30 Day Streak Reward",
      description: "Golden Avatar Frame unlocked.",
      theme: "Golden Avatar Frame",
    };
  }

  return { progress: next, reward };
}

function applyLevelChestReward(profile: PlayerProgress, categoryId: CategoryId) {
  if (profile.claimedLevelChests.includes(categoryId)) {
    return { progress: profile, chestReward: null };
  }

  const chestReward = LEVEL_CHEST_REWARDS[categoryId];
  let next = normalizeProfile({
    ...profile,
    coins: profile.coins + (chestReward.coins ?? 0),
    gems: profile.gems + (chestReward.gems ?? 0),
    xp: profile.xp + (chestReward.xp ?? 0),
    claimedLevelChests: [...profile.claimedLevelChests, categoryId],
    unlockedAvatarIds:
      typeof chestReward.avatarId === "number"
        ? [...profile.unlockedAvatarIds, chestReward.avatarId]
        : profile.unlockedAvatarIds,
    unlockedThemes: chestReward.theme
      ? [...profile.unlockedThemes, chestReward.theme]
      : profile.unlockedThemes,
    earnedBadges: chestReward.badge
      ? [...profile.earnedBadges, chestReward.badge]
      : profile.earnedBadges,
  });

  next = appendNotification(next, chestReward.title, chestReward.description);

  return {
    progress: next,
    chestReward,
  };
}

function awardBadge(profile: PlayerProgress, badge: string, detail: string) {
  if (profile.earnedBadges.includes(badge)) return profile;
  return appendNotification(
    normalizeProfile({
      ...profile,
      earnedBadges: [...profile.earnedBadges, badge],
    }),
    "Achievement Unlocked",
    detail,
  );
}

function calculateStreak(current: PlayerProgress) {
  const today = todayKey();
  if (!current.lastCompletedOn) return 1;

  const gap = daysBetween(current.lastCompletedOn, today);
  if (gap <= 0) return current.streakDays;
  if (gap === 1) return current.streakDays + 1;
  return 1;
}

export function applyRunRewards({
  progress,
  categoryId,
  difficultyId,
  completionMap,
  summary,
}: {
  progress: PlayerProgress;
  categoryId: CategoryId;
  difficultyId: DifficultyId;
  completionMap: CategoryCompletionMap;
  summary: GameSummary;
}) {
  const runConfig = DIFFICULTY_RUN_CONFIG[difficultyId];
  const clearedRun = Boolean(summary.clearedRun);
  const newlyCompletedDifficulty = clearedRun;
  const levelMastered = isCategoryMastered(completionMap, categoryId);
  const categoryIndex = CATEGORY_SEQUENCE.indexOf(categoryId);
  const unlockedNextLevel =
    levelMastered && categoryIndex < CATEGORY_SEQUENCE.length - 1
      ? CATEGORY_SEQUENCE[categoryIndex + 1]
      : null;

  let next = normalizeProfile({
    ...progress,
    xp: progress.xp + (summary.comboBonusXp ?? 0),
    coins: progress.coins + (summary.comboCoinBonus ?? 0),
    highestCombo: Math.max(progress.highestCombo, summary.bestStreak),
  });

  let xpEarned = summary.comboBonusXp ?? 0;
  let coinsEarned = summary.comboCoinBonus ?? 0;
  let gemsEarned = 0;
  let chestReward: ChestReward | null = null;
  let streakReward: ChestReward | null = null;
  const badgesEarned: string[] = [];

  if (clearedRun) {
    next = normalizeProfile({
      ...next,
      xp: next.xp + runConfig.baseXp,
      coins: next.coins + runConfig.coins,
      gems: next.gems + runConfig.gems,
      completedRuns: next.completedRuns + 1,
      streakDays: calculateStreak(next),
      lastCompletedOn: todayKey(),
    });

    xpEarned += runConfig.baseXp;
    coinsEarned += runConfig.coins;
    gemsEarned += runConfig.gems;

    next = appendNotification(
      next,
      `${runConfig.label} Cleared`,
      `You finished ${CATEGORY_SEQUENCE.indexOf(categoryId) + 1}.${categoryId} and banked rewards.`,
    );

    if (next.completedRuns === 1) {
      next = awardBadge(next, "First Win", "First Win badge earned.");
      badgesEarned.push("First Win");
    }

    if (categoryId === "arrays" && levelMastered) {
      next = awardBadge(next, "Array Master", "Array Master badge earned.");
      badgesEarned.push("Array Master");
    }

    if (categoryId === "strings" && levelMastered) {
      next = awardBadge(next, "String Hero", "String Hero badge earned.");
      badgesEarned.push("String Hero");
    }

    const streakResult = applyStreakMilestoneRewards(next, next.streakDays);
    next = streakResult.progress;
    streakReward = streakResult.reward;

    if (streakReward) {
      next = appendNotification(next, streakReward.title, streakReward.description);
      coinsEarned += streakReward.coins ?? 0;
      gemsEarned += streakReward.gems ?? 0;
      xpEarned += streakReward.xp ?? 0;
    }

    if (levelMastered) {
      const chestResult = applyLevelChestReward(next, categoryId);
      next = chestResult.progress;
      chestReward = chestResult.chestReward;

      if (chestReward) {
        coinsEarned += chestReward.coins ?? 0;
        gemsEarned += chestReward.gems ?? 0;
        xpEarned += chestReward.xp ?? 0;
      }
    }
  }

  if (getCompletedLevelsCount(completionMap) === CATEGORY_SEQUENCE.length) {
    const before = next.earnedBadges.includes("C Champion");
    next = awardBadge(next, "C Champion", "C Champion badge earned for clearing all 5 levels.");
    if (!before) badgesEarned.push("C Champion");
  }

  savePlayerProgress(next);

  return {
    progress: next,
    rewardSummary: {
      clearedRun,
      newlyCompletedDifficulty,
      levelMastered,
      unlockedNextLevel,
      xpEarned,
      coinsEarned,
      gemsEarned,
      comboBonusXp: summary.comboBonusXp ?? 0,
      comboCoinBonus: summary.comboCoinBonus ?? 0,
      streakDays: next.streakDays,
      chestReward,
      streakReward,
      badgesEarned,
      totalXp: next.xp,
      totalCoins: next.coins,
      totalGems: next.gems,
      playerLevel: getPlayerLevel(next.xp),
      completedLevels: getCompletedLevelsCount(completionMap),
    } satisfies RunRewardSummary,
  };
}

export function getStreakMilestones() {
  return STREAK_MILESTONES;
}
