import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { NfcManager } from "@/components/admin/NfcManager";

export const metadata = { title: "Admin — NFC Tags" };

export default async function AdminNfcPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const [tags, unassignedUsers] = await Promise.all([
    prisma.nfcTag.findMany({
      include: {
        user: {
          select: {
            id: true, username: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where:  { nfcTag: null },
      select: { id: true, username: true, profile: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">NFC Tags</h1>
        <p className="text-slate-500 text-sm mt-1">
          {tags.length} tags registered · {tags.filter((t) => t.userId).length} assigned
        </p>
      </div>

      <NfcManager tags={tags} unassignedUsers={unassignedUsers} />
    </div>
  );
}
