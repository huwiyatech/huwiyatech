import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadAvatar, uploadFile, deleteAsset } from "@/lib/cloudinary";
import { saveAvatarLocally, saveCVLocally, deleteLocalFile } from "@/lib/local-storage";

// Cloudinary is available only when real keys are set
const useCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const type     = formData.get("type") as "avatar" | "cv" | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    // ── Avatar ─────────────────────────────────────────────────────────────
    if (type === "avatar") {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
      }

      const { url, publicId } = useCloudinary
        ? await uploadAvatar(buffer, session.user.username)
        : await saveAvatarLocally(buffer, session.user.username, file.type);

      await prisma.profile.upsert({
        where:  { userId: session.user.id },
        create: { userId: session.user.id, avatarUrl: url },
        update: { avatarUrl: url },
      });

      return NextResponse.json({ success: true, data: { url, publicId } });
    }

    // ── CV ─────────────────────────────────────────────────────────────────
    if (type === "cv") {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "CV must be under 10 MB" }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }

      // Delete old file if stored locally
      if (profile?.cvPublicId) {
        if (profile.cvPublicId.startsWith("local/")) {
          deleteLocalFile(profile.cvPublicId);
        } else if (useCloudinary) {
          await deleteAsset(profile.cvPublicId, "raw").catch(() => {});
        }
      }

      const { url, publicId } = useCloudinary
        ? await uploadFile(buffer, {
            folder:   "nfc-platform/cvs",
            publicId: `cv_${session.user.username}`,
          })
        : await saveCVLocally(buffer, session.user.username);

      await prisma.profile.upsert({
        where:  { userId: session.user.id },
        create: { userId: session.user.id, cvUrl: url, cvPublicId: publicId },
        update: { cvUrl: url, cvPublicId: publicId },
      });

      return NextResponse.json({ success: true, data: { url, publicId } });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
