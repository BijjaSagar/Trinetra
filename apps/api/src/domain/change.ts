import { MS_PER_DAY } from "./time.js";

export interface TimedValue {
  value: number;
  asOf: Date;
}

/**
 * Latest point at or before `currentAsOf - windowDays`, and not older than
 * `windowDays + slackDays`. Returns null when history does not cover the window.
 */
export function pastValue(
  points: TimedValue[],
  currentAsOf: Date,
  windowDays: number,
  slackDays: number,
): TimedValue | null {
  const newest = currentAsOf.getTime() - windowDays * MS_PER_DAY;
  const oldest = newest - slackDays * MS_PER_DAY;
  let best: TimedValue | null = null;
  for (const point of points) {
    const time = point.asOf.getTime();
    if (time <= newest && time >= oldest && (best === null || time > best.asOf.getTime())) {
      best = point;
    }
  }
  return best;
}

export function percentChange(current: number, past: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(past) || past === 0) return null;
  return ((current - past) / past) * 100;
}

export function changeOver(
  points: TimedValue[],
  current: TimedValue,
  windowDays: number,
  slackDays: number,
): number | null {
  const past = pastValue(
    points.filter((point) => point.asOf.getTime() < current.asOf.getTime()),
    current.asOf,
    windowDays,
    slackDays,
  );
  if (!past) return null;
  return percentChange(current.value, past.value);
}

export function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}
