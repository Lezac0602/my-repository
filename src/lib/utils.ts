export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function highlightText(text: string, keywords: string[]): string {
  if (!keywords.length) {
    return text;
  }

  const escapedKeywords = keywords
    .filter(Boolean)
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!escapedKeywords.length) {
    return text;
  }

  const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

export function percentageLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
