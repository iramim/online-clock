import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Share2,
} from "lucide-react";

import { formatClock, formatDate } from "../lib/format.js";

function ClockControl({ label, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-700/80 bg-black/70 text-neutral-300 transition-all duration-200 ease-out hover:scale-110 hover:border-amber-500 hover:bg-amber-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 translate-y-1 whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium tracking-normal text-white opacity-0 shadow-xl shadow-black/40 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        {label}
        <span className="absolute -top-1 right-3 h-2 w-2 rotate-45 border-l border-t border-neutral-700 bg-neutral-900" />
      </span>
    </button>
  );
}

const CLOCK_COLOR_CLASSES = {
  white: "text-white",
  amber: "text-amber-500",
  red: "text-red-500",
  green: "text-emerald-500",
  blue: "text-blue-500",
};

export default function DigitalClock({
  now,
  onSetAlarm,
  theme,
  use24Hour = false,
  showDate = true,
  showSeconds = true,
  digitalFont = true,
  color = "amber",
}) {
  const dark = theme === "dark";
  const panelRef = useRef(null);
  const [fontScale, setFontScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const { time, meridiem } = formatClock(now, use24Hour, showSeconds);
  const clockColor = CLOCK_COLOR_CLASSES[color] || CLOCK_COLOR_CLASSES.amber;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === panelRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const decreaseFont = () => {
    setFontScale((current) =>
      Math.max(0.6, Number((current - 0.1).toFixed(1))),
    );
  };

  const increaseFont = () => {
    setFontScale((current) =>
      Math.min(1.3, Number((current + 0.1).toFixed(1))),
    );
  };

  const shareClock = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Online Clock",
          text: "Check out this online clock.",
          url,
        });
        setShareStatus("Share menu opened");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied!");
        return;
      }

      window.prompt("Copy your clock link:", url);
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied!");
      } catch {
        window.prompt("Copy your clock link:", url);
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await panelRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setShareStatus("Fullscreen could not be opened.");
    }
  };

  return (
    <section
      ref={panelRef}
      className={`digital-clock-panel relative overflow-hidden border px-4 py-14 text-center sm:px-8 sm:py-12 ${
        dark
          ? "border-neutral-800 bg-black"
          : "border-neutral-200 bg-neutral-950 text-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(245,158,11,0.07),transparent_58%)]" />

      <div className="digital-clock-controls absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
        <ClockControl label="Share" onClick={shareClock}>
          <Share2 size={18} />
        </ClockControl>
        <ClockControl
          label="Decrease font size"
          onClick={decreaseFont}
          disabled={fontScale <= 0.6}
        >
          <Minus size={18} />
        </ClockControl>
        <ClockControl
          label="Increase font size"
          onClick={increaseFont}
          disabled={fontScale >= 1.3}
        >
          <Plus size={18} />
        </ClockControl>
        <ClockControl
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </ClockControl>
      </div>

      {shareStatus && (
        <div
          role="status"
          className="absolute right-4 top-14 z-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg sm:right-5 sm:top-16"
        >
          {shareStatus}
        </div>
      )}

      <div className="digital-clock-content relative z-1">
        <div
          className={`${digitalFont ? "clock-digit" : "font-sans"} mt-8 flex min-h-28 items-baseline justify-center gap-1.5 py-3 sm:mt-4 sm:min-h-36 sm:gap-3`}
          style={{
            fontSize: `clamp(${2.65 * fontScale}rem, ${7.3 * fontScale}vw, ${6.2 * fontScale}rem)`,
          }}
          aria-label={`Current time ${time} ${meridiem}`}
        >
          <span
            className={`whitespace-nowrap font-semibold leading-none tabular-nums ${clockColor} ${digitalFont ? "clock-digit-time [text-shadow:0_0_0.8px_currentColor]" : ""}`}
            style={digitalFont ? { transform: "skewX(-2deg) scaleY(1.12)" } : undefined}
          >
            {time}
          </span>
          {meridiem && (
            <span className={`clock-digit-period font-normal leading-none ${clockColor}`}>
              {meridiem}
            </span>
          )}
        </div>

        {showDate && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.16em] text-neutral-500 sm:text-sm">
            <CalendarDays size={15} />
            {formatDate(now)}
          </div>
        )}

        <button
          type="button"
          onClick={onSetAlarm}
          className="mt-7 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Set Alarm
        </button>
      </div>
    </section>
  );
}
