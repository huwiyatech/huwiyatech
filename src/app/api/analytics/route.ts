import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const since = daysAgo(days - 1);

  const [total, scans] = await Promise.all([
    prisma.scan.count({ where: { userId: session.user.id } }),
    prisma.scan.findMany({
      where:   { userId: session.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select:  { createdAt: true, source: true, country: true },
    }),
  ]);

  // Aggregate by day
  const byDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  scans.forEach((s) => {
    const k = s.createdAt.toISOString().slice(0, 10);
    if (byDay[k] !== undefined) byDay[k]++;
  });

  const bySource: Record<string, number> = {};
  scans.forEach((s) => { bySource[s.source] = (bySource[s.source] ?? 0) + 1; });

  return NextResponse.json({
    success: true,
    data: {
      total,
      period:  scans.length,
      byDay:   Object.entries(byDay).map(([date, count]) => ({ date, count })),
      bySource,
    },
  });
}
