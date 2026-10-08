export function salary(min?: number | null, max?: number | null) {
  if (!min || !max) return "Not disclosed";
  return `₹${min}–${max} LPA`;
}
export function ago(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
export const modeLabel = { REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site" } as const;
export const typeLabel = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract", INTERNSHIP: "Internship" } as const;
