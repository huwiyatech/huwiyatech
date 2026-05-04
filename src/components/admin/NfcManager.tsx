"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { NfcTag, User, Profile } from "@prisma/client";

type TagWithUser = NfcTag & {
  user: (Pick<User, "id" | "username"> & { profile: Pick<Profile, "displayName"> | null }) | null;
};
type UnassignedUser = Pick<User, "id" | "username"> & { profile: Pick<Profile, "displayName"> | null };

interface Props {
  tags:            TagWithUser[];
  unassignedUsers: UnassignedUser[];
}

export function NfcManager({ tags: initialTags, unassignedUsers }: Props) {
  const [tags, setTags]       = useState(initialTags);
  const [adding, setAdding]   = useState(false);
  const [newTagId, setNewTagId] = useState("");
  const [label, setLabel]     = useState("");
  const [saving, setSaving]   = useState(false);
  const router = useRouter();

  async function createTag() {
    if (!newTagId.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/nfc", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tagId: newTagId.trim(), label: label.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTags((prev) => [json.data, ...prev]);
      setNewTagId(""); setLabel(""); setAdding(false);
      toast.success("NFC tag created!");
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  }

  async function assignTag(tagId: string, userId: string | null) {
    try {
      const res = await fetch("/api/admin/nfc", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tagId, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTags((prev) =>
        prev.map((t) => t.id === tagId ? json.data : t)
      );
      toast.success(userId ? "Tag assigned!" : "Tag unassigned");
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleActive(tagId: string, current: boolean) {
    try {
      const res  = await fetch("/api/admin/nfc", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tagId, isActive: !current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTags((prev) => prev.map((t) => t.id === tagId ? json.data : t));
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="space-y-6">
      {/* Add tag button */}
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} className="btn-primary text-sm">
          + Register NFC tag
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card p-6 border-brand-200 border-2 space-y-4">
          <h3 className="font-semibold text-slate-900">Register new NFC tag</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag UID</label>
            <input
              value={newTagId}
              onChange={(e) => setNewTagId(e.target.value)}
              placeholder="e.g. 04:A3:2B:6C or any unique ID"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Label (optional)</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Bracelet #042"
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={createTag} disabled={saving} className="btn-primary text-sm">
              {saving ? "Creating…" : "Create tag"}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Tags table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Tag UID</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Label</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Assigned to</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-slate-700">{tag.tagId}</td>
                  <td className="px-4 py-4 text-slate-500">{tag.label ?? "—"}</td>
                  <td className="px-4 py-4">
                    {tag.user ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">
                          {tag.user.profile?.displayName ?? tag.user.username}
                        </span>
                        <a
                          href={`/u/${tag.user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 text-xs hover:underline"
                        >
                          @{tag.user.username}
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(tag.id, tag.isActive)}
                      className={`badge cursor-pointer ${
                        tag.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {tag.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <AssignSelect
                      tag={tag}
                      unassignedUsers={unassignedUsers}
                      onAssign={(userId) => assignTag(tag.id, userId)}
                    />
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No NFC tags registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssignSelect({
  tag,
  unassignedUsers,
  onAssign,
}: {
  tag: TagWithUser;
  unassignedUsers: UnassignedUser[];
  onAssign: (userId: string | null) => void;
}) {
  const options = [
    { value: "", label: "Unassigned" },
    ...(tag.user ? [{ value: tag.user.id, label: `@${tag.user.username}` }] : []),
    ...unassignedUsers.map((u) => ({ value: u.id, label: `@${u.username}` })),
  ];

  return (
    <select
      defaultValue={tag.userId ?? ""}
      onChange={(e) => onAssign(e.target.value || null)}
      className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
