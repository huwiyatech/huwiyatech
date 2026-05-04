import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  type:     z.enum(["social", "custom"]),
  title:    z.string().max(80).optional(),
  url:      z.string().url().optional(),
  icon:     z.string().max(10).optional(),
  order:    z.number().int().optional(),
  isActive: z.boolean().optional(),
  platform: z.string().optional(),
});

// Helper: verify ownership of a link
async function getOwnedProfile(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const profile = await getOwnedProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (data.type === "social") {
      const link = await prisma.socialLink.findFirst({
        where: { id: params.id, profileId: profile.id },
      });
      if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

      const updated = await prisma.socialLink.update({
        where: { id: params.id },
        data:  { url: data.url, platform: data.platform, order: data.order },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // custom
    const link = await prisma.customLink.findFirst({
      where: { id: params.id, profileId: profile.id },
    });
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    const updated = await prisma.customLink.update({
      where: { id: params.id },
      data:  {
        title:    data.title,
        url:      data.url,
        icon:     data.icon,
        order:    data.order,
        isActive: data.isActive,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[links PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await getOwnedProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Try social first, then custom
    const social = await prisma.socialLink.findFirst({
      where: { id: params.id, profileId: profile.id },
    });
    if (social) {
      await prisma.socialLink.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true });
    }

    const custom = await prisma.customLink.findFirst({
      where: { id: params.id, profileId: profile.id },
    });
    if (custom) {
      await prisma.customLink.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  } catch (err) {
    console.error("[links DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
