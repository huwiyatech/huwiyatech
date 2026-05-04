import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber, daysAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const userId  = session!.user.id;

  const [user, totalScans, todayScans, weekScans] = await Promise.all([
    prisma.user.findUnique({
      where:   { id: userId },
      include: { profile: true },
    }),
    prisma.scan.count({ where: { userId } }),
    prisma.scan.count({ where: { userId, createdAt: { gte: daysAgo(0) } } }),
    prisma.scan.count({ where: { userId, createdAt: { gte: daysAgo(7) } } }),
  ]);

  const profile = user?.profile;
  const name    = profile?.displayName ?? session!.user.username;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const profileUrl = `${appUrl}/u/${session!.user.username}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your profile is live at{" "}
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
               className="text-brand-600 hover:underline font-medium">
              {profileUrl.replace(/^https?:\/\//, "")}
            </a>
          </p>
        </div>
        <Link href="/dashboard/edit" className="btn-primary whitespace-nowrap">
          ✏️ Edit profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total scans",  value: formatNumber(totalScans), icon: "👆", color: "bg-brand-50 text-brand-700"  },
          { label: "Today",        value: formatNumber(todayScans),  icon: "📅", color: "bg-green-50 text-green-700"  },
          { label: "This week",    value: formatNumber(weekScans),   icon: "📈", color: "bg-purple-50 text-purple-700" },
          { label: "Profile views", value: formatNumber(totalScans), icon: "👁️", color: "bg-orange-50 text-orange-700" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-center group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-sm font-medium text-slate-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile completeness */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Profile completeness</h2>
        <ProfileCompleteness profile={profile} />
      </div>
    </div>
  );
}

function ProfileCompleteness({ profile }: { profile: any }) {
  const checks = [
    { label: "Profile picture",  done: !!profile?.avatarUrl    },
    { label: "Display name",     done: !!profile?.displayName  },
    { label: "Bio",              done: !!profile?.bio           },
    { label: "Job title",        done: !!profile?.jobTitle      },
    { label: "Social links",     done: false /* fetched separately */ },
    { label: "CV uploaded",      done: !!profile?.cvUrl         },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const pct       = Math.round((doneCount / checks.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{doneCount} of {checks.length} completed</span>
        <span className="text-sm font-semibold text-brand-600">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-brand-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-2 text-sm ${c.done ? "text-green-600" : "text-slate-400"}`}>
            <span>{c.done ? "✅" : "○"}</span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const quickActions = [
  { icon: "✏️",  label: "Edit profile",  href: "/dashboard/edit"         },
  { icon: "🔗",  label: "My links",      href: "/dashboard/edit#links"    },
  { icon: "📊",  label: "Analytics",     href: "/dashboard/analytics"     },
  { icon: "👁️", label: "View public",   href: "#", /* replaced client-side */ },
];
