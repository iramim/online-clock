import { useEffect, useRef, useState } from "react";
import { Pencil, Play, RotateCcw, Square } from "lucide-react";

import SectionCard from "./SectionCard.jsx";
import TimerEditModal from "./TimerEditModal.jsx";
import { formatDuration } from "../lib/format.js";
import {
  DEFAULT_ALARM_SOUND,
  startAlarmSound,
  unlockAudio,
} from "../lib/sound.js";

const PRESETS = [
  { label: "1 minute", seconds: 60 },
  { label: "5 minutes", seconds: 300 },
  { label: "10 minutes", seconds: 600 },
  { label: "25 minutes", seconds: 1500 },
  { label: "30 minutes", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
];

function clampNumber(value, max) {
  if (value === "") return "";

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return "0";

  return String(Math.min(max, Math.max(0, parsed)));
}

export default function CountdownTimer({ theme }) {
  const dark = theme === "dark";

  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");

  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [timerSound, setTimerSound] = useState(DEFAULT_ALARM_SOUND);
  const [repeatSound, setRepeatSound] = useState(true);

  const deadlineRef = useRef(0);
  const totalDurationRef = useRef(0);
  const stopTimerSoundRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;

    const tick = () => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());

      setRemainingMs(remaining);

      if (remaining <= 0) {
        setRunning(false);
        setFinished(true);

        stopTimerSoundRef.current?.();
        stopTimerSoundRef.current = startAlarmSound({
          sound: timerSound,
          repeat: repeatSound,
        });
      }
    };

    const id = window.setInterval(tick, 100);

    tick();

    return () => window.clearInterval(id);
  }, [running, timerSound, repeatSound]);

  useEffect(
    () => () => {
      stopTimerSoundRef.current?.();
    },
    [],
  );

  const chosenDuration =
    (Math.max(0, Number(hours) || 0) * 3600 +
      Math.max(0, Number(minutes) || 0) * 60 +
      Math.max(0, Number(seconds) || 0)) *
    1000;

  const totalMs =
    running || remainingMs > 0
      ? // eslint-disable-next-line react-hooks/refs
        totalDurationRef.current
      : chosenDuration;

  const progress =
    totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;

  const start = (durationOverride) => {
    unlockAudio();
    stopTimerSoundRef.current?.();
    stopTimerSoundRef.current = null;

    const duration =
      durationOverride ?? (remainingMs > 0 ? remainingMs : chosenDuration);

    if (duration <= 0) return;

    totalDurationRef.current =
      durationOverride || remainingMs <= 0 ? duration : totalDurationRef.current;

    deadlineRef.current = Date.now() + duration;

    setRemainingMs(duration);
    setFinished(false);
    setRunning(true);
  };

  const reset = () => {
    stopTimerSoundRef.current?.();
    stopTimerSoundRef.current = null;
    setRunning(false);
    setFinished(false);
    setRemainingMs(chosenDuration);
    totalDurationRef.current = chosenDuration;
  };

  const stop = () => {
    stopTimerSoundRef.current?.();
    stopTimerSoundRef.current = null;

    if (!running) {
      setFinished(false);
      return;
    }

    setRemainingMs(Math.max(0, deadlineRef.current - Date.now()));
    setRunning(false);
    setFinished(false);
  };

  const editTimer = () => {
    setShowEditor(true);
  };

  const saveAndStartTimer = (nextTimer) => {
    stopTimerSoundRef.current?.();
    stopTimerSoundRef.current = null;
    setHours(nextTimer.hours);
    setMinutes(nextTimer.minutes);
    setSeconds(nextTimer.seconds);
    setTimerSound(nextTimer.sound);
    setRepeatSound(nextTimer.repeatSound);
    setRemainingMs(0);
    totalDurationRef.current = 0;
    start(nextTimer.durationMs);
  };

  const applyPreset = (presetSeconds) => {
    setRunning(false);
    setFinished(false);

    const newHours = Math.floor(presetSeconds / 3600);
    const newMinutes = Math.floor((presetSeconds % 3600) / 60);
    const newSeconds = presetSeconds % 60;

    setHours(String(newHours));
    setMinutes(String(newMinutes));
    setSeconds(String(newSeconds));

    setRemainingMs(0);
    totalDurationRef.current = 0;
  };

  const inputClass = `w-full rounded-xl border px-2 py-3 text-center text-xl font-semibold tabular-nums outline-none focus:border-amber-500 ${
    dark
      ? "border-neutral-800 bg-neutral-900 text-white"
      : "border-neutral-200 bg-neutral-50 text-neutral-900"
  }`;

  return (
    <div className="space-y-5">
      <SectionCard
        theme={theme}
      >
        <div className="grid gap-8 py-2 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] lg:items-center">
          <div className="flex flex-col items-center">
            <div className="relative flex h-64 w-64 shrink-0 items-center justify-center sm:h-72 sm:w-72">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 280 280"
                role="img"
                aria-label={`${Math.round(progress * 100)} percent of timer remains`}
              >
                <circle
                  cx="140"
                  cy="140"
                  r="124"
                  fill="none"
                  stroke={dark ? "#262626" : "#e5e5e5"}
                  strokeWidth="7"
                />

                <circle
                  cx="140"
                  cy="140"
                  r="124"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 124}`}
                  strokeDashoffset={`${2 * Math.PI * 124 * (1 - progress)}`}
                  className="transition-[stroke-dashoffset] duration-100"
                />
              </svg>

              <div className="relative text-center">
                <p
                  className={`font-mono whitespace-nowrap text-[clamp(1.6rem,7.5vw,2.4rem)] font-semibold leading-none tabular-nums ${
                    finished
                      ? "text-amber-500"
                      : dark
                        ? "text-white"
                        : "text-neutral-900"
                  }`}
                >
                  {formatDuration(remainingMs)}
                </p>

                <p
                  className={`mt-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                    finished
                      ? "text-amber-500"
                      : dark
                        ? "text-neutral-500"
                        : "text-neutral-500"
                  }`}
                >
                  {finished
                    ? "Time is up"
                    : running
                      ? "Counting down"
                      : remainingMs > 0
                        ? "Paused"
                        : "Ready"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={editTimer}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  dark
                    ? "border-neutral-800 text-neutral-300 hover:bg-neutral-900"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Pencil size={16} />
                Edit timer
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

              <button
                type="button"
                onClick={() => (finished || running ? stop() : start())}
                disabled={!finished && !running && chosenDuration <= 0 && remainingMs <= 0}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  running || finished
                    ? "bg-rose-500 text-white hover:bg-rose-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {finished ? (
                  <>
                    <Square size={15} fill="currentColor" />
                    Dismiss alarm
                  </>
                ) : running ? (
                  <>
                    <Square size={15} fill="currentColor" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={17} fill="currentColor" />
                    Start
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p
                className={`mb-3 text-sm font-semibold ${
                  dark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Time
              </p>

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <input
                    aria-label="Hours"
                    disabled={running || remainingMs > 0}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(event) => {
                      setHours(clampNumber(event.target.value, 99));
                      setFinished(false);
                    }}
                    className={`${inputClass} disabled:opacity-50`}
                  />
                  <span className="mt-2 block text-center text-xs text-neutral-500">
                    H
                  </span>
                </label>

                <label className="block">
                  <input
                    aria-label="Minutes"
                    disabled={running || remainingMs > 0}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(event) => {
                      setMinutes(clampNumber(event.target.value, 59));
                      setFinished(false);
                    }}
                    className={`${inputClass} disabled:opacity-50`}
                  />
                  <span className="mt-2 block text-center text-xs text-neutral-500">
                    M
                  </span>
                </label>

                <label className="block">
                  <input
                    aria-label="Seconds"
                    disabled={running || remainingMs > 0}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(event) => {
                      setSeconds(clampNumber(event.target.value, 59));
                      setFinished(false);
                    }}
                    className={`${inputClass} disabled:opacity-50`}
                  />
                  <span className="mt-2 block text-center text-xs text-neutral-500">
                    S
                  </span>
                </label>
              </div>
            </div>

            <div>
              <p
                className={`mb-3 text-sm font-semibold ${
                  dark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Presets
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    type="button"
                    disabled={running}
                    onClick={() => applyPreset(preset.seconds)}
                    className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition disabled:opacity-40 ${
                      dark
                        ? "border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-amber-500/60 hover:text-amber-400"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-amber-400 hover:text-amber-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </SectionCard>

      {showEditor && (
        <TimerEditModal
          theme={theme}
          initialHours={hours}
          initialMinutes={minutes}
          initialSeconds={seconds}
          initialSound={timerSound}
          initialRepeatSound={repeatSound}
          onClose={() => setShowEditor(false)}
          onStart={saveAndStartTimer}
        />
      )}
    </div>
  );
}
