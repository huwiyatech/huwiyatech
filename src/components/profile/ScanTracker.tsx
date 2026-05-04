"use client";

import { useEffect } from "react";

interface Props {
  userId: string;
}

// Fire-and-forget analytics call after mount
export function ScanTracker({ userId }: Props) {
  useEffect(() => {
    fetch("/api/analytics/scan", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        userId,
        source:   detectSource(),
        referrer: document.referrer || null,
      }),
    }).catch(() => {/* silent */});
  }, [userId]);

  return null;
}

function detectSource(): string {
  if (typeof window === "undefined") return "DIRECT";
  const params = new URLSearchParams(window.location.search);
  if (params.get("src") === "nfc") return "NFC";
  if (params.get("src") === "qr")  return "QR";
  if (document.referrer)            return "LINK";
  return "DIRECT";
}
