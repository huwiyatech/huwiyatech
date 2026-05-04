import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  const [users, totalScans, totalUsers] = await Promise.all([
    prisma.user.findMany({
      include: {
        profile: { select: { displayName: true, avatarUrl: true } },
        nfcTag:  { select: { tagId: true, isActive: true } },
        _count:  { select: { scans: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.scan.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin — Users</h1>
        <p className="text-slate-500 text-sm mt-1">
          {formatNumber(totalUsers)} users · {formatNumber(totalScans)} total scans
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total users",  value: formatNumber(totalUsers),  icon: "👥" },
          { label: "Total scans",  value: formatNumber(totalScans),  icon: "👆" },
          { label: "NFC assigned", value: formatNumber(users.filter((u) => u.nfcTag).length), icon: "📡" },
          { label: "Admins",       value: formatNumber(users.filter((u) => u.role === "ADMIN").length), icon: "🛡️" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Username</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Scans</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">NFC</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Role</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {(user.profile?.displayName ?? user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.profile?.displayName ?? user.username}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 hidden md:table-cell">@{user.username}</td>
                  <td className="px-4 py-4 text-slate-500 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className="badge bg-brand-50 text-brand-700">{user._count.scans}</span>
                  </td>
                  <td className="px-4 py-4">
                    {user.nfcTag ? (
                      <span className="badge bg-green-50 text-green-700">
                        {user.nfcTag.isActive ? "✓ Active" : "Inactive"}
                      </span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge ${
                      user.role === "ADMIN"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <a
                      href={`/u/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline text-xs"
                    >
                      View profile →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
