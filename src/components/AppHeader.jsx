import { AlarmClock, Moon, Settings, Sun } from "lucide-react";

export default function AppHeader({
  theme,
  onToggleTheme,
  onOpenSettings,
  compact = false,
}) {
  const dark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-30 border-b ${
        dark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="mx-auto flex h-19 max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="flex items-center gap-3"
          aria-label="Online Clock home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 shadow-lg shadow-amber-900/20">
            <AlarmClock size={23} strokeWidth={2.3} />
          </span>

          {compact ? (
            <span className="text-lg font-semibold tracking-tight sm:text-xl">
              Online<span className="text-amber-500">-clock</span>
            </span>
          ) : (
            <span className="leading-tight">
              <span className="block text-xl font-semibold tracking-tight sm:text-2xl">
                online<span className="text-amber-500">-clock</span>
              </span>

              <span
                className={`hidden text-[10px] font-medium uppercase tracking-[0.24em] sm:block ${
                  dark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Time tools made simple
              </span>
            </span>
          )}
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {!compact && (
            <>
              <a
                href="https://online-clock.com"
                className={`hidden text-sm transition md:inline ${
                  dark
                    ? "text-neutral-400 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                online-clock.com
              </a>

              <span
                className={`hidden h-7 w-px sm:block ${
                  dark ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            </>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle color theme"
            className={`rounded-xl p-2.5 transition ${
              dark
                ? "text-neutral-300 hover:bg-neutral-800"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Open settings"
            className={`rounded-xl p-2.5 transition ${
              dark
                ? "text-neutral-300 hover:bg-neutral-800"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
