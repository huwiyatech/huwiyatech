"use client";

import { generateVCard } from "@/lib/utils";
import type { User, Profile } from "@prisma/client";

interface Props {
  user: User & { profile: Profile | null };
}

export function VCardButton({ user }: Props) {
  const p    = user.profile as any;
  const name = p?.displayName ?? user.username;

  function download() {
    const vcard = generateVCard({
      name,
      email:    p?.email    || undefined,
      phone:    p?.phone    || undefined,
      whatsapp: p?.whatsapp || undefined,
      website:  p?.website  || undefined,
      jobTitle: p?.jobTitle || undefined,
      company:  p?.company  || undefined,
      location: p?.location || undefined,
      bio:      p?.bio      || undefined,
    });

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${user.username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="flex-1 min-w-[120px] py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
      style={{
        background:  "var(--profile-border)",
        color:       "var(--profile-text)",
        borderColor: "var(--profile-border)",
      }}
    >
      👤 Save Contact
    </button>
  );
}
