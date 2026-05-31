// Get year-week string like "2026-23" (ISO week)
export function getYearWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Find Monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${year}-${String(weekNum).padStart(2, '0')}`;
}

// Get Monday date of a given week
export function getWeekStart(yearWeek) {
  const [year, week] = yearWeek.split('-').map(Number);
  const jan1 = new Date(year, 0, 1);
  const monday = new Date(jan1);
  monday.setDate(jan1.getDate() - (jan1.getDay() === 0 ? 6 : jan1.getDay() - 1));
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}
