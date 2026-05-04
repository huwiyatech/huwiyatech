import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/utils";

const schema = z.object({
  userId:   z.string().cuid(),
  source:   z.enum(["NFC", "QR", "DIRECT", "LINK"]).default("DIRECT"),
  referrer: z.string().url().optional().nullable(),
});

// Public endpoint — no auth required (called from profile page)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const ip        = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? undefined;

    await prisma.scan.create({
      data: {
        userId:    data.userId,
        source:    data.source as any,
        ip,
        userAgent,
        referrer:  data.referrer ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    // Don't let analytics errors break the user experience
    return NextResponse.json({ success: true });
  }
}
