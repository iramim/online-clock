import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Maximize2,
  Minimize2,
  Settings2,
  X,
} from "lucide-react";

import { formatClock, formatDate } from "../lib/format.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import "./DigitalClockPage.css";

const TEMPLATES = [
  {
    id: "digital",
    name: "Digital",
    preview: "seven-segment",
    background: "#070707",
    color: "#e5e5e5",
    glow: "rgba(255,255,255,.14)",
  },
  {
    id: "blue",
    name: "Digital-Blue",
    preview: "seven-segment",
    background: "#031018",
    color: "#38bdf8",
    glow: "rgba(56,189,248,.35)",
  },
  {
    id: "red",
    name: "Digital-Red",
    preview: "seven-segment",
    background: "#160807",
    color: "#f87171",
    glow: "rgba(248,113,113,.3)",
  },
  {
    id: "amber",
    name: "Digital-Amber",
    preview: "seven-segment",
    background: "#120e04",
    color: "#fbbf24",
    glow: "rgba(251,191,36,.3)",
  },
  {
    id: "orange",
    name: "Digital-Orange",
    preview: "seven-segment",
    background: "#ff7a00",
    color: "#1c1206",
    glow: "rgba(255,122,0,.24)",
  },
  {
    id: "pure-dark",
    name: "Pure Dark",
    preview: "serif",
    background: "#000000",
    color: "#f5f5f5",
    glow: "transparent",
  },
  {
    id: "dark",
    name: "Dark",
    preview: "sans",
    background: "#1c1c1c",
    color: "#fafafa",
    glow: "transparent",
  },
  {
    id: "light",
    name: "Light",
    preview: "sans",
    background: "#e7e5e4",
    color: "#171717",
    glow: "transparent",
  },
  {
    id: "classic",
    name: "Classic",
    preview: "mono",
    background: "#101010",
    color: "#f5f5f5",
    glow: "transparent",
  },
];

const DEFAULT_SETTINGS = {
  use24Hour: true,
  showSeconds: true,
  showDate: false,
  template: "digital",
};

function safeSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_SETTINGS;
  }

  return {
    use24Hour: typeof value.use24Hour === "boolean" ? value.use24Hour : true,
    showSeconds:
      typeof value.showSeconds === "boolean" ? value.showSeconds : true,
    showDate: typeof value.showDate === "boolean" ? value.showDate : false,
    template: TEMPLATES.some((template) => template.id === value.template)
      ? value.template
      : "digital",
  };
}

function Toggle({ label, checked, onChange, dark, accent }) {
  return (
    <div className="digital-page__setting-row">
      <div>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={checked ? { backgroundColor: accent } : undefined}
        className={`digital-page__switch relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          dark
            ? "focus-visible:ring-offset-neutral-950"
            : "focus-visible:ring-offset-white"
        } ${checked ? "bg-amber-500" : dark ? "bg-neutral-700" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  time,
  onSelect,
  dark,
  accent,
  accentInk,
}) {
  const previewClass =
    template.preview === "seven-segment"
      ? "clock-digit"
      : template.preview === "serif"
        ? "font-serif"
        : template.preview === "mono"
          ? "font-mono font-bold tracking-[0.08em]"
          : "font-sans font-medium";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`digital-page__template-card ${
        selected
          ? "digital-page__template-card--selected"
          : dark
            ? "border-neutral-800 hover:border-neutral-700"
            : "border-neutral-200 hover:border-neutral-300"
      }`}
      style={selected ? { "--digital-card-accent": accent } : undefined}
    >
      <span
        className={`digital-page__template-preview ${previewClass}`}
        style={{ backgroundColor: template.background, color: template.color }}
      >
        {time}
      </span>
      <span className="min-w-0 flex-1 text-left text-sm font-semibold">
        {template.name}
      </span>
      {selected && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: accent, color: accentInk }}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function SettingsPanel({
  now,
  settings,
  onChange,
  onClose,
  dark,
  compact = false,
  accent,
  accentInk,
}) {
  const previewTime = formatClock(now, true, true).time;

  return (
    <aside
      className={`digital-page__settings ${compact ? "digital-page__settings--drawer" : ""} ${
        dark
          ? "border-neutral-800 bg-neutral-950"
          : "border-neutral-200 bg-white"
      }`}
      aria-label="Digital clock settings"
    >
      <div className="flex items-center justify-between gap-4">
        <Settings2 size={18} aria-label="Settings" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close clock settings"
          className={`rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            dark ? "hover:bg-neutral-800" : "hover:bg-neutral-100"
          }`}
        >
          <X size={19} />
        </button>
      </div>

      <div
        className={`mt-5 border-y py-4 ${dark ? "border-neutral-800" : "border-neutral-200"}`}
      >
        <div className="digital-page__setting-row">
          <div>
            <p className="text-sm font-semibold">Format</p>
          </div>
          <div
            className={`flex rounded-lg p-1 ${dark ? "bg-neutral-900" : "bg-neutral-100"}`}
            role="group"
            aria-label="Time format"
          >
            {[true, false].map((use24Hour) => (
              <button
                key={String(use24Hour)}
                type="button"
                onClick={() => onChange({ use24Hour })}
                aria-pressed={settings.use24Hour === use24Hour}
                style={
                  settings.use24Hour === use24Hour
                    ? { backgroundColor: accent, color: accentInk }
                    : undefined
                }
                className={`digital-page__format-option rounded-md px-2.5 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 ${
                  settings.use24Hour === use24Hour
                    ? "shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {use24Hour ? "24H" : "12H"}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="Seconds"
          checked={settings.showSeconds}
          onChange={(showSeconds) => onChange({ showSeconds })}
          dark={dark}
          accent={accent}
        />
        <Toggle
          label="Date"
          checked={settings.showDate}
          onChange={(showDate) => onChange({ showDate })}
          dark={dark}
          accent={accent}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold">Template</p>
        <div className="mt-3 space-y-2.5">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              time={previewTime}
              selected={settings.template === template.id}
              onSelect={() => onChange({ template: template.id })}
              dark={dark}
              accent={accent}
              accentInk={accentInk}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function DigitalClockPage({
  now,
  theme,
  settingsOpen,
  onSettingsOpenChange,
}) {
  const dark = theme === "dark";
  const [storedSettings, setStoredSettings] = useLocalStorage(
    "online-clock-digital-settings-v2",
    DEFAULT_SETTINGS,
  );
  const settings = useMemo(
    () => safeSettings(storedSettings),
    [storedSettings],
  );
  const stageRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const selectedTemplate =
    TEMPLATES.find((template) => template.id === settings.template) ||
    TEMPLATES[0];
  const { time, meridiem } = formatClock(
    now,
    settings.use24Hour,
    settings.showSeconds,
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const updateSettings = (changes) => {
    setStoredSettings((current) => ({ ...safeSettings(current), ...changes }));
    onSettingsOpenChange(false);
  };

  const toggleFullscreen = async () => {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await stageRef.current?.requestFullscreen?.();
      }
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser.");
    }
  };

  const stageStyle = {
    "--digital-stage-background": selectedTemplate.background,
    "--digital-stage-color": selectedTemplate.color,
    "--digital-stage-glow": selectedTemplate.glow,
    "--digital-accent": selectedTemplate.color,
  };
  const accentInk = ["light"].includes(selectedTemplate.id)
    ? "#ffffff"
    : "#171717";
  const displayFont =
    selectedTemplate.preview === "seven-segment"
      ? "clock-digit"
      : selectedTemplate.preview === "serif"
        ? "font-serif"
        : selectedTemplate.preview === "mono"
          ? "font-mono font-bold tracking-[0.05em]"
          : "font-sans font-medium tracking-tight";

  return (
    <section className="digital-page" style={stageStyle}>
      <div className="mb-4 flex items-center justify-end gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => onSettingsOpenChange(true)}
          aria-expanded={settingsOpen}
          aria-label="Open clock settings"
          className={`digital-page__mobile-settings inline-flex items-center rounded-lg border p-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${
            dark
              ? "border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <Settings2 size={17} />
        </button>
      </div>

      <div
        className={`digital-page__layout ${
          settingsOpen ? "digital-page__layout--settings-open" : ""
        }`}
      >
        <section
          ref={stageRef}
          className="digital-page__stage"
          style={stageStyle}
          aria-label="Current local time"
        >
          <div className="digital-page__stage-toolbar">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? "Exit fullscreen" : "View clock fullscreen"
              }
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="digital-page__stage-button"
            >
              {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
            </button>
            <button
              type="button"
              onClick={() => onSettingsOpenChange(true)}
              aria-label="Open clock settings"
              title="Clock settings"
              className="digital-page__stage-button"
            >
              <Settings2 size={19} />
            </button>
          </div>

          <div className="digital-page__stage-content">
            <div className="digital-page__time-wrap">
              <time
                dateTime={now.toISOString()}
                className={`digital-page__time ${displayFont}`}
                aria-label={`Current time ${time}${meridiem ? ` ${meridiem}` : ""}`}
              >
                {time}
              </time>
              {meridiem && (
                <span className="digital-page__meridiem">{meridiem}</span>
              )}
            </div>
            {settings.showDate && (
              <p className="digital-page__date">
                <CalendarDays size={16} aria-hidden="true" />
                {formatDate(now)}
              </p>
            )}
          </div>
          {fullscreenError && (
            <p className="digital-page__fullscreen-error" role="status">
              {fullscreenError}
            </p>
          )}
        </section>

        {settingsOpen && (
          <SettingsPanel
            now={now}
            settings={settings}
            onChange={updateSettings}
            onClose={() => onSettingsOpenChange(false)}
            dark={dark}
            accent={selectedTemplate.color}
            accentInk={accentInk}
          />
        )}
      </div>

      {settingsOpen && (
        <div
          className="digital-page__drawer-backdrop lg:hidden"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close clock settings"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => onSettingsOpenChange(false)}
          />
          <SettingsPanel
            now={now}
            settings={settings}
            onChange={updateSettings}
            onClose={() => onSettingsOpenChange(false)}
            dark={dark}
            compact
            accent={selectedTemplate.color}
            accentInk={accentInk}
          />
        </div>
      )}
    </section>
  );
}
