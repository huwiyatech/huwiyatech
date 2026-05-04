"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - allowed"),
  email:    z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path:    ["confirm"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:    data.email.toLowerCase(),
          password: data.password,
          username: data.username.toLowerCase(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInRes = await signIn("credentials", {
        redirect:  false,
        email:     data.email.toLowerCase(),
        password:  data.password,
        callbackUrl: "/dashboard",
      });

      if (signInRes?.error) {
        toast.error("Account created — please log in.");
        router.push("/login");
      } else {
        toast.success("Welcome! Your profile is ready 🎉");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const username = watch("username") ?? "";
  const profileUrl = username ? `huwiyatech.com/u/${username.toLowerCase()}` : "huwiyatech.com/u/yourname";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl">
            <span className="text-3xl">⬡</span> HuwiyaTech
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Create your free profile</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-6">Get started</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Choose a username</label>
              <input
                {...register("username")}
                type="text"
                placeholder="yourname"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
              {errors.username ? (
                <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">
                  Your profile: <span className="text-brand-400">{profileUrl}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <input
                {...register("confirm")}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
              {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Creating account…</>
              ) : (
                "Create free account"
              )}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
