import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber, daysAgo } from "@/lib/utils";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userId  = session!.user.id;

  // Last 30 days by day
  const thirtyDaysAgo = daysAgo(29);
  const scans = await prisma.scan.findMany({
    where:   { userId, createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: "asc" },
    select:  { createdAt: true, source: true, country: true },
  });

  // Aggregate by day
  const byDayMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d   = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    byDayMap[d.toISOString().slice(0, 10)] = 0;
  }
  scans.forEach((s) => {
    const key = s.createdAt.toISOString().slice(0, 10);
    if (byDayMap[key] !== undefined) byDayMap[key]++;
  });
  const chartData = Object.entries(byDayMap).map(([date, count]) => ({ date, count }));

  // By source
  const bySource: Record<string, number> = { NFC: 0, QR: 0, DIRECT: 0, LINK: 0 };
  scans.forEach((s) => { bySource[s.source] = (bySource[s.source] ?? 0) + 1; });

  // Top countries
  const countryMap: Record<string, number> = {};
  scans.forEach((s) => {
    if (s.country) countryMap[s.country] = (countryMap[s.country] ?? 0) + 1;
  });
  const topCountries = Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const total   = scans.length;
  const today   = scans.filter((s) => s.createdAt >= daysAgo(0)).length;
  const week    = scans.filter((s) => s.createdAt >= daysAgo(6)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Profile scan statistics for the last 30 days</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total (30d)",  value: formatNumber(total), icon: "👆" },
          { label: "Today",        value: formatNumber(today), icon: "📅" },
          { label: "This week",    value: formatNumber(week),  icon: "📈" },
          { label: "NFC scans",    value: formatNumber(bySource.NFC ?? 0), icon: "📡" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-3xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-6">Scans over time</h2>
        <AnalyticsChart data={chartData} />
      </div>

      {/* By source + countries */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Scan source</h2>
          <div className="space-y-3">
            {Object.entries(bySource).map(([source, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{sourceLabel(source)}</span>
                    <span className="text-slate-500">{formatNumber(count)} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top countries</h2>
          {topCountries.length > 0 ? (
            <div className="space-y-3">
              {topCountries.map(([country, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={country}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{country}</span>
                      <span className="text-slate-500">{formatNumber(count)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function sourceLabel(s: string) {
  return { NFC: "📡 NFC tap", QR: "📷 QR scan", DIRECT: "🌐 Direct link", LINK: "🔗 Referral" }[s] ?? s;
}
