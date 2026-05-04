"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  currentUrl: string | null;
}

export function CVUpload({ currentUrl }: Props) {
  const [url, setUrl]         = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("CV must be under 10 MB");
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("type", "cv");

    try {
      const res  = await fetch("/api/profile/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setUrl(json.data.url);
      toast.success("CV uploaded!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-slate-900 mb-4">CV / Resume</h2>

      {url ? (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
          <span className="text-2xl">📄</span>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">CV uploaded</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:underline"
            >
              Preview →
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-3">No CV uploaded yet</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-sm w-full"
      >
        {uploading ? "Uploading…" : url ? "Replace CV" : "Upload CV (PDF)"}
      </button>
      <p className="text-xs text-slate-400 mt-2">PDF only · max 10 MB</p>
    </div>
  );
}
