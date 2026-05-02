import { useCallback, useEffect, useRef, useState } from "react";
import { sfx, startMusic, stopMusic, setMuted, isMuted } from "@/game/audio";
import { AVATARS } from "@/game/avatars";
import type { DifficultyRunConfig } from "@/game/progression";
import type { Question } from "@/game/questions";
import type { GameSummary } from "@/game/store";
import { Countdown } from "./Countdown";
import { QuestionPopup } from "./QuestionPopup";

const LANES = 4;
const GAME_DURATION_MS = 5 * 60 * 1000;
const SPAWN_INTERVAL_MS = 1400;
const OBJECT_SPEED = 0.45;
const MAX_ACTIVE_QUESTIONS = 2;
const PICKUP_SYMBOL = "?";
const HEART_SYMBOL = "\u2665";
const MUTE_ICON = "\ud83d\udd07";
const SOUND_ICON = "\ud83d\udd0a";
const PLAY_ICON = "\u25b6";
const PAUSE_ICON = "\u23f8";
const LEFT_ARROW = "\u2190";
const RIGHT_ARROW = "\u2192";

type GameObject = { id: number; lane: number; y: number; qIndex: number };
type Popup = { id: number; text: string; color: string };

type Props = {
  playerName: string;
  avatarId: number;
  questions: Question[];
  runConfig: DifficultyRunConfig | null;
  runTitle: string;
  onEnd: (summary: GameSummary) => void;
  onQuit: () => void;
};

function shuffleQuestionIndexes(length: number) {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
  }

  return order;
}

export function GameCanvas({
  playerName,
  avatarId,
  questions,
  runConfig,
  runTitle,
  onEnd,
  onQuit,
}: Props) {
  const avatar = AVATARS[avatarId];
  const activeRunConfig: DifficultyRunConfig = runConfig ?? {
    id: "easy",
    label: "Demo Play",
    cardLabel: "Practice Orbit",
    questionCount: questions.length,
    baseXp: 0,
    coins: 0,
    gems: 0,
    timerSeconds: null,
    hintLimit: "unlimited",
    description: "Practice the flow with the current game engine.",
    chip: "from-cyan-400/25 via-blue-400/10 to-transparent",
    accent: "text-cyan-300",
  };
  const totalQuestions = questions.length;
  const trackRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"countdown" | "playing" | "paused" | "question">("countdown");
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [currentQ, setCurrentQ] = useState<{ qIndex: number; objId: number } | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [muted, setMutedState] = useState(isMuted());
  const [shake, setShake] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboBonusXp, setComboBonusXp] = useState(0);
  const [comboCoinBonus, setComboCoinBonus] = useState(0);
  const [coinShower, setCoinShower] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const answeredQ = useRef<Set<number>>(new Set());
  const idCounter = useRef(0);
  const lastFrame = useRef(performance.now());
  const startTime = useRef<number | null>(null);
  const pendingQRef = useRef<{ qIndex: number; objId: number } | null>(null);
  const correctAnswersRef = useRef(correctAnswers);
  const bestStreakRef = useRef(bestStreak);
  const currentStreakRef = useRef(0);
  const queueRef = useRef<number[]>(shuffleQuestionIndexes(totalQuestions));
  const currentQRef = useRef<{ qIndex: number; objId: number } | null>(null);

  const phaseRef = useRef(phase);
  const laneRef = useRef(lane);
  const scoreRef = useRef(score);
  const questionsAskedRef = useRef(questionsAsked);
  phaseRef.current = phase;
  laneRef.current = lane;
  scoreRef.current = score;
  questionsAskedRef.current = questionsAsked;
  correctAnswersRef.current = correctAnswers;
  bestStreakRef.current = bestStreak;
  currentQRef.current = currentQ;

  const refillQueueIfNeeded = useCallback(
    (currentObjects: GameObject[]) => {
      if (queueRef.current.length > 0 || questionsAskedRef.current >= totalQuestions) return;

      const blocked = new Set(currentObjects.map((obj) => obj.qIndex));
      if (currentQRef.current) blocked.add(currentQRef.current.qIndex);

      const remaining = Array.from({ length: totalQuestions }, (_, index) => index).filter(
        (index) => !answeredQ.current.has(index) && !blocked.has(index),
      );

      if (remaining.length === 0) return;
      queueRef.current = remaining;
    },
    [totalQuestions],
  );

  const spawnQuestionObject = useCallback(() => {
    if (questionsAskedRef.current >= totalQuestions) return;

    setObjects((currentObjects) => {
      refillQueueIfNeeded(currentObjects);
      if (currentObjects.length >= MAX_ACTIVE_QUESTIONS) return currentObjects;
      if (queueRef.current.length === 0) return currentObjects;

      const qIndex = queueRef.current.shift();
      if (qIndex === undefined) return currentObjects;

      const id = ++idCounter.current;
      return [...currentObjects, { id, lane: Math.floor(Math.random() * LANES), y: -72, qIndex }];
    });
  }, [refillQueueIfNeeded, totalQuestions]);

  const moveLane = useCallback((dir: -1 | 1) => {
    if (phaseRef.current !== "playing") return;

    setLane((currentLane) => {
      const nextLane = Math.max(0, Math.min(LANES - 1, currentLane + dir));
      if (nextLane !== currentLane) sfx.move();
      return nextLane;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        moveLane(-1);
      } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        moveLane(1);
      } else if (event.key === "p" || event.key === "P") {
        setPhase((currentPhase) =>
          currentPhase === "playing"
            ? "paused"
            : currentPhase === "paused"
              ? "playing"
              : currentPhase,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane]);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;

    const onStart = (event: TouchEvent) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };

    const onEnd = (event: TouchEvent) => {
      const deltaX = event.changedTouches[0].clientX - startX;
      const deltaY = event.changedTouches[0].clientY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        moveLane(deltaX > 0 ? 1 : -1);
      }
    };

    element.addEventListener("touchstart", onStart, { passive: true });
    element.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", onStart);
      element.removeEventListener("touchend", onEnd);
    };
  }, [moveLane]);

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  const endGame = useCallback(
    (finalScore: number, clearedRun: boolean) => {
      const elapsed = startTime.current ? performance.now() - startTime.current : 0;
      stopMusic();
      const answeredCount = questionsAskedRef.current;
      const totalCorrect = correctAnswersRef.current;

      onEnd({
        score: finalScore,
        timeMs: Math.min(elapsed, GAME_DURATION_MS),
        correctAnswers: totalCorrect,
        answeredCount,
        accuracy: answeredCount === 0 ? 0 : Math.round((totalCorrect / answeredCount) * 100),
        bestStreak: bestStreakRef.current,
        comboBonusXp,
        comboCoinBonus,
        clearedRun,
      });
    },
    [comboBonusXp, comboCoinBonus, onEnd],
  );

  useEffect(() => {
    if (phase !== "playing") {
      lastFrame.current = performance.now();
      return;
    }

    spawnQuestionObject();
    const spawnIntervalId = window.setInterval(spawnQuestionObject, SPAWN_INTERVAL_MS);

    return () => window.clearInterval(spawnIntervalId);
  }, [phase, spawnQuestionObject]);

  useEffect(() => {
    if (phase !== "playing" || currentQ || questionsAsked >= totalQuestions || objects.length > 0)
      return;

    const timeoutId = window.setTimeout(() => {
      spawnQuestionObject();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [phase, currentQ, questionsAsked, totalQuestions, objects.length, spawnQuestionObject]);

  useEffect(() => {
    if (phase !== "playing") {
      lastFrame.current = performance.now();
      return;
    }

    if (startTime.current === null) startTime.current = performance.now();

    let raf = 0;
    const trackHeight = trackRef.current?.clientHeight ?? 600;
    const playerCenterY = trackHeight - 150;
    const collisionTop = playerCenterY - 65;
    const collisionBottom = playerCenterY + 35;

    const tick = (now: number) => {
      const deltaTime = Math.min(now - lastFrame.current, 50);
      lastFrame.current = now;

      setTimeLeft((currentTime) => {
        const nextTime = Math.max(0, currentTime - deltaTime);
        if (nextTime === 0) endGame(scoreRef.current, false);
        return nextTime;
      });

      setObjects((currentObjects) => {
        refillQueueIfNeeded(currentObjects);
        const movedObjects: GameObject[] = [];
        let collision: { qIndex: number; objId: number } | null = null;

        for (const object of currentObjects) {
          const nextY = object.y + OBJECT_SPEED * deltaTime;

          if (
            !collision &&
            object.lane === laneRef.current &&
            nextY >= collisionTop &&
            nextY <= collisionBottom
          ) {
            collision = { qIndex: object.qIndex, objId: object.id };
            continue;
          }

          if (nextY > trackHeight + 80) {
            queueRef.current.push(object.qIndex);
            continue;
          }

          movedObjects.push({ ...object, y: nextY });
        }

        if (collision) pendingQRef.current = collision;
        return movedObjects;
      });

      if (pendingQRef.current) {
        const collision = pendingQRef.current;
        pendingQRef.current = null;
        sfx.collide();
        setCurrentQ(collision);
        setPhase("question");
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [endGame, phase, refillQueueIfNeeded]);

  const spawnPopup = (text: string, color: string) => {
    const id = ++idCounter.current;
    setPopups((currentPopups) => [...currentPopups, { id, text, color }]);
    window.setTimeout(() => {
      setPopups((currentPopups) => currentPopups.filter((popup) => popup.id !== id));
    }, 1100);
  };

  const triggerCoinShower = () => {
    setCoinShower(true);
    window.setTimeout(() => setCoinShower(false), 900);
  };

  const handleAnswer = (idx: number | null) => {
    if (!currentQ) return;

    const currentQuestion = questions[currentQ.qIndex];
    const correct = idx !== null && idx === currentQuestion.answer;
    const nextAsked = questionsAsked + 1;
    answeredQ.current.add(currentQ.qIndex);
    setQuestionsAsked(nextAsked);

    let nextScore = score;
    let nextLives = lives;

    if (correct) {
      nextScore += 5;
      const nextCorrectAnswers = correctAnswers + 1;
      const nextStreak = currentStreakRef.current + 1;
      let xpReward = 0;
      let coinReward = 0;

      currentStreakRef.current = nextStreak;
      setCorrectAnswers(nextCorrectAnswers);

      if (nextStreak > bestStreakRef.current) {
        bestStreakRef.current = nextStreak;
        setBestStreak(nextStreak);
      }

      if (nextStreak % 5 === 0) {
        xpReward += 25;
        coinReward += 10;
        triggerCoinShower();
        spawnPopup("COMBO x5 +25 XP", "var(--neon-yellow)");
      } else if (nextStreak % 3 === 0) {
        xpReward += 10;
        spawnPopup("COMBO x3 +10 XP", "var(--neon-cyan)");
      }

      if (xpReward > 0) setComboBonusXp((currentBonus) => currentBonus + xpReward);
      if (coinReward > 0) setComboCoinBonus((currentBonus) => currentBonus + coinReward);

      sfx.correct();
      spawnPopup("+5", "var(--neon-green)");
    } else {
      nextScore -= 1;
      nextLives -= 1;
      currentStreakRef.current = 0;
      sfx.wrong();
      spawnPopup(idx === null ? "TIME UP -1 \u2665" : "-1 \u2665", "var(--neon-pink)");
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
    }

    setScore(nextScore);
    setLives(nextLives);
    setCurrentQ(null);

    if (nextLives <= 0 || nextAsked >= totalQuestions) {
      endGame(nextScore, nextAsked >= totalQuestions && nextLives > 0);
      return;
    }

    setPhase("playing");
    window.setTimeout(() => {
      spawnQuestionObject();
    }, 80);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setMuted(nextMuted);
  };

  const togglePause = () => {
    setPhase((currentPhase) =>
      currentPhase === "playing" ? "paused" : currentPhase === "paused" ? "playing" : currentPhase,
    );
  };

  const useHint = () => {
    if (activeRunConfig.hintLimit === 0) return;
    if (activeRunConfig.hintLimit !== "unlimited" && hintsUsed >= activeRunConfig.hintLimit) return;
    if (activeRunConfig.hintLimit !== "unlimited") {
      setHintsUsed((currentHints) => currentHints + 1);
    }
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const hintsLeftText =
    activeRunConfig.hintLimit === "unlimited"
      ? "∞"
      : `${Math.max(activeRunConfig.hintLimit - hintsUsed, 0)}`;

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.14),transparent_28%)]" />

      <div className="absolute top-0 left-0 right-0 z-30 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
        <div className="rounded-[1.75rem] border border-cyan-400/18 bg-slate-950/70 p-3 shadow-[0_0_40px_rgba(56,189,248,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={avatar.image}
                alt={avatar.label}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-2xl border border-cyan-300/40 object-cover shadow-[0_0_20px_rgba(34,211,238,0.35)]"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/80">
                  {activeRunConfig.label}
                </div>
                <div className="truncate text-sm font-black text-white sm:text-base">
                  {playerName}
                </div>
                <div className="truncate text-xs text-slate-400 sm:text-sm">{runTitle}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              <HudPill label="Score" value={score} accent="cyan" />
              <HudPill
                label="Question"
                value={`${questionsAsked}/${totalQuestions}`}
                accent="amber"
              />
              <HudPill label="Combo" value={bestStreak} accent="pink" />
              <HudPill label="Bonus XP" value={comboBonusXp} accent="emerald" />
              <HudPill label="Hints" value={hintsLeftText} accent="violet" />
              <HudPill label="Time" value={`${minutes}:${seconds}`} accent="pink" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((heartIndex) => (
                  <span
                    key={heartIndex}
                    className={`text-lg transition-all sm:text-2xl ${
                      heartIndex < lives ? "" : "grayscale opacity-30"
                    }`}
                  >
                    {HEART_SYMBOL}
                  </span>
                ))}
              </div>

              <div className="flex gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
                >
                  {muted ? MUTE_ICON : SOUND_ICON}
                </button>
                <button
                  type="button"
                  onClick={togglePause}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
                >
                  {phase === "paused" ? PLAY_ICON : PAUSE_ICON}
                </button>
                <button
                  type="button"
                  onClick={onQuit}
                  className="rounded-xl border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-100 transition hover:bg-rose-500/25 sm:text-sm"
                >
                  Quit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`absolute inset-0 bg-track ${
          phase === "playing" ? "animate-slide-bg" : ""
        } ${shake ? "animate-shake" : ""}`}
      >
        {[1, 2, 3].map((dividerIndex) => (
          <div
            key={dividerIndex}
            className="lane-divider absolute top-0 bottom-0 w-1 opacity-60"
            style={{ left: `${(dividerIndex / LANES) * 100}%` }}
          />
        ))}

        {objects.map((object) => (
          <div
            key={object.id}
            className="pointer-events-none absolute z-10 -translate-x-1/2 animate-float"
            style={{
              left: `${(object.lane + 0.5) * (100 / LANES)}%`,
              top: object.y,
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-cyan-300/70 bg-slate-950/90 text-2xl font-black text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.35)] md:h-16 md:w-16 md:text-4xl">
              {PICKUP_SYMBOL}
            </div>
          </div>
        ))}

        <div
          className="pointer-events-none absolute bottom-28 z-20 -translate-x-1/2 transition-[left] duration-200 ease-out sm:bottom-28"
          style={{ left: `${(lane + 0.5) * (100 / LANES)}%` }}
        >
          <img
            src={avatar.image}
            alt={avatar.label}
            width={96}
            height={96}
            className={`h-16 w-16 rounded-[1.5rem] border-4 border-cyan-300/60 object-cover drop-shadow-[0_0_28px_rgba(34,211,238,0.45)] sm:h-24 sm:w-24 ${
              phase === "playing" ? "animate-run" : ""
            }`}
          />
        </div>

        {popups.map((popup) => (
          <div
            key={popup.id}
            className="pointer-events-none absolute bottom-44 left-1/2 z-30 -translate-x-1/2 text-xl font-black animate-rise sm:text-4xl"
            style={{ color: popup.color, textShadow: `0 0 20px ${popup.color}` }}
          >
            {popup.text}
          </div>
        ))}

        {coinShower && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            {Array.from({ length: 18 }, (_, index) => (
              <span
                key={index}
                className="absolute top-20 h-3 w-3 animate-coin-shower rounded-full bg-[linear-gradient(135deg,#facc15_0%,#fb7185_100%)] opacity-90"
                style={{
                  left: `${8 + index * 5}%`,
                  animationDelay: `${index * 40}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute right-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 z-20 flex justify-between px-3 sm:px-6">
        <button
          type="button"
          onClick={() => moveLane(-1)}
          className="pointer-events-auto h-14 w-14 rounded-full border-2 border-cyan-300/50 bg-cyan-400/80 text-2xl font-bold text-slate-950 shadow-lg backdrop-blur active:scale-90 sm:h-16 sm:w-16 sm:text-3xl"
          aria-label="Move left"
        >
          {LEFT_ARROW}
        </button>
        <button
          type="button"
          onClick={() => moveLane(1)}
          className="pointer-events-auto h-14 w-14 rounded-full border-2 border-cyan-300/50 bg-cyan-400/80 text-2xl font-bold text-slate-950 shadow-lg backdrop-blur active:scale-90 sm:h-16 sm:w-16 sm:text-3xl"
          aria-label="Move right"
        >
          {RIGHT_ARROW}
        </button>
      </div>

      {phase === "countdown" && <Countdown onDone={() => setPhase("playing")} />}

      {phase === "paused" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/82 backdrop-blur-sm">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/85 px-8 py-10 text-center shadow-[0_0_50px_rgba(34,211,238,0.12)]">
            <div className="text-4xl font-black text-glow-yellow sm:text-6xl">PAUSED</div>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Catch your breath, then jump back into the run.
            </p>
            <button
              type="button"
              onClick={() => setPhase("playing")}
              className="mt-6 rounded-xl bg-cyan-400 px-8 py-3 font-bold text-slate-950 transition hover:scale-[1.02]"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {phase === "question" && currentQ && questions[currentQ.qIndex] && (
        <QuestionPopup
          question={questions[currentQ.qIndex]}
          index={questionsAsked}
          total={totalQuestions}
          modeLabel={activeRunConfig.label}
          questionTimerSeconds={activeRunConfig.timerSeconds}
          hintLimit={activeRunConfig.hintLimit}
          hintsUsed={hintsUsed}
          onUseHint={useHint}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}

function HudPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "cyan" | "amber" | "pink" | "emerald" | "violet";
}) {
  const tone =
    accent === "cyan"
      ? "text-cyan-200 border-cyan-300/20 bg-cyan-400/10"
      : accent === "amber"
        ? "text-amber-200 border-amber-300/20 bg-amber-400/10"
        : accent === "emerald"
          ? "text-emerald-200 border-emerald-300/20 bg-emerald-400/10"
          : accent === "violet"
            ? "text-violet-200 border-violet-300/20 bg-violet-400/10"
            : "text-pink-200 border-pink-300/20 bg-pink-400/10";

  return (
    <div className={`rounded-[1.1rem] border px-3 py-2 text-center ${tone}`}>
      <div className="text-[9px] font-black uppercase tracking-[0.22em]">{label}</div>
      <div className="mt-1 text-sm font-black sm:text-base">{value}</div>
    </div>
  );
}
