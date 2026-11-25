import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_BYTES = 7_000_000;
const IMAGE_TYPES = {
  "image/jpeg": { extension: "jpg", signature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", signature: (bytes: Uint8Array) => [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte) },
  "image/webp": { extension: "webp", signature: (bytes: Uint8Array) => String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" },
} as const;

export function mediaRoot() {
  const configured = process.env.HOMEFINDS_MEDIA_DIR;
  if (process.env.NODE_ENV === "production" && (!configured || !path.isAbsolute(configured) || path.resolve(/*turbopackIgnore: true*/ configured).startsWith(`${path.resolve(/*turbopackIgnore: true*/ process.cwd())}${path.sep}`))) {
    throw new Error("Persistent media storage is not configured outside the deployment checkout. Set HOMEFINDS_MEDIA_DIR before enabling uploads.");
  }
  return path.resolve(/*turbopackIgnore: true*/ configured || path.join(process.cwd(), ".local-media"));
}

function safeRelativePath(relativePath: string) {
  const segments = relativePath.replaceAll("\\", "/").split("/");
  if (!segments.length || segments.some((part) => !part || part === "." || part === ".." || !/^[a-zA-Z0-9._-]+$/.test(part))) {
    throw new Error("Invalid media path.");
  }
  return segments.join(path.sep);
}

export async function saveMediaImage(file: File, directory: string) {
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image under 7 MB.");
  const mime = file.type.toLowerCase() as keyof typeof IMAGE_TYPES;
  const type = IMAGE_TYPES[mime];
  if (!type) throw new Error("Use a JPG, PNG or WebP image.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.signature(bytes.slice(0, 16))) throw new Error("The selected file contents do not match a supported image format.");
  const relativePath = safeRelativePath(`${directory}/${crypto.randomUUID()}.${type.extension}`);
  const root = mediaRoot();
  const destination = path.resolve(root, relativePath);
  if (!destination.startsWith(`${root}${path.sep}`)) throw new Error("Invalid media path.");
  await mkdir(path.dirname(destination), { recursive: true, mode: 0o750 });
  await writeFile(destination, bytes, { flag: "wx", mode: 0o640 });
  return { storagePath: relativePath.split(path.sep).join("/"), imageUrl: `/media/${relativePath.split(path.sep).map(encodeURIComponent).join("/")}` };
}

export async function removeMediaFile(relativePath: string) {
  let safePath: string;
  try {
    safePath = safeRelativePath(relativePath);
  } catch {
    return;
  }
  const root = mediaRoot();
  const target = path.resolve(root, safePath);
  if (!target.startsWith(`${root}${path.sep}`)) return;
  try {
    await unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function readMediaFile(relativePath: string) {
  const safePath = safeRelativePath(relativePath);
  const root = mediaRoot();
  const target = path.resolve(root, safePath);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error("Invalid media path.");
  return readFile(/*turbopackIgnore: true*/ target);
}

export function mediaContentType(relativePath: string) {
  switch (path.extname(relativePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".png": return "image/png";
    case ".webp": return "image/webp";
    default: return null;
  }
}
