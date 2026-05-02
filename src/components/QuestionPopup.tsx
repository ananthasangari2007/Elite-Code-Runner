import { useEffect, useState } from "react";
import type { Question } from "@/game/questions";

type Props = {
  question: Question;
  index: number;
  total: number;
  modeLabel: string;
  questionTimerSeconds: number | null;
  hintLimit: number | "unlimited" | 0;
  hintsUsed: number;
  onUseHint: () => void;
  onAnswer: (idx: number | null) => void;
};

export function QuestionPopup({
  question,
  index,
  total,
  modeLabel,
  questionTimerSeconds,
  hintLimit,
  hintsUsed,
  onUseHint,
  onAnswer,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(questionTimerSeconds);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSecondsLeft(questionTimerSeconds);
    setShowHint(false);
  }, [question, questionTimerSeconds]);

  useEffect(() => {
    if (typeof secondsLeft !== "number") return;
    if (secondsLeft <= 0) {
      onAnswer(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((currentSeconds) =>
        typeof currentSeconds === "number" ? currentSeconds - 1 : currentSeconds,
      );
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [onAnswer, secondsLeft]);

  const hintAvailable =
    hintLimit === "unlimited" ? true : typeof hintLimit === "number" && hintsUsed < hintLimit;
  const hintLabel =
    hintLimit === "unlimited"
      ? "Hints available"
      : `${Math.max(hintLimit - hintsUsed, 0)} hint${hintLimit - hintsUsed === 1 ? "" : "s"} left`;
  const timerPercent =
    typeof questionTimerSeconds === "number" && typeof secondsLeft === "number"
      ? (secondsLeft / questionTimerSeconds) * 100
      : 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),rgba(3,7,18,0.92)] p-3 backdrop-blur-xl sm:p-5">
      <div className="my-auto w-full max-w-3xl rounded-[2rem] border border-cyan-400/25 bg-slate-950/88 p-4 shadow-[0_0_70px_rgba(56,189,248,0.14)] animate-in fade-in zoom-in-95 duration-200 sm:p-6">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] sm:text-xs">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
              {question.category}
            </span>
            <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-200">
              {modeLabel}
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              Q {index + 1}/{total}
            </span>
          </div>

          <div className="min-w-[180px]">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
              <span>{questionTimerSeconds ? "Question Timer" : "Chill Mode"}</span>
              <span>{questionTimerSeconds ? `${secondsLeft}s` : "No Timer"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#a855f7_50%,#ec4899_100%)] transition-[width] duration-1000"
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <h2 className="text-lg font-black leading-snug text-white sm:text-2xl">{question.q}</h2>

            {question.code && (
              <pre className="mt-4 overflow-x-auto rounded-[1.2rem] border border-emerald-400/20 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed whitespace-pre text-emerald-200 sm:text-sm">
                {question.code}
              </pre>
            )}

            <div className="mt-5 grid gap-2.5">
              {question.options.map((option, optionIndex) => {
                const isCodeOption = option.includes("\n");

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => onAnswer(optionIndex)}
                    className="group rounded-[1.2rem] border border-white/10 bg-slate-900/70 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/8 active:scale-[0.99]"
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-sm font-black text-cyan-200">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span
                        className={
                          isCodeOption
                            ? "whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-100 sm:text-sm"
                            : "whitespace-pre-wrap text-sm leading-relaxed text-slate-100 sm:text-base"
                        }
                      >
                        {option}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/8 p-4">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                Hint System
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{hintLabel}</p>
              <button
                type="button"
                onClick={() => {
                  if (!showHint) onUseHint();
                  setShowHint(true);
                }}
                disabled={!showHint && !hintAvailable}
                className="mt-4 w-full rounded-xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {showHint ? "Hint Opened" : "Show Hint"}
              </button>

              <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-300">
                {showHint
                  ? question.hint
                  : "Use a hint wisely to reveal a guided clue for this question."}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-fuchsia-400/20 bg-fuchsia-400/8 p-4">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">
                Scoring Intel
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>Correct answer: `+5 score`</p>
                <p>Combo x3: `+10 XP`</p>
                <p>Combo x5: `+25 XP` + coin shower</p>
                <p>Speed and accuracy help your final run stats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
