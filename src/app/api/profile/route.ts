import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  displayName:  z.string().max(60).optional(),
  bio:          z.string().max(500).optional(),
  jobTitle:     z.string().max(80).optional(),
  company:      z.string().max(80).optional(),
  location:     z.string().max(80).optional(),
  website:      z.string().url().or(z.literal("")).optional(),
  phone:        z.string().max(30).optional(),
  whatsapp:     z.string().max(30).optional(),
  email:        z.string().email().or(z.literal("")).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  theme:        z.enum(["default","minimal","bold","glass","nature","sunset","ocean","dark"]).optional(),
  darkMode:     z.boolean().optional(),
  bgGradient:   z.string().max(100).optional(),
  isPublic:     z.boolean().optional(),
});

// GET — fetch own profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where:   { userId: session.user.id },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      customLinks: { orderBy: { order: "asc" } },
      gallery:     { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ success: true, data: profile });
}

// PATCH — update own profile
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Remove empty strings
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "")
    );

    const profile = await prisma.profile.upsert({
      where:  { userId: session.user.id },
      create: { userId: session.user.id, ...cleaned },
      update: cleaned,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[profile PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
