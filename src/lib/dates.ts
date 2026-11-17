const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatHumanDate(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diff = now - timestamp;
  const time = new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diff < MINUTE) return "только что";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} мин назад`;

  const todayStart = startOfDay(now);
  const itemStart = startOfDay(timestamp);
  const daysDiff = Math.round((todayStart - itemStart) / DAY);

  if (daysDiff === 0) return `Сегодня, ${time}`;
  if (daysDiff === 1) return `Вчера, ${time}`;
  if (daysDiff < 7) return `${daysDiff} дн. назад, ${time}`;

  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
