import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const socialSchema = z.object({
  type:     z.literal("social"),
  platform: z.string().min(1),
  url:      z.string().url(),
  order:    z.number().int().optional(),
});

const customSchema = z.object({
  type:     z.literal("custom"),
  title:    z.string().min(1).max(80),
  url:      z.string().url(),
  icon:     z.string().max(10).optional(),
  order:    z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const schema = z.discriminatedUnion("type", [socialSchema, customSchema]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (data.type === "social") {
      const link = await prisma.socialLink.create({
        data: {
          profileId: profile.id,
          platform:  data.platform,
          url:       data.url,
          order:     data.order ?? 0,
        },
      });
      return NextResponse.json({ success: true, data: link }, { status: 201 });
    }

    const link = await prisma.customLink.create({
      data: {
        profileId: profile.id,
        title:     data.title,
        url:       data.url,
        icon:      data.icon,
        order:     data.order ?? 0,
        isActive:  data.isActive ?? true,
      },
    });
    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[links POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
