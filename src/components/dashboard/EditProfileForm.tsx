"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useState } from "react";
import type { Profile } from "@prisma/client";

// Extended profile type with new fields
type FullProfile = Profile & {
  phone?:    string | null;
  whatsapp?: string | null;
  email?:    string | null;
  company?:  string | null;
};

const schema = z.object({
  // Identity
  displayName: z.string().max(60,  "Max 60 characters").optional(),
  jobTitle:    z.string().max(80,  "Max 80 characters").optional(),
  company:     z.string().max(80,  "Max 80 characters").optional(),
  location:    z.string().max(80,  "Max 80 characters").optional(),
  bio:         z.string().max(500, "Max 500 characters").optional(),
  // Contact
  phone:    z.string().max(30, "Max 30 characters").optional(),
  whatsapp: z.string().max(30, "Max 30 characters").optional(),
  email:    z.string().email("Enter a valid email").or(z.literal("")).optional(),
  website:  z.string().url("Must start with https://").or(z.literal("")).optional(),
  // Settings
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  profile: FullProfile | null;
}

export function EditProfileForm({ profile }: Props) {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      jobTitle:    profile?.jobTitle    ?? "",
      company:     profile?.company  ?? "",
      location:    profile?.location    ?? "",
      bio:         profile?.bio         ?? "",
      phone:       profile?.phone    ?? "",
      whatsapp:    profile?.whatsapp ?? "",
      email:       profile?.email    ?? "",
      website:     profile?.website     ?? "",
      isPublic:    profile?.isPublic    ?? true,
    },
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res  = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    }
    setSaving(false);
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-slate-900 mb-5">Profile info</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Identity ──────────────────────────────────────────────────── */}
        <div>
          <SectionLabel icon="👤" label="Identity" />
          <div className="space-y-3 mt-3">
            <Field label="Full name" error={errors.displayName?.message}>
              <input
                {...register("displayName")}
                placeholder="e.g. Mhamed Faris"
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Job title" error={errors.jobTitle?.message}>
                <input
                  {...register("jobTitle")}
                  placeholder="e.g. Software Engineer"
                  className="input-field"
                />
              </Field>
              <Field label="Company / Organisation" error={errors.company?.message}>
                <input
                  {...register("company")}
                  placeholder="e.g. Google"
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="Location" error={errors.location?.message}>
              <input
                {...register("location")}
                placeholder="e.g. Algiers, Algeria"
                className="input-field"
              />
            </Field>

            <Field label={`Bio (${bioValue.length}/500)`} error={errors.bio?.message}>
              <textarea
                {...register("bio")}
                rows={4}
                placeholder="A short description about yourself — who you are, what you do…"
                className="input-field resize-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <div>
          <SectionLabel icon="📞" label="Contact" />
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Phone number" error={errors.phone?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">📞</span>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+213 555 000 000"
                    className="input-field pl-9"
                  />
                </div>
              </Field>

              <Field label="WhatsApp" error={errors.whatsapp?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">💬</span>
                  <input
                    {...register("whatsapp")}
                    type="tel"
                    placeholder="+213 555 000 000"
                    className="input-field pl-9"
                  />
                </div>
              </Field>
            </div>

            <Field label="Contact email (public)" error={errors.email?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">✉️</span>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="contact@example.com"
                  className="input-field pl-9"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Shown on your public profile. Different from your login email.</p>
            </Field>

            <Field label="Website" error={errors.website?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">🌐</span>
                <input
                  {...register("website")}
                  placeholder="https://yoursite.com"
                  className="input-field pl-9"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* ── Settings ──────────────────────────────────────────────────── */}
        <div>
          <SectionLabel icon="⚙️" label="Settings" />
          <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <input
              {...register("isPublic")}
              type="checkbox"
              id="isPublic"
              className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="isPublic" className="text-sm text-slate-700 cursor-pointer flex-1">
              <span className="font-medium">Public profile</span>
              <span className="block text-xs text-slate-400">When off, your profile page shows "not found" to visitors</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !isDirty}
          className="btn-primary w-full"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      <span>{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
