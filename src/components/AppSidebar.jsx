import { AlarmClock, Clock3, Globe2, PanelsTopLeft, Timer, Watch } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const VIEWS = [
  {
    id: "flip",
    label: "Flip Clock",
    icon: PanelsTopLeft,
    hint: "Classic split-flap time",
  },
  {
    id: "digital",
    label: "Digital Clock",
    icon: Clock3,
    hint: "See local time",
  },
  {
    id: "alarm",
    label: "Alarm Clock",
    icon: AlarmClock,
    hint: "Wake up on time",
  },
  {
    id: "timer",
    label: "Timer",
    icon: Timer,
    hint: "Count down",
  },
  {
    id: "stopwatch",
    label: "Stopwatch",
    icon: Watch,
    hint: "Track elapsed time",
  },
  {
    id: "world",
    label: "World Clock",
    icon: Globe2,
    hint: "Compare time zones",
  },
];

export default function AppSidebar({
  activeView,
  onChange,
  theme,
  compact = false,
}) {
  const dark = theme === "dark";

  const navButton = (view) => {
    const active = activeView === view.id;
    const Icon = view.icon;

    return (
      <button
        key={view.id}
        type="button"
        onClick={() => onChange(view.id)}
        aria-current={active ? "page" : undefined}
        aria-label={compact ? view.label : undefined}
        title={compact ? view.label : undefined}
        className={`group flex w-full items-center rounded-xl px-3 py-3 text-left transition ${
          compact ? "flex-col justify-center gap-1.5 py-4 text-center" : "gap-3"
        } ${
          active
            ? "bg-amber-500 text-neutral-950"
            : dark
              ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
        }`}
      >
        <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />

        <span className={compact ? "min-w-0" : "min-w-0 flex-1"}>
          <span
            className={
              compact
                ? "block text-xs font-semibold"
                : "block text-sm font-semibold"
            }
          >
            {view.label}
          </span>

          <span
            className={`${compact ? "hidden" : "mt-0.5 hidden text-[11px] md:block"} ${
              active
                ? "text-neutral-900/70"
                : dark
                  ? "text-neutral-600"
                  : "text-neutral-400"
            }`}
          >
            {view.hint}
          </span>
        </span>
      </button>
    );
  };

  return (
    <>
      <aside
        className={`hidden shrink-0 border-r p-4 lg:block ${
          compact ? "w-36" : "w-59.5"
        } ${
          dark
            ? "border-neutral-800 bg-neutral-950"
            : "border-neutral-200 bg-white"
        }`}
      >
        {!compact && (
          <p
            className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] ${
              dark ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            Tools
          </p>
        )}

        <nav className="space-y-2">{VIEWS.map(navButton)}</nav>

        {!compact && (
          <div
            className={`mt-8 rounded-xl border p-3 ${
              dark
                ? "border-neutral-800 bg-neutral-900/60"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <p className="text-xs font-semibold">A small reminder</p>

            <p
              className={`mt-1.5 text-xs leading-5 ${
                dark ? "text-neutral-500" : "text-neutral-500"
              }`}
            >
              Keep this page open and your device awake for browser alarms to
              work reliably.
            </p>
          </div>
        )}
      </aside>

      <nav
        aria-label="Main tools"
        className={`fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t px-2 py-2 sm:grid-cols-6 lg:hidden ${
          dark
            ? "border-neutral-800 bg-neutral-950/95 backdrop-blur"
            : "border-neutral-200 bg-white/95 backdrop-blur"
        }`}
      >
        {VIEWS.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;

          return (
            <button
              key={view.id}
              type="button"
              onClick={() => onChange(view.id)}
              aria-label={compact ? view.label : undefined}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium ${
                active ? "text-amber-500" : "text-neutral-500"
              }`}
            >
              <Icon size={20} />
              <span className={compact ? "sr-only" : ""}>{view.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
