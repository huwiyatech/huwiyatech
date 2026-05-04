import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default:  "HuwiyaTech — Your Digital Identity",
    template: "%s | HuwiyaTech",
  },
  description:
    "Create your smart NFC bracelet profile. Share your social links, CV, and portfolio with a single tap.",
  authors:  [{ name: "Mhamed Faris" }],
  creator:  "Mhamed Faris",
  keywords: ["NFC", "bracelet", "digital identity", "smart card", "profile", "HuwiyaTech"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type:      "website",
    siteName:  "HuwiyaTech",
    locale:    "en_US",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "#0f172a",
                color:      "#f8fafc",
                fontSize:   "14px",
                fontFamily: "Inter, sans-serif",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
