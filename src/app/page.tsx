import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">⬡</span>
          <span className="text-white">HuwiyaTech</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-slate-300 mb-8">
          <span className="text-green-400">●</span> Smart NFC technology for real-world networking
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-tight mb-6">
          Your entire digital{" "}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            identity
          </span>
          <br />on your wrist
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance">
          One tap with your NFC bracelet shares your profile, social links, CV, portfolio —
          everything you are, instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 shadow-lg shadow-brand-600/30"
          >
            Create your profile →
          </Link>
          <Link
            href="/u/demo"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-lg rounded-2xl transition-all"
          >
            See live demo
          </Link>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-7 transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl font-extrabold mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center font-bold text-xl">
                {i + 1}
              </div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-slate-400 text-sm text-center">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
        <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-3xl p-12">
          <h2 className="text-3xl font-extrabold mb-4">Ready to tap into the future?</h2>
          <p className="text-white/80 mb-8">Create your profile in 2 minutes. No credit card required.</p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-2xl hover:bg-slate-100 transition-colors inline-block"
          >
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-300 mb-1">HuwiyaTech</p>
        <p>© {new Date().getFullYear()} HuwiyaTech. All rights reserved to Mhamed Faris.</p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🔗",
    title: "One link for everything",
    desc:  "Consolidate all your social profiles, portfolio, and contact info in a single beautiful page.",
  },
  {
    icon: "📱",
    title: "NFC + QR code",
    desc:  "Works with any NFC-enabled smartphone. Also includes a QR code for devices without NFC.",
  },
  {
    icon: "📊",
    title: "Real-time analytics",
    desc:  "See exactly how many people scanned your bracelet, when, and from where.",
  },
  {
    icon: "🎨",
    title: "8 beautiful themes",
    desc:  "Customize colors, gradients, and layout to match your personal brand.",
  },
  {
    icon: "📄",
    title: "CV & portfolio",
    desc:  "Upload your CV as PDF and let people download it with one tap.",
  },
  {
    icon: "💼",
    title: "vCard download",
    desc:  "Let people save your contact directly to their phone contacts with a single button.",
  },
];

const steps = [
  {
    title: "Create your profile",
    desc:  "Sign up, pick a username, and fill in your info — takes under 2 minutes.",
  },
  {
    title: "Get your bracelet",
    desc:  "We ship an NFC bracelet pre-loaded with your unique profile URL.",
  },
  {
    title: "Tap & connect",
    desc:  "Hold your wrist near any phone. They instantly see your profile.",
  },
];
