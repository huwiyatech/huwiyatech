import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function requireAdmin(session: any) {
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET — list all tags
export async function GET() {
  const session = await getServerSession(authOptions);
  const err = requireAdmin(session);
  if (err) return err;

  const tags = await prisma.nfcTag.findMany({
    include: {
      user: {
        select: {
          id: true, username: true,
          profile: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: tags });
}

// POST — register new NFC tag
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    z.object({
      tagId:  z.string().min(1).max(100),
      label:  z.string().max(100).optional(),
      notes:  z.string().max(500).optional(),
      userId: z.string().cuid().optional(),
    }).parse(body);

    const existing = await prisma.nfcTag.findUnique({ where: { tagId: body.tagId } });
    if (existing) {
      return NextResponse.json({ error: "Tag ID already registered" }, { status: 409 });
    }

    const tag = await prisma.nfcTag.create({
      data: {
        tagId:  body.tagId,
        label:  body.label,
        notes:  body.notes,
        userId: body.userId ?? null,
      },
      include: {
        user: {
          select: {
            id: true, username: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[admin/nfc POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — assign/unassign or toggle active
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    z.object({
      tagId:    z.string(),
      userId:   z.string().cuid().nullable().optional(),
      isActive: z.boolean().optional(),
      label:    z.string().max(100).optional(),
    }).parse(body);

    const tag = await prisma.nfcTag.findUnique({ where: { id: body.tagId } });
    if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    // If assigning a new user, unassign their old tag first
    if (body.userId) {
      await prisma.nfcTag.updateMany({
        where: { userId: body.userId, id: { not: tag.id } },
        data:  { userId: null },
      });
    }

    const updated = await prisma.nfcTag.update({
      where: { id: body.tagId },
      data:  {
        userId:   body.userId !== undefined ? body.userId : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        label:    body.label,
      },
      include: {
        user: {
          select: {
            id: true, username: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[admin/nfc PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
