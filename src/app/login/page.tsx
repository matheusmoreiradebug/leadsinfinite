"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Infinity, Eye, EyeOff, Loader2 } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router     = useRouter();
  const params     = useSearchParams();
  const from       = params.get("from") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
    } else {
      setError("Senha incorreta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
            <Infinity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Infinite Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard administrativo</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-1">Entrar</h2>
          <p className="text-sm text-slate-500 mb-6">Digite a senha de acesso</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 pr-11 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
              ) : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
