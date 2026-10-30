import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Maximize2, Minimize2, Settings2, X } from "lucide-react";

import { formatClock } from "../lib/format.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import "./FlipClockPage.css";

const TEMPLATES = [
  {
    id: "pure-dark",
    name: "Pure Dark",
    page: "#000000",
    card: "#151515",
    ink: "#f8fafc",
    border: "#202020",
  },
  {
    id: "dark",
    name: "Dark",
    page: "#171717",
    card: "#202020",
    ink: "#d4d4d4",
    border: "#292929",
  },
  {
    id: "light",
    name: "Light",
    page: "#f7f7f7",
    card: "#ffffff",
    ink: "#1a1a1a",
    border: "#e5e5e5",
  },
  {
    id: "green",
    name: "Green",
    page: "#0e160f",
    card: "#172119",
    ink: "#b6d6b5",
    border: "#243526",
  },
  {
    id: "blue",
    name: "Blue",
    page: "#10131c",
    card: "#171b27",
    ink: "#bdc9f3",
    border: "#262d43",
  },
  {
    id: "red",
    name: "Red",
    page: "#1b1111",
    card: "#291818",
    ink: "#eaa7a7",
    border: "#432727",
  },
  {
    id: "orange",
    name: "Orange",
    page: "#1d160e",
    card: "#2b2116",
    ink: "#f1bf70",
    border: "#49351d",
  },
  {
    id: "yellow",
    name: "Yellow",
    page: "#1a180e",
    card: "#292615",
    ink: "#e7d676",
    border: "#413c1f",
  },
  {
    id: "purple",
    name: "Purple",
    page: "#19121d",
    card: "#281b2d",
    ink: "#d2b5da",
    border: "#42294b",
  },
  {
    id: "pink",
    name: "Pink",
    page: "#f9e2eb",
    card: "#efbdcd",
    ink: "#ffffff",
    border: "#e6adbf",
  },
];

const DEFAULT_SETTINGS = {
  use24Hour: true,
  showSeconds: true,
  showDate: false,
  template: "pure-dark",
};

function normaliseSettings(value) {
  const valueIsObject =
    value && typeof value === "object" && !Array.isArray(value);
  const template =
    valueIsObject && TEMPLATES.some(({ id }) => id === value.template)
      ? value.template
      : DEFAULT_SETTINGS.template;

  return {
    use24Hour:
      valueIsObject && typeof value.use24Hour === "boolean"
        ? value.use24Hour
        : DEFAULT_SETTINGS.use24Hour,
    showSeconds:
      valueIsObject && typeof value.showSeconds === "boolean"
        ? value.showSeconds
        : DEFAULT_SETTINGS.showSeconds,
    showDate:
      valueIsObject && typeof value.showDate === "boolean"
        ? value.showDate
        : DEFAULT_SETTINGS.showDate,
    template,
  };
}

function DigitHalf({ digit, half, className = "" }) {
  return (
    <span className={`flip-card__half flip-card__half--${half} ${className}`}>
      <span className="flip-card__number">{digit}</span>
    </span>
  );
}

function FlipDigit({ digit, allowAnimation }) {
  const [shownDigit, setShownDigit] = useState(digit);
  const [flip, setFlip] = useState(null);

  useEffect(() => {
    let updateFrame;
    let completeFlip;

    if (!allowAnimation) {
      updateFrame = window.requestAnimationFrame(() => {
        setFlip(null);
        setShownDigit(digit);
      });
    } else if (digit !== shownDigit) {
      updateFrame = window.requestAnimationFrame(() => {
        setFlip({ from: shownDigit, to: digit });
        completeFlip = window.setTimeout(() => {
          setShownDigit(digit);
          setFlip(null);
        }, 600);
      });
    }

    return () => {
      window.cancelAnimationFrame(updateFrame);
      window.clearTimeout(completeFlip);
    };
  }, [allowAnimation, digit, shownDigit]);

  const oldDigit = flip?.from ?? shownDigit;
  const newDigit = flip?.to ?? shownDigit;

  return (
    <span className="flip-card" aria-hidden="true">
      <DigitHalf
        digit={newDigit}
        half="top"
        className="flip-card__static-top"
      />
      <DigitHalf
        digit={oldDigit}
        half="bottom"
        className="flip-card__static-bottom"
      />
      {flip && (
        <>
          <DigitHalf
            digit={oldDigit}
            half="top"
            className="flip-card__leaf flip-card__leaf--top"
          />
          <DigitHalf
            digit={newDigit}
            half="bottom"
            className="flip-card__leaf flip-card__leaf--bottom"
          />
        </>
      )}
    </span>
  );
}

function FlipTime({ time, allowAnimation }) {
  return (
    <div className="flip-clock__time" aria-label={time}>
      {[...time].map((character, index) =>
        character === ":" ? (
          <span className="flip-clock__separator" key={`separator-${index}`}>
            :
          </span>
        ) : (
          <FlipDigit
            key={`digit-${index}`}
            digit={character}
            allowAnimation={allowAnimation}
          />
        ),
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flip-clock__setting-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flip-clock__switch ${checked ? "flip-clock__switch--on" : ""}`}
      >
        <span />
      </button>
    </div>
  );
}

function TemplatePreview({ template }) {
  return (
    <span
      className="flip-clock__template-preview"
      style={{
        "--preview-page": template.page,
        "--preview-card": template.card,
        "--preview-ink": template.ink,
      }}
      aria-hidden="true"
    >
      {"24:00:00"
        .split("")
        .map((character, index) =>
          character === ":" ? (
            <i key={index}>:</i>
          ) : (
            <b key={index}>{character}</b>
          ),
        )}
    </span>
  );
}

function SettingsPanel({ settings, onChange, onClose, templates }) {
  return (
    <aside className="flip-clock__settings" aria-label="Flip clock settings">
      <div className="flip-clock__settings-title">
        <h2>Settings</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close flip clock settings"
          className="flip-clock__close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flip-clock__setting-row">
        <span>Format</span>
        <div
          className="flip-clock__format"
          role="group"
          aria-label="Time format"
        >
          <button
            type="button"
            onClick={() => onChange({ use24Hour: true })}
            aria-pressed={settings.use24Hour}
          >
            24H
          </button>
          <button
            type="button"
            onClick={() => onChange({ use24Hour: false })}
            aria-pressed={!settings.use24Hour}
          >
            12H
          </button>
        </div>
      </div>
      <Toggle
        label="Second"
        checked={settings.showSeconds}
        onChange={(showSeconds) => onChange({ showSeconds })}
      />
      <Toggle
        label="Day and Year"
        checked={settings.showDate}
        onChange={(showDate) => onChange({ showDate })}
      />

      <h3>Clock Template</h3>
      <div className="flip-clock__templates">
        {templates.map((template) => {
          const selected = template.id === settings.template;
          return (
            <button
              type="button"
              key={template.id}
              onClick={() => onChange({ template: template.id })}
              aria-pressed={selected}
              className={`flip-clock__template ${selected ? "flip-clock__template--selected" : ""}`}
            >
              <TemplatePreview template={template} />
              <span>{template.name}</span>
              {selected && (
                <Check size={17} className="flip-clock__template-check" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function FlipClockPage({ settingsOpen, onSettingsOpenChange }) {
  const [storedSettings, setStoredSettings] = useLocalStorage(
    "online-clock-flip-settings-v1",
    DEFAULT_SETTINGS,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clockNow, setClockNow] = useState(() => new Date());
  const [allowAnimation, setAllowAnimation] = useState(false);
  const stageRef = useRef(null);
  const settings = useMemo(
    () => normaliseSettings(storedSettings),
    [storedSettings],
  );
  const template =
    TEMPLATES.find(({ id }) => id === settings.template) || TEMPLATES[0];
  const { time, meridiem } = formatClock(
    clockNow,
    settings.use24Hour,
    settings.showSeconds,
  );
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(clockNow);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    let frameId;
    let lastSecond = new Date().getSeconds();
    let resumeFrame;

    const tick = () => {
      const next = new Date();
      if (next.getSeconds() !== lastSecond) {
        lastSecond = next.getSeconds();
        setClockNow(next);
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const syncAfterVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      setAllowAnimation(false);
      const next = new Date();
      lastSecond = next.getSeconds();
      setClockNow(next);
      resumeFrame = window.requestAnimationFrame(() => {
        resumeFrame = window.requestAnimationFrame(() =>
          setAllowAnimation(true),
        );
      });
    };

    frameId = window.requestAnimationFrame(tick);
    const initialFrame = window.requestAnimationFrame(() =>
      setAllowAnimation(true),
    );
    document.addEventListener("visibilitychange", syncAfterVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(resumeFrame);
      document.removeEventListener(
        "visibilitychange",
        syncAfterVisibilityChange,
      );
    };
  }, []);

  const updateSettings = (changes) => {
    setStoredSettings((current) => ({
      ...normaliseSettings(current),
      ...changes,
    }));
    onSettingsOpenChange(false);
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen?.();
    } catch {
      // Fullscreen support depends on the browser and embedding context.
    }
  };

  const pageStyle = {
    "--flip-page": template.page,
    "--flip-card": template.card,
    "--flip-ink": template.ink,
    "--flip-border": template.border,
  };

  return (
    <section className="flip-clock" style={pageStyle}>
      <div
        className={`flip-clock__layout ${settingsOpen ? "flip-clock__layout--settings-open" : ""}`}
      >
        <section
          ref={stageRef}
          className="flip-clock__stage"
          aria-label="Current local time"
        >
          <div className="flip-clock__toolbar">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? "Exit fullscreen" : "View clock fullscreen"
              }
            >
              {isFullscreen ? <Minimize2 size={21} /> : <Maximize2 size={21} />}
            </button>
            <button
              type="button"
              onClick={() => onSettingsOpenChange(true)}
              aria-label="Open flip clock settings"
            >
              <Settings2 size={21} />
            </button>
          </div>
          <div className="flip-clock__display">
            <FlipTime time={time} allowAnimation={allowAnimation} />
            {meridiem && (
              <span className="flip-clock__meridiem">{meridiem}</span>
            )}
            {settings.showDate && <p className="flip-clock__date">{date}</p>}
          </div>
        </section>
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onClose={() => onSettingsOpenChange(false)}
            templates={TEMPLATES}
          />
        )}
      </div>

      {settingsOpen && (
        <div className="flip-clock__drawer lg:hidden" role="presentation">
          <button
            type="button"
            className="flip-clock__drawer-dismiss"
            onClick={() => onSettingsOpenChange(false)}
            aria-label="Close flip clock settings"
          />
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onClose={() => onSettingsOpenChange(false)}
            templates={TEMPLATES}
          />
        </div>
      )}
    </section>
  );
}
