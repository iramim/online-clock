import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import SectionCard from "./SectionCard.jsx";
import { WORLD_CITIES } from "../data/timezones.js";
import { WORLD_COUNTRIES } from "../data/worldCountries.js";

function zonedParts(date, zone, use24Hour) {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24Hour,
  }).formatToParts(date);

  const read = (type) => time.find((part) => part.type === type)?.value || "";

  return {
    display: `${read("hour")}:${read("minute")}:${read("second")}`,
    meridiem: read("dayPeriod"),
  };
}

function offsetFor(date, zone) {
  const local = new Date(date.toLocaleString("en-US", { timeZone: zone }));

  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));

  const minutes = Math.round((local.getTime() - utc.getTime()) / 60000);

  const sign = minutes >= 0 ? "+" : "−";

  return `UTC${sign}${Math.floor(Math.abs(minutes) / 60)}${
    Math.abs(minutes) % 60
      ? `:${String(Math.abs(minutes) % 60).padStart(2, "0")}`
      : ""
  }`;
}

export default function WorldClock({ now, theme, use24Hour }) {
  const dark = theme === "dark";

  const [search, setSearch] = useState("");

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    const locations = query ? WORLD_COUNTRIES : WORLD_CITIES;

    return locations.filter((item) =>
      `${item.city} ${item.country} ${item.zone}`.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <SectionCard
        theme={theme}
      >
        <label
          className={`mb-5 flex items-center gap-2 rounded-xl border px-3 py-3 ${
            dark
              ? "border-neutral-800 bg-neutral-900/60"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          <Search
            size={17}
            className={dark ? "text-neutral-500" : "text-neutral-400"}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search any country or city, e.g. India"
            aria-label="Search countries or cities"
            className={`w-full bg-transparent text-sm outline-none ${
              dark
                ? "text-white placeholder:text-neutral-600"
                : "text-neutral-900 placeholder:text-neutral-400"
            }`}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              title="Clear search"
              className={`rounded-lg p-1 transition ${
                dark
                  ? "text-neutral-500 hover:bg-neutral-800 hover:text-white"
                  : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              <X size={18} />
            </button>
          )}
        </label>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLocations.map((city) => {
            const { display, meridiem } = zonedParts(now, city.zone, use24Hour);

            return (
              <article
                key={`${city.country}-${city.city}-${city.zone}`}
                className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${
                  dark
                    ? "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <div>
                  <h3 className="font-semibold">{city.city}</h3>

                  <p
                    className={`mt-1 text-xs ${
                      dark ? "text-neutral-500" : "text-neutral-500"
                    }`}
                  >
                    {city.country} · {offsetFor(now, city.zone)}
                  </p>
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-medium tracking-tight tabular-nums ${
                      dark ? "text-white" : "text-neutral-950"
                    }`}
                  >
                    {display}
                  </span>

                  {meridiem && (
                    <span className="text-xs font-semibold text-amber-500">
                      {meridiem}
                    </span>
                  )}
                </div>

              </article>
            );
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div
            className={`py-12 text-center text-sm ${
              dark ? "text-neutral-500" : "text-neutral-500"
            }`}
          >
            No cities match “{search}”.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
