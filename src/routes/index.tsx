import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { GameCanvas } from "@/components/GameCanvas";
import { GameOver } from "@/components/GameOver";
import { LevelSelectScreen } from "@/components/LevelSelectScreen";
import { PlayerSetup } from "@/components/PlayerSetup";
import { RulesScreen } from "@/components/RulesScreen";
import {
  getCategoryCompletionMap,
  getCategoryLabel,
  getDemoQuestionSet,
  getQuestionSet,
  markDifficultyComplete,
  type CategoryCompletionMap,
  type CategoryId,
  type DifficultyId,
} from "@/game/questions";
import {
  DIFFICULTY_RUN_CONFIG,
  applyRunRewards,
  buyAvatar,
  ensurePlayerProgress,
  getPlayerProgress,
  spinWheel,
  type PlayerProgress,
  type RunRewardSummary,
} from "@/game/progression";
import { supabase } from "@/integrations/supabase/client";
import {
  createPlayerSession,
  ensureAdminConfig,
  fetchAdminSnapshot,
  finishPlayerSession,
  forceOpenLeaderboard,
  closeLeaderboard,
  markPlayerQuit,
  markPlayerExited,
  saveAdminConfig,
  startNewRound,
  submitPlayerFeedback,
  getLocalAdminConfig,
  getLocalSessions,
  type AdminConfig,
  type GameSummary,
  type PlayMode,
  type PlayerSession,
} from "@/game/store";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "C Quest - Futuristic C Programming Learning Game" },
      {
        name: "description",
        content:
          "C Quest is a futuristic gamified learning experience for mastering C programming through levels, rewards, streaks, and interactive gameplay.",
      },
    ],
  }),
});

type Phase = "setup" | "levels" | "rules" | "playing" | "over";

const DEMO_PLAYS_KEY = "elite-demo-plays-used";

function Index() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(0);
  const [mode, setMode] = useState<PlayMode>("competition");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId | null>(null);
  const [completionMap, setCompletionMap] = useState<CategoryCompletionMap>(() =>
    getCategoryCompletionMap(),
  );
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(() => getPlayerProgress());
  const [result, setResult] = useState<GameSummary | null>(null);
  const [rewardSummary, setRewardSummary] = useState<RunRewardSummary | null>(null);
  const [demoPlaysUsed, setDemoPlaysUsed] = useState(0);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => getLocalAdminConfig());
  const [sessions, setSessions] = useState<PlayerSession[]>(() => {
    const config = getLocalAdminConfig();
    return getLocalSessions().filter((session) => session.roundId === config.currentRoundId);
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [spinWheelReward, setSpinWheelReward] = useState<string | null>(null);
  const [shopMessage, setShopMessage] = useState<string | null>(null);

  const refreshSnapshot = useCallback(async () => {
    try {
      const snapshot = await fetchAdminSnapshot();
      setAdminConfig(snapshot.config);
      setSessions(snapshot.sessions);
    } catch {
      setAdminConfig(getLocalAdminConfig());
      const config = getLocalAdminConfig();
      setSessions(
        getLocalSessions().filter((session) => session.roundId === config.currentRoundId),
      );
    }
  }, []);

  useEffect(() => {
    const storedDemoPlays =
      typeof window === "undefined" ? 0 : Number(localStorage.getItem(DEMO_PLAYS_KEY) || "0");
    setDemoPlaysUsed(storedDemoPlays);
    setCompletionMap(getCategoryCompletionMap());
    setPlayerProgress(getPlayerProgress());

    let active = true;
    const boot = async () => {
      try {
        const config = await ensureAdminConfig();
        if (!active) return;
        setAdminConfig(config);
        await refreshSnapshot();
      } catch {
        if (!active) return;
        setAdminConfig(getLocalAdminConfig());
        setSessions(getLocalSessions());
      }
    };

    void boot();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("elite-live-round")
        .on("postgres_changes", { event: "*", schema: "public", table: "app_control" }, () => {
          void refreshSnapshot();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "player_sessions" }, () => {
          void refreshSnapshot();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    const intervalId = window.setInterval(() => {
      void refreshSnapshot();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    if (phase !== "setup" && adminPanelOpen) {
      setAdminPanelOpen(false);
    }
  }, [adminPanelOpen, phase]);

  const incrementDemoPlays = () => {
    const next = demoPlaysUsed + 1;
    setDemoPlaysUsed(next);
    localStorage.setItem(DEMO_PLAYS_KEY, String(next));
  };

  const clearRunSelection = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  const selectedRunConfig =
    mode === "competition" && selectedDifficulty ? DIFFICULTY_RUN_CONFIG[selectedDifficulty] : null;

  const selectedQuestions =
    mode === "demo"
      ? getDemoQuestionSet()
      : selectedCategory && selectedDifficulty && selectedRunConfig
        ? getQuestionSet(selectedCategory, selectedDifficulty, selectedRunConfig.questionCount)
        : [];

  const enterMode = (playerName: string, selectedAvatarId: number, selectedMode: PlayMode) => {
    const progress = ensurePlayerProgress(selectedAvatarId);
    setAdminPanelOpen(false);
    clearRunSelection();
    setCurrentSessionId(null);
    setResult(null);
    setRewardSummary(null);
    setPlayerProgress(progress);
    setSpinWheelReward(null);
    setShopMessage(null);
    setName(playerName);
    setAvatarId(selectedAvatarId);
    setMode(selectedMode);
    setPhase(selectedMode === "demo" ? "rules" : "levels");
  };

  const handleSelectRun = (categoryId: CategoryId, difficultyId: DifficultyId) => {
    setSelectedCategory(categoryId);
    setSelectedDifficulty(difficultyId);
    setPhase("rules");
  };

  const startGameplay = async () => {
    if (mode === "demo") {
      if (selectedQuestions.length === 0) return;
      if (demoPlaysUsed >= 3) {
        setPhase("setup");
        return;
      }
      incrementDemoPlays();
      setCurrentSessionId(null);
      setPhase("playing");
      return;
    }

    if (!selectedCategory || !selectedDifficulty || selectedQuestions.length === 0) return;

    const session = await createPlayerSession({ name, avatarId, mode });
    setCurrentSessionId(session?.id ?? null);
    await refreshSnapshot();
    setPhase("playing");
  };

  const finishGameplay = async (summary: GameSummary) => {
    let nextCompletionMap = completionMap;

    if (selectedCategory && selectedDifficulty && summary.clearedRun) {
      nextCompletionMap = markDifficultyComplete(selectedCategory, selectedDifficulty);
      setCompletionMap(nextCompletionMap);
    }

    if (mode === "competition" && selectedCategory && selectedDifficulty) {
      const rewardResult = applyRunRewards({
        progress: playerProgress,
        categoryId: selectedCategory,
        difficultyId: selectedDifficulty,
        completionMap: nextCompletionMap,
        summary,
      });

      setPlayerProgress(rewardResult.progress);
      setRewardSummary(rewardResult.rewardSummary);
    } else {
      setRewardSummary(null);
    }

    setResult(summary);
    setPhase("over");
  };

  const finalizeGameplayResult = useCallback(
    async (summary: GameSummary) => {
      if (mode !== "competition" || !currentSessionId) return;
      await finishPlayerSession(currentSessionId, summary);
      await refreshSnapshot();
    },
    [currentSessionId, mode, refreshSnapshot],
  );

  const quitGameplay = async () => {
    if (mode === "competition" && currentSessionId) {
      await markPlayerQuit(currentSessionId);
      await refreshSnapshot();
    }
    setCurrentSessionId(null);
    setResult(null);
    setRewardSummary(null);
    clearRunSelection();
    setPhase("setup");
  };

  const syncResultExit = useCallback(
    (exitReason: "home" | "replay") => {
      if (mode !== "competition" || !currentSessionId) return;

      const sessionId = currentSessionId;
      void (async () => {
        await markPlayerExited(sessionId, exitReason);
        await refreshSnapshot();
      })();
    },
    [currentSessionId, mode, refreshSnapshot],
  );

  const goHome = () => {
    syncResultExit("home");
    setCurrentSessionId(null);
    setResult(null);
    setRewardSummary(null);
    clearRunSelection();
    setPhase("setup");
  };

  const playAgain = () => {
    syncResultExit("replay");
    setResult(null);
    setRewardSummary(null);
    setCurrentSessionId(null);
    if (mode === "demo") {
      setPhase("rules");
      return;
    }

    clearRunSelection();
    setPhase("levels");
  };

  const handleSubmitFeedback = async (rating: number, feedback: string) => {
    if (!currentSessionId) return;
    await submitPlayerFeedback(currentSessionId, rating, feedback);
    await refreshSnapshot();
  };

  const handleSaveSettings = async (updates: Partial<AdminConfig>) => {
    await saveAdminConfig({
      adminPassword: updates.adminPassword,
      expectedPlayersMode: updates.expectedPlayersMode,
      expectedPlayers: updates.expectedPlayers,
      leaderboardMode: updates.leaderboardMode,
      leaderboardOpen: updates.leaderboardOpen,
    });
    await refreshSnapshot();
  };

  const handleForceLeaderboard = async () => {
    await forceOpenLeaderboard();
    await refreshSnapshot();
  };

  const handleCloseLeaderboard = async () => {
    await closeLeaderboard();
    await refreshSnapshot();
  };

  const handleStartNewRound = async () => {
    await startNewRound();
    setCurrentSessionId(null);
    setResult(null);
    setRewardSummary(null);
    clearRunSelection();
    setPhase("setup");
    await refreshSnapshot();
  };

  const handleSpinWheel = () => {
    const result = spinWheel(playerProgress);
    setPlayerProgress(result.progress);
    setSpinWheelReward(result.rewardLabel);
  };

  const handleBuyAvatar = (targetAvatarId: number) => {
    const result = buyAvatar(playerProgress, targetAvatarId);
    setPlayerProgress(result.progress);
    setShopMessage(result.message);
  };

  return (
    <>
      {phase === "setup" && <PlayerSetup demoPlaysUsed={demoPlaysUsed} onStart={enterMode} />}

      {phase === "levels" && (
        <LevelSelectScreen
          playerName={name}
          avatarId={avatarId}
          progress={playerProgress}
          completionMap={completionMap}
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          spinWheelReward={spinWheelReward}
          shopMessage={shopMessage}
          onSelectCategory={(categoryId) => {
            setSelectedCategory(categoryId);
            setSelectedDifficulty(null);
          }}
          onSelectDifficulty={handleSelectRun}
          onSpinWheel={handleSpinWheel}
          onBuyAvatar={handleBuyAvatar}
          onBack={() => {
            clearRunSelection();
            setPhase("setup");
          }}
        />
      )}

      {phase === "rules" && (
        <RulesScreen
          mode={mode}
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          runConfig={selectedRunConfig}
          onStart={() => void startGameplay()}
          onBack={() => {
            if (mode === "demo") {
              clearRunSelection();
              setPhase("setup");
              return;
            }

            setPhase("levels");
          }}
        />
      )}

      {phase === "playing" && (
        <GameCanvas
          playerName={name}
          avatarId={avatarId}
          questions={selectedQuestions}
          runConfig={selectedRunConfig}
          runTitle={selectedCategory ? getCategoryLabel(selectedCategory) : "Demo Track"}
          onEnd={finishGameplay}
          onQuit={quitGameplay}
        />
      )}

      {phase === "over" && result && (
        <GameOver
          playerName={name}
          avatarId={avatarId}
          mode={mode}
          result={result}
          rewardSummary={rewardSummary}
          config={adminConfig}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onFinalizeResult={finalizeGameplayResult}
          onSubmitFeedback={handleSubmitFeedback}
          onPlayAgain={playAgain}
          onHome={goHome}
        />
      )}

      <AdminPanel
        config={adminConfig}
        sessions={sessions}
        visible={phase === "setup"}
        open={adminPanelOpen}
        onOpenChange={setAdminPanelOpen}
        onSaveSettings={handleSaveSettings}
        onForceLeaderboard={handleForceLeaderboard}
        onCloseLeaderboard={handleCloseLeaderboard}
        onStartNewRound={handleStartNewRound}
      />
    </>
  );
}
