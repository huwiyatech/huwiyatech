import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME";

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure:     true,
  });
}

export { cloudinary };

// ─── Upload a Buffer (from formData) ─────────────────────────────────────────

export async function uploadImage(
  buffer: Buffer,
  options: { folder?: string; publicId?: string; transformation?: object[] } = {}
): Promise<{ url: string; publicId: string }> {
  if (!cloudinaryConfigured) throw new Error("Cloudinary not configured — add CLOUDINARY_* keys to .env");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:     options.folder ?? "nfc-platform",
        public_id:  options.publicId,
        overwrite:  true,
        resource_type: "auto",
        transformation: options.transformation ?? [
          { width: 800, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

// ─── Upload a PDF (CV) ────────────────────────────────────────────────────────

export async function uploadFile(
  buffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<{ url: string; publicId: string }> {
  if (!cloudinaryConfigured) throw new Error("Cloudinary not configured — add CLOUDINARY_* keys to .env");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        options.folder ?? "nfc-platform/cvs",
        public_id:     options.publicId,
        overwrite:     true,
        resource_type: "raw",
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

// ─── Delete an asset ─────────────────────────────────────────────────────────

export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

// ─── Avatar-specific upload with face crop ───────────────────────────────────

export async function uploadAvatar(
  buffer: Buffer,
  username: string
): Promise<{ url: string; publicId: string }> {
  return uploadImage(buffer, {
    folder:   "nfc-platform/avatars",
    publicId: `avatar_${username}`,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}
