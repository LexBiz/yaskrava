export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(base: string) {
  const normalized = slugify(base) || "dealer";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${normalized}-${suffix}`;
}
