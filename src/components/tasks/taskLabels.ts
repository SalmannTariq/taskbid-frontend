export function labelFor(status: string) {
  return status.replaceAll("_", " ");
}

export function complexityLabel(value: number) {
  if (value <= 2) return "Low";
  if (value === 3) return "Medium";
  return "High";
}

export function complexityTone(value: number) {
  if (value <= 2) return "low";
  if (value === 3) return "medium";
  return "high";
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
