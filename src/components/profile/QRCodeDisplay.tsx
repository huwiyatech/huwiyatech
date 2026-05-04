"use client";

import { useState } from "react";

interface Props {
  username: string;
}

export function QRCodeDisplay({ username }: Props) {
  const [show, setShow] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://huwiyatech.com";
  const profileUrl = `${appUrl}/u/${username}?src=qr`;

  // Use a free QR API (no library needed in browser)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=0f172a&margin=10`;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setShow((s) => !s)}
        className="text-xs font-medium transition-colors"
        style={{ color: "var(--profile-muted)" }}
      >
        {show ? "▲ Hide QR code" : "▼ Show QR code"}
      </button>

      {show && (
        <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrApiUrl}
            alt="QR code"
            width={160}
            height={160}
            className="rounded-xl shadow-lg"
          />
          <p className="text-xs" style={{ color: "var(--profile-muted)" }}>
            Scan to open profile
          </p>
        </div>
      )}
    </div>
  );
}
