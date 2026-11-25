import { readMediaFile, mediaContentType } from "@/lib/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const relativePath = path.join("/");
  const contentType = mediaContentType(relativePath);
  if (!contentType) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readMediaFile(relativePath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
