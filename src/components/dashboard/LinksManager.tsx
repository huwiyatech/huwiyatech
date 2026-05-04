"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { SocialLink, CustomLink } from "@prisma/client";
import { SOCIAL_PLATFORMS } from "@/types";
import { useForm } from "react-hook-form";

interface Props {
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
}

export function LinksManager({ socialLinks, customLinks }: Props) {
  const [tab, setTab] = useState<"social" | "custom">("social");

  return (
    <div className="card p-6" id="links">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="font-semibold text-slate-900 flex-1">Links</h2>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {(["social", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {t === "social" ? "Social" : "Custom links"}
            </button>
          ))}
        </div>
      </div>

      {tab === "social" ? (
        <SocialLinksTab links={socialLinks} />
      ) : (
        <CustomLinksTab links={customLinks} />
      )}
    </div>
  );
}

// ─── Social links tab ─────────────────────────────────────────────────────────

function SocialLinksTab({ links }: { links: SocialLink[] }) {
  const [items, setItems]   = useState(links);
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState(SOCIAL_PLATFORMS[0].id);
  const [url, setUrl]       = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function addLink() {
    if (!url.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/links", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "social", platform, url: url.trim(), order: items.length }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setItems((prev) => [...prev, json.data]);
      setUrl(""); setAdding(false);
      toast.success("Link added!");
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  }

  async function deleteLink(id: string) {
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((l) => l.id !== id));
      toast.success("Link removed");
      router.refresh();
    } catch { toast.error("Could not delete link"); }
  }

  const platformConfig = SOCIAL_PLATFORMS.find((p) => p.id === platform);

  return (
    <div className="space-y-2">
      {items.map((link) => {
        const cfg = SOCIAL_PLATFORMS.find((p) => p.id === link.platform);
        return (
          <div key={link.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: (cfg?.color ?? "#64748b") + "22", color: cfg?.color ?? "#64748b" }}
            >
              {socialEmoji(link.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700">{cfg?.label ?? link.platform}</p>
              <p className="text-xs text-slate-400 truncate">{link.url}</p>
            </div>
            <button
              onClick={() => deleteLink(link.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️
            </button>
          </div>
        );
      })}

      {adding ? (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-brand-200">
          <select
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setUrl(""); }}
            className="input-field"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={platformConfig?.placeholder ?? "URL"}
            className="input-field"
          />
          <div className="flex gap-2">
            <button onClick={addLink} disabled={saving} className="btn-primary text-sm flex-1">
              {saving ? "Adding…" : "Add"}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
        >
          + Add social link
        </button>
      )}
    </div>
  );
}

// ─── Custom links tab ─────────────────────────────────────────────────────────

function CustomLinksTab({ links }: { links: CustomLink[] }) {
  const [items, setItems]   = useState(links);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ title: "", url: "", icon: "" });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function addLink() {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/links", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "custom", ...form, order: items.length }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setItems((prev) => [...prev, json.data]);
      setForm({ title: "", url: "", icon: "" });
      setAdding(false);
      toast.success("Link added!");
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "custom", isActive: !current }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((l) => l.id === id ? { ...l, isActive: !current } : l));
    } catch { toast.error("Could not update link"); }
  }

  async function deleteLink(id: string) {
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((l) => l.id !== id));
      toast.success("Link removed");
    } catch { toast.error("Could not delete link"); }
  }

  return (
    <div className="space-y-2">
      {items.map((link) => (
        <div key={link.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
          link.isActive ? "bg-slate-50 border-slate-200" : "bg-slate-50/50 border-slate-100 opacity-60"
        }`}>
          {link.icon && <span className="text-xl flex-shrink-0">{link.icon}</span>}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">{link.title}</p>
            <p className="text-xs text-slate-400 truncate">{link.url}</p>
          </div>
          <button
            onClick={() => toggleActive(link.id, link.isActive)}
            className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
              link.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
            }`}
          >
            {link.isActive ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => deleteLink(link.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      ))}

      {adding ? (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-brand-200">
          <input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="Icon (emoji) optional"
            className="input-field"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Link title (e.g. My Portfolio)"
            className="input-field"
          />
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://…"
            className="input-field"
          />
          <div className="flex gap-2">
            <button onClick={addLink} disabled={saving} className="btn-primary text-sm flex-1">
              {saving ? "Adding…" : "Add"}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
        >
          + Add custom link
        </button>
      )}
    </div>
  );
}

function socialEmoji(platform: string) {
  const map: Record<string, string> = {
    instagram:"📸", linkedin:"💼", twitter:"🐦", facebook:"👤",
    tiktok:"🎵", youtube:"▶️", github:"💻", snapchat:"👻",
    email:"✉️", phone:"📞", whatsapp:"💬", telegram:"✈️",
  };
  return map[platform] ?? "🔗";
}
