export function labelFor(status: string) {
  return status.replaceAll("_", " ");
}

export function complexityLabel(value: number) {
  if (value === 1) return "Trivial";
  if (value === 2) return "Easy";
  if (value === 3) return "Moderate";
  if (value === 4) return "Complex";
  if (value === 5) return "Very Complex";
  return "Trivial";
}

export function complexityTone(value: number) {
  if (value === 1) return "trivial";
  if (value === 2) return "easy";
  if (value === 3) return "moderate";
  if (value === 4) return "complex";
  if (value === 5) return "very-complex";
  return "trivial";
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
