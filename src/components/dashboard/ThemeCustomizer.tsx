"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { THEMES } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  currentTheme: string;
  currentColor: string;
}

export function ThemeCustomizer({ currentTheme, currentColor }: Props) {
  const [theme, setTheme]   = useState(currentTheme);
  const [color, setColor]   = useState(currentColor);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ theme, primaryColor: color }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Theme saved!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save theme");
    }
    setSaving(false);
  }

  const isDirty = theme !== currentTheme || color !== currentColor;

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Theme</h2>

      {/* Theme picker */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative rounded-xl overflow-hidden h-14 text-xs font-semibold text-white transition-all ${
              theme === t.id ? "ring-2 ring-brand-600 ring-offset-1 scale-105" : "hover:scale-102 opacity-80 hover:opacity-100"
            }`}
            style={{ background: t.preview }}
            title={t.label}
          >
            {t.label}
            {theme === t.id && (
              <span className="absolute top-1 right-1 text-white text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Accent color */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Accent color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
          />
          <span className="text-sm text-slate-600 font-mono">{color}</span>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !isDirty}
        className="btn-primary w-full text-sm"
      >
        {saving ? "Saving…" : "Apply theme"}
      </button>
    </div>
  );
}
