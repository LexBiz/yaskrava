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
  const {randomBytes} = require("node:crypto") as typeof import("node:crypto");
  const suffix = randomBytes(3).toString("hex");
  return `${normalized}-${suffix}`;
}
