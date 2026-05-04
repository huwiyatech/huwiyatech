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

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const err = requireAdmin(session);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  ?? "1",  10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      include: {
        profile: { select: { displayName: true, avatarUrl: true } },
        nfcTag:  { select: { tagId: true, isActive: true } },
        _count:  { select: { scans: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    data:    users,
    meta:    { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// Update a user's role
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const { userId, role } = await req.json();
    z.object({
      userId: z.string().cuid(),
      role:   z.enum(["USER", "ADMIN"]),
    }).parse({ userId, role });

    const user = await prisma.user.update({
      where: { id: userId },
      data:  { role },
      select: { id: true, username: true, role: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[admin/users PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a user (hard delete — cascades via Prisma)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const { userId } = await req.json();
    z.object({ userId: z.string().cuid() }).parse({ userId });

    // Protect: can't delete yourself
    if (userId === session!.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/users DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
