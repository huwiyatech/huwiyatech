"use client";

interface DataPoint {
  date: string;
  count: number;
}

interface Props {
  data: DataPoint[];
}

export function AnalyticsChart({ data }: Props) {
  const max    = Math.max(...data.map((d) => d.count), 1);
  const recent = data.slice(-30);

  return (
    <div className="w-full">
      {/* Bar chart */}
      <div className="flex items-end gap-0.5 h-32">
        {recent.map((d, i) => {
          const height = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
              <div
                className="w-full rounded-t transition-all duration-300 bg-brand-500 group-hover:bg-brand-600"
                style={{ height: `${Math.max(height, d.count > 0 ? 4 : 0)}%`, minHeight: d.count > 0 ? "4px" : "1px" }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {d.count} scan{d.count !== 1 ? "s" : ""}<br />
                <span className="text-slate-400">{formatDateShort(d.date)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels — show every 5th label */}
      <div className="flex mt-2">
        {recent.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            {i % 5 === 0 && (
              <span className="text-xs text-slate-400">{formatDateShort(d.date)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 flex gap-4 text-sm text-slate-500">
        <span>Total: <strong className="text-slate-900">{data.reduce((s, d) => s + d.count, 0)}</strong></span>
        <span>Peak: <strong className="text-slate-900">{max}</strong> on {data.find((d) => d.count === max)?.date ?? "—"}</span>
      </div>
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
