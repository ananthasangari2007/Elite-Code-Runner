import { useEffect, useState } from "react";
import { sfx } from "@/game/audio";

type CountdownProps = {
  onDone: () => void;
};

export function Countdown({ onDone }: CountdownProps) {
  const [n, setN] = useState(3);

  useEffect(() => {
    sfx.countdown();

    let doneTimeout: number | undefined;
    const intervalId = window.setInterval(() => {
      setN((value) => {
        if (value <= 1) {
          window.clearInterval(intervalId);
          sfx.go();
          doneTimeout = window.setTimeout(onDone, 700);
          return 0;
        }

        sfx.countdown();
        return value - 1;
      });
    }, 800);

    return () => {
      window.clearInterval(intervalId);
      if (doneTimeout !== undefined) {
        window.clearTimeout(doneTimeout);
      }
    };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div
        key={n}
        className="text-[4.5rem] font-black text-glow-pink animate-pop sm:text-[8rem] md:text-[10rem]"
      >
        {n === 0 ? "GO!" : n}
      </div>
    </div>
  );
}
