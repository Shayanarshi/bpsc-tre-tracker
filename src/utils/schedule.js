import { courseData } from "../data/courseData.js";

export const DAY_COUNT = 30;
export const TARGET_SECONDS = courseData.targetDailySeconds;

export function buildSchedule() {
  const lectures = courseData.subjects.flatMap(s => s.lectures)
    .sort((a, b) => a.priority - b.priority || a.subject.localeCompare(b.subject) || a.id.localeCompare(b.id));
  const days = Array.from({ length: DAY_COUNT }, (_, i) => ({
    day: i + 1,
    date: new Date(2026, 10, i + 1),
    lectures: [],
    totalSeconds: 0
  }));

  // Balance every lecture across all 30 days. Priority influences ordering;
  // least-loaded-day assignment keeps the daily totals close to six hours.
  for (const lecture of lectures) {
    let chosen = days[0];
    for (const day of days) {
      if (day.totalSeconds < chosen.totalSeconds) chosen = day;
    }
    chosen.lectures.push(lecture);
    chosen.totalSeconds += lecture.durationSeconds;
  }

  days.forEach(day => day.lectures.sort((a,b) =>
    a.priority - b.priority || a.subject.localeCompare(b.subject) || a.id.localeCompare(b.id)
  ));
  return days;
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s ? `${s}s` : ""}`.trim();
  return `${s}s`;
}

export function formatClock(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h,m,s].map(n => String(n).padStart(2,"0")).join(":");
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(date);
}
