import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directories exist on first use
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Save avatar ─────────────────────────────────────────────────────────────

export async function saveAvatarLocally(
  buffer: Buffer,
  username: string,
  mimeType: string
): Promise<{ url: string; publicId: string }> {
  const ext      = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const filename = `avatar_${username}.${ext}`;
  const dir      = path.join(UPLOADS_DIR, "avatars");

  ensureDir(dir);

  // Remove any previous avatar for this user
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith(`avatar_${username}.`)) {
      fs.unlinkSync(path.join(dir, f));
    }
  }

  fs.writeFileSync(path.join(dir, filename), buffer);

  return {
    url:      `/uploads/avatars/${filename}`,
    publicId: `local/avatars/${filename}`,
  };
}

// ─── Save CV ─────────────────────────────────────────────────────────────────

export async function saveCVLocally(
  buffer: Buffer,
  username: string
): Promise<{ url: string; publicId: string }> {
  const filename = `cv_${username}.pdf`;
  const dir      = path.join(UPLOADS_DIR, "cvs");

  ensureDir(dir);
  fs.writeFileSync(path.join(dir, filename), buffer);

  return {
    url:      `/uploads/cvs/${filename}`,
    publicId: `local/cvs/${filename}`,
  };
}

// ─── Delete a local file by publicId ─────────────────────────────────────────

export function deleteLocalFile(publicId: string) {
  if (!publicId.startsWith("local/")) return;
  const relativePath = publicId.replace("local/", "");
  const fullPath     = path.join(UPLOADS_DIR, relativePath.replace(/^avatars\/|^cvs\//, (m) => m));

  // Reconstruct path from publicId: "local/avatars/avatar_user.jpg"
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
