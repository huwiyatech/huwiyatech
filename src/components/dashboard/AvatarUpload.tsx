"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  currentUrl: string | null;
}

export function AvatarUpload({ currentUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const router    = useRouter();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("type", "avatar");

    try {
      const res  = await fetch("/api/profile/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success("Avatar updated!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setPreview(currentUrl); // revert preview
    }
    setUploading(false);
  }

  return (
    <div className="card p-6 flex flex-col items-center gap-4">
      <h2 className="font-semibold text-slate-900 self-start">Profile picture</h2>

      <div className="relative">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            width={100}
            height={100}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl text-slate-400">
            👤
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <span className="text-white text-xl animate-spin">⟳</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-sm w-full"
      >
        {uploading ? "Uploading…" : "Change photo"}
      </button>
      <p className="text-xs text-slate-400">JPG, PNG, WebP · max 5 MB</p>
    </div>
  );
}
