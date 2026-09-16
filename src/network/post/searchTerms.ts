function normalizeWord(w: string) {
  return w
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildSearchTerms(description: string, who: string) {
  const text = `${description} ${who}`;
  const normalized = normalizeWord(text);

  const words = normalized
    .split(/\s+/)
    .filter(Boolean)

  // de-dupe + keep a reasonable size
  return Array.from(new Set(words)).slice(0, 40);
}