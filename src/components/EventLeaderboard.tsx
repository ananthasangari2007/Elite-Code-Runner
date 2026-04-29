import { AVATARS } from "@/game/avatars";
import type { PlayerSession } from "@/game/store";

type Props = {
  sessions: PlayerSession[];
  onBack?: () => void;
};

const podiumLabels = ["Champion", "Runner-Up", "Bronze"];
const podiumHeights = ["h-44 sm:h-64", "h-36 sm:h-52", "h-32 sm:h-44"];

function formatTime(timeMs: number) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function EventLeaderboard({ sessions, onBack }: Props) {
  const topThree = [
    { session: sessions[1], standing: 2, styleIndex: 1 },
    { session: sessions[0], standing: 1, styleIndex: 0 },
    { session: sessions[2], standing: 3, styleIndex: 2 },
  ].filter((entry) => entry.session) as Array<{
    session: PlayerSession;
    standing: number;
    styleIndex: number;
  }>;
  const remaining = sessions.slice(3);

  return (
    <div className="rounded-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_top,rgba(255,61,172,0.18),transparent_35%),linear-gradient(180deg,rgba(28,15,48,0.98),rgba(18,10,34,0.98))] p-4 shadow-[0_0_60px_rgba(61,233,255,0.08)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="rounded-full border border-primary/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-primary hover:bg-primary/10"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        <div className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
          Hall Of Fame
        </div>
      </div>

      <h2 className="mt-4 text-center text-3xl font-black tracking-[0.16em] text-glow-pink sm:text-5xl">
        LEADERBOARD
      </h2>
      <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Ranked by score, fastest time, then accuracy
      </p>

      {sessions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-primary/25 bg-background/25 p-8 text-center text-muted-foreground">
          No ranked players yet.
        </div>
      ) : (
        <>
          <div className="mt-8 grid items-end gap-4 md:grid-cols-3">
            {topThree.map(({ session, standing, styleIndex }) => {
              const avatar = AVATARS[session.avatarId];
              return (
                <div
                  key={session.id}
                  className={`rounded-[1.75rem] border border-primary/25 bg-card/70 p-4 text-center shadow-[0_0_35px_rgba(255,61,172,0.18)] ${styleIndex === 0 ? "md:order-2" : styleIndex === 1 ? "md:order-1" : "md:order-3"}`}
                >
                  <div className="mx-auto flex w-max items-center rounded-full border border-primary/25 bg-background/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    #{standing}
                  </div>
                  <img
                    src={avatar.image}
                    alt={avatar.label}
                    width={112}
                    height={112}
                    className="mx-auto mt-4 h-20 w-20 rounded-3xl border-2 border-primary object-cover shadow-[0_0_24px_rgba(61,233,255,0.25)] sm:h-24 sm:w-24"
                  />
                  <div className="mt-3 truncate text-lg font-bold">{session.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {session.correctAnswers}/{Math.max(session.answeredCount, 1)} correct |{" "}
                    {session.accuracy}%
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Time {formatTime(session.timeMs)}
                  </div>
                  <div className="mt-3 text-4xl font-black text-glow-cyan">{session.score}</div>
                  <div
                    className={`mx-auto mt-4 flex w-full max-w-[220px] items-end justify-center rounded-t-[1.75rem] border border-primary/25 bg-gradient-to-b from-primary/25 to-accent/10 text-2xl font-black text-primary ${podiumHeights[styleIndex]}`}
                  >
                    <div className="pb-4">{podiumLabels[styleIndex]}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {remaining.length > 0 && (
            <div className="mt-8 space-y-3">
              {remaining.map((session, index) => {
                const avatar = AVATARS[session.avatarId];
                return (
                  <div
                    key={session.id}
                    className="grid grid-cols-[auto_auto_1fr] gap-3 rounded-2xl border border-primary/20 bg-card/70 px-4 py-3 sm:flex sm:items-center"
                  >
                    <div className="w-10 text-center text-xl font-black text-primary">
                      #{index + 4}
                    </div>
                    <img
                      src={avatar.image}
                      alt={avatar.label}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-2xl border border-primary/25 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold">{session.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.correctAnswers}/{Math.max(session.answeredCount, 1)} correct | Time{" "}
                        {formatTime(session.timeMs)} | {session.accuracy}% accuracy
                      </div>
                    </div>
                    <div className="col-span-3 border-t border-primary/10 pt-2 text-right sm:col-span-1 sm:border-t-0 sm:pt-0">
                      <div className="text-2xl font-black text-glow-pink">{session.score}</div>
                      <div className="text-xs text-muted-foreground">
                        Best streak {session.bestStreak}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
