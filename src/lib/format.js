export function pad(value) {
  return String(value).padStart(2, "0");
}

export function formatClock(date, use24Hour = false, includeSeconds = true) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (use24Hour) {
    return {
      time: `${pad(hours)}:${pad(minutes)}${
        includeSeconds ? `:${pad(seconds)}` : ""
      }`,
      meridiem: "",
    };
  }

  return {
    time: `${pad(hours % 12 || 12)}:${pad(minutes)}${
      includeSeconds ? `:${pad(seconds)}` : ""
    }`,
    meridiem: hours >= 12 ? "PM" : "AM",
  };
}

export function formatDuration(milliseconds, showMilliseconds = false) {
  const safe = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safe / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showMilliseconds) {
    const centiseconds = Math.floor((safe % 1000) / 10);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatAlarmTime(time, use24Hour = false) {
  if (!time || !time.includes(":")) return time || "";

  const [hoursText, minutes] = time.split(":");
  const hours = Number(hoursText);

  if (use24Hour) {
    return `${pad(hours)}:${minutes}`;
  }

  return `${pad(hours % 12 || 12)}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
    .format(date)
    .toUpperCase()
    .replace(",", " -");
}

export function getSuggestedAlarmTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  const roundedMinutes = Math.ceil((now.getMinutes() + 1) / 5) * 5;
  now.setMinutes(roundedMinutes);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
