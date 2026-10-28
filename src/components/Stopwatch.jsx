import { useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw } from "lucide-react";

import SectionCard from "./SectionCard.jsx";
import { formatDuration } from "../lib/format.js";

export default function Stopwatch({ theme }) {
  const dark = theme === "dark";

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState([]);

  const accumulatedRef = useRef(0);
  const startedAtRef = useRef(0);
  const [elapsedTime, centiseconds] = formatDuration(elapsed, true).split(".");

  useEffect(() => {
    if (!running) return undefined;

    const tick = () => {
      setElapsed(
        accumulatedRef.current + (performance.now() - startedAtRef.current),
      );
    };

    const id = window.setInterval(tick, 25);

    tick();

    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    if (running) return;

    startedAtRef.current = performance.now();
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;

    const total =
      accumulatedRef.current + (performance.now() - startedAtRef.current);

    accumulatedRef.current = total;
    setElapsed(total);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);

    accumulatedRef.current = 0;
    startedAtRef.current = 0;
  };

  const addLap = () => {
    const total = running
      ? accumulatedRef.current + (performance.now() - startedAtRef.current)
      : elapsed;

    const previous = laps[0]?.totalMs || 0;

    setLaps((current) => [
      {
        number: current.length + 1,
        totalMs: total,
        lapMs: total - previous,
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-5">
      <SectionCard
        theme={theme}
      >
        <div className="flex flex-col items-center px-1 py-10 text-center sm:py-14">
          <div
            className={`clock-digit flex items-baseline justify-center gap-1 whitespace-nowrap font-medium leading-none tracking-tight tabular-nums sm:gap-2 ${
              dark ? "text-white" : "text-neutral-950"
            }`}
          >
            <span className="text-[clamp(2.5rem,9vw,6.5rem)]">{elapsedTime}</span>
            <span className="text-[clamp(1.25rem,4.2vw,3rem)]">.{centiseconds}</span>
          </div>

          <p
            className={`mt-4 text-xs font-semibold uppercase tracking-[0.25em] ${
              running
                ? "text-emerald-500"
                : dark
                  ? "text-neutral-500"
                  : "text-neutral-500"
            }`}
          >
            {running ? "Running" : elapsed > 0 ? "Paused" : "Ready"}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {running ? (
              <button
                type="button"
                onClick={pause}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold ${
                  dark
                    ? "border-neutral-700 text-white hover:bg-neutral-900"
                    : "border-neutral-200 text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                <Pause size={17} />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
              >
                <Play size={17} fill="currentColor" />
                {elapsed > 0 ? "Resume" : "Start"}
              </button>
            )}

            <button
              type="button"
              disabled={elapsed <= 0}
              onClick={addLap}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                dark
                  ? "border-neutral-800 text-neutral-300 hover:bg-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Flag size={16} />
              Lap
            </button>

            <button
              type="button"
              onClick={reset}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                dark
                  ? "border-neutral-800 text-neutral-300 hover:bg-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </SectionCard>

      {laps.length > 0 && <SectionCard
        title="Lap history"
        icon={Flag}
        theme={theme}
        action={
          laps.length > 0 ? (
            <button
              type="button"
              onClick={() => setLaps([])}
              className={`text-xs font-semibold ${
                dark
                  ? "text-neutral-500 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Clear laps
            </button>
          ) : null
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-800/70">
            <div
              className={`grid grid-cols-3 px-4 py-3 text-[10px] font-bold uppercase tracking-wider ${
                dark
                  ? "bg-neutral-900 text-neutral-500"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <span>Lap</span>
              <span className="text-right">Split</span>
              <span className="text-right">Total</span>
            </div>

            {laps.map((lap, index) => (
              <div
                key={lap.number}
                className={`grid grid-cols-3 border-t px-4 py-3 text-sm tabular-nums ${
                  dark
                    ? "border-neutral-800 text-neutral-300"
                    : "border-neutral-200 text-neutral-700"
                } ${
                  index === 0 ? (dark ? "bg-amber-950/20" : "bg-amber-50") : ""
                }`}
              >
                <span>Lap {lap.number}</span>
                <span className="text-right">
                  {formatDuration(lap.lapMs, true)}
                </span>
                <span className="text-right">
                  {formatDuration(lap.totalMs, true)}
                </span>
              </div>
            ))}
        </div>
      </SectionCard>}
    </div>
  );
}
