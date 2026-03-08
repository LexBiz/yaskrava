import "server-only";

import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function saveVehicleImage(file: File | null | undefined) {
  if (!file || file.size === 0) return undefined;

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = getExtension(file);
  const dir = path.join(process.cwd(), "public", "uploads", "vehicles");
  await mkdir(dir, {recursive: true});

  const filename = `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const absPath = path.join(dir, filename);
  await writeFile(absPath, bytes);

  return `/uploads/vehicles/${filename}`;
}
