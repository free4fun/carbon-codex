"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: next,
    });
    setBusy(false);
    if (!res || res.error) {
      setErr(res?.error || "Invalid credentials");
      return;
    }
    router.replace(next);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded p-6 grid gap-4">
        <h1 className="text-xl font-semibold">Admin sign in</h1>
        <div>
          <label className="block text-sm font-medium">Email o usuario</label>
          <input
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
            placeholder="tu@correo.com o usuario"
            inputMode="text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {err ? (
          <div role="alert" className="text-sm text-red-500">
            {err}
          </div>
        ) : null}
        <button
          type="submit"
          className="px-4 py-2 rounded border hover:bg-[var(--surface)]"
          disabled={busy}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
