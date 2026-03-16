import "server-only";

export function parseTextareaLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function dedupeUrls(urls: string[]) {
  return Array.from(new Set(urls));
}

export function isStoredMediaPath(value: string) {
  return value.startsWith("/uploads/");
}

export function isAbsoluteUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isAcceptedMediaUrl(value: string) {
  return isStoredMediaPath(value) || isAbsoluteUrl(value);
}

export function validateMediaUrls(urls: string[]) {
  return urls.every(isAcceptedMediaUrl);
}

export function asFiles(entries: FormDataEntryValue[]) {
  return entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export function getPrimaryAndSecondaryMedia(urls: string[]) {
  const deduped = dedupeUrls(urls);
  return {
    primary: deduped[0],
    secondary: deduped.slice(1),
    all: deduped,
  };
}

export function normalizeVideoGallery(
  primaryVideo: string | undefined,
  extraVideos: string[]
) {
  return dedupeUrls([primaryVideo, ...extraVideos].filter(Boolean) as string[]);
}
