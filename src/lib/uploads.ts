import "server-only";

import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  return "jpg";
}

async function saveUploadedFile(file: File | null | undefined, prefix: string) {
  if (!file || file.size === 0) return undefined;

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = getExtension(file);
  const dir = path.join(process.cwd(), "public", "uploads", "vehicles");
  await mkdir(dir, {recursive: true});

  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const absPath = path.join(dir, filename);
  await writeFile(absPath, bytes);

  return `/uploads/vehicles/${filename}`;
}

export async function saveVehicleImage(file: File | null | undefined) {
  return saveUploadedFile(file, "vehicle");
}

export async function saveVehicleVideo(file: File | null | undefined) {
  return saveUploadedFile(file, "vehicle-video");
}
