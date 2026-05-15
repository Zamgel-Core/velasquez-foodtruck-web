// 📍 Ruta: src/features/admin/auth/AdminLoginPage.tsx

import React from "react";
import { Lock, Mail, Truck } from "lucide-react";
import { signInStaff } from "./auth.service";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await signInStaff(email.trim(), password);

      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-500/30 bg-orange-500/15 text-orange-200">
            <Truck className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-black">Admin Login</h1>

          <p className="mt-2 text-sm font-semibold text-white/50">
            Velasquez Food Truck Staff Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-bold text-white/70">
            Email
          </span>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
              placeholder="admin@email.com"
            />
          </div>
        </label>

        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-bold text-white/70">
            Password
          </span>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
              placeholder="••••••••"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-orange-600 px-5 py-4 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar al portal"}
        </button>

        <p className="mt-5 text-center text-xs font-semibold text-white/35">
          Velasquez Food Truck × Zamgel Core
        </p>
      </form>
    </main>
  );
}