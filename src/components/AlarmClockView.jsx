import { useState } from "react";
import { AlarmClock, Check, Copy, Link2, Plus, Zap } from "lucide-react";

import DigitalClock from "./DigitalClock.jsx";
import SectionCard from "./SectionCard.jsx";
import AlarmList from "./AlarmList.jsx";

import { QUICK_ALARMS } from "../data/timezones.js";
import { formatAlarmTime } from "../lib/format.js";

export default function AlarmClockView({
  now,
  theme,
  use24Hour,
  alarms,
  onOpenCreate,
  onQuickAdd,
  onToggleAlarm,
  onDeleteAlarm,
  clockSettings,
}) {
  const dark = theme === "dark";

  const [showAllQuickTimes, setShowAllQuickTimes] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const quickTimes = showAllQuickTimes
    ? QUICK_ALARMS
    : QUICK_ALARMS.slice(0, 16);

  const alarmTimes = new Set(alarms.map((alarm) => alarm.time));

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText =
    "Set an alarm online in seconds. Choose a quick time or create a custom alarm and keep this page open for your alert.";

  const copyShareLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopyStatus("Link copied");
        return;
      }

      window.prompt("Copy this alarm clock link:", shareUrl);
    } catch {
      window.prompt("Copy this alarm clock link:", shareUrl);
    }
  };

  const shareOnX = () => {
    const intentUrl = new URL("https://x.com/intent/post");
    intentUrl.searchParams.set("text", shareText);
    intentUrl.searchParams.set("url", shareUrl);
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-5">
      <DigitalClock
        now={now}
        use24Hour={use24Hour}
        showDate={clockSettings.showDate}
        showSeconds={clockSettings.showSeconds}
        digitalFont={clockSettings.digitalFont}
        color={clockSettings.color}
        onSetAlarm={onOpenCreate}
        theme={theme}
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Quick"
          icon={Zap}
          theme={theme}
          action={
            <button
              onClick={onOpenCreate}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-amber-400"
            >
              <Plus size={14} />
              Custom
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {quickTimes.map((time) => {
              const exists = alarmTimes.has(time);

              return (
                <button
                  type="button"
                  key={time}
                  disabled={exists}
                  onClick={() => onQuickAdd(time)}
                  className={`rounded-lg px-2 py-3 text-xs font-semibold tabular-nums transition sm:text-sm ${
                    exists
                      ? dark
                        ? "cursor-not-allowed border border-neutral-800 bg-neutral-900/40 text-neutral-700"
                        : "cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "bg-sky-600 text-white hover:bg-sky-500"
                  }`}
                >
                  {formatAlarmTime(time, use24Hour)}
                  {exists && <span className="ml-1 text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowAllQuickTimes((shown) => !shown)}
            aria-expanded={showAllQuickTimes}
            className={`mt-3 inline-flex min-w-12 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
              dark
                ? "text-amber-400 hover:bg-neutral-900 hover:text-amber-300 focus-visible:ring-offset-neutral-950"
                : "text-amber-700 hover:bg-amber-50 hover:text-amber-600 focus-visible:ring-offset-white"
            }`}
          >
            {showAllQuickTimes ? "Less" : "More"}
          </button>
        </SectionCard>

        <SectionCard
          title="Alarms"
          icon={AlarmClock}
          theme={theme}
          action={
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                dark
                  ? "bg-neutral-900 text-neutral-400"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >{alarms.length}</span>
          }
        >
          <AlarmList
            alarms={alarms}
            onToggle={onToggleAlarm}
            onDelete={onDeleteAlarm}
            theme={theme}
            use24Hour={use24Hour}
          />
        </SectionCard>
      </div>

      <section
        aria-labelledby="alarm-help-title"
        className={`rounded-2xl border p-5 sm:p-6 ${
          dark
            ? "border-neutral-800 bg-neutral-950/90"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className={`border-b pb-4 ${dark ? "border-neutral-800" : "border-neutral-200"}`}>
          <h2 id="alarm-help-title" className="text-lg font-semibold sm:text-xl">
            How to use the online alarm clock
          </h2>
        </div>

        <div className={`mt-4 space-y-3 text-sm leading-6 ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
          <p>
            Pick a quick time or select <strong className={dark ? "text-white" : "text-neutral-900"}>Custom</strong> to set the exact hour, minute, sound, and alarm label.
          </p>
          <p>
            Keep this tab open and your device awake. Your alarm will ring at the chosen time, even if you are offline after the page has loaded.
          </p>
          <p>
            Use the link below to return to this alarm clock later, or share it on X with the ready-made message.
          </p>
        </div>

        <div className={`mt-5 rounded-xl border p-3 sm:flex sm:items-center sm:gap-3 ${dark ? "border-neutral-800 bg-neutral-900/60" : "border-neutral-200 bg-neutral-50"}`}>
          <div className="min-w-0 flex-1">
            <p className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-neutral-500" : "text-neutral-500"}`}>
              Alarm clock link
            </p>
            <a
              href={shareUrl}
              className={`block truncate text-sm underline-offset-4 hover:underline ${dark ? "text-sky-400" : "text-sky-700"}`}
              title={shareUrl}
            >
              {shareUrl}
            </a>
          </div>

          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
            <button
              type="button"
              onClick={copyShareLink}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                dark
                  ? "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {copyStatus ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              {copyStatus || "Copy link"}
            </button>
            <button
              type="button"
              onClick={shareOnX}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <span className="text-sm leading-none" aria-hidden="true">𝕏</span>
              Share on X
            </button>
          </div>
        </div>

        <div className={`mt-3 flex items-center gap-2 text-xs ${dark ? "text-neutral-500" : "text-neutral-500"}`}>
          <Link2 size={14} />
          The X post includes this page link and the alarm-clock instructions.
        </div>
      </section>

      <p
        className={`hidden items-start gap-2 rounded-xl px-1 text-xs leading-5 ${
          dark ? "text-neutral-500" : "text-neutral-500"
        }`}
      >
        <span className="mt-0.5 text-amber-500">ⓘ</span>
        Browser alarms run while this page is open. Keep your device awake,
        allow sound, and avoid closing this tab for reliable alerts.
      </p>
    </div>
  );
}
