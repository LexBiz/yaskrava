import "server-only";

import {mkdir, writeFile} from "node:fs/promises";
import {randomBytes} from "node:crypto";
import path from "node:path";

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "avi"]);
const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;  // 25 MB
const MAX_VIDEO_SIZE_BYTES = 300 * 1024 * 1024; // 300 MB

function getExtension(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName ?? null;
}

function isAllowedImageFile(file: File): boolean {
  const ext = getExtension(file);
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) return false;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
  return true;
}

function isAllowedVideoFile(file: File): boolean {
  const ext = getExtension(file);
  if (!ext || !ALLOWED_VIDEO_EXTENSIONS.has(ext)) return false;
  if (file.size > MAX_VIDEO_SIZE_BYTES) return false;
  return true;
}

async function saveUploadedFile(
  file: File | null | undefined,
  prefix: string,
  type: "image" | "video"
) {
  if (!file || file.size === 0) return undefined;

  if (type === "image" && !isAllowedImageFile(file)) return undefined;
  if (type === "video" && !isAllowedVideoFile(file)) return undefined;

  const ext = getExtension(file)!;
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "vehicles");
  await mkdir(dir, {recursive: true});

  const rand = randomBytes(6).toString("hex");
  const filename = `${prefix}-${Date.now()}-${rand}.${ext}`;
  const absPath = path.join(dir, filename);
  await writeFile(absPath, bytes);

  return `/uploads/vehicles/${filename}`;
}

export async function saveVehicleImage(file: File | null | undefined) {
  return saveUploadedFile(file, "vehicle", "image");
}

export async function saveVehicleVideo(file: File | null | undefined) {
  return saveUploadedFile(file, "vehicle-video", "video");
}

export async function saveVehicleImages(files: Array<File | null | undefined>) {
  const uploaded = await Promise.all(files.map((file) => saveVehicleImage(file)));
  return uploaded.filter((value): value is string => Boolean(value));
}

export async function saveVehicleVideos(files: Array<File | null | undefined>) {
  const uploaded = await Promise.all(files.map((file) => saveVehicleVideo(file)));
  return uploaded.filter((value): value is string => Boolean(value));
}
