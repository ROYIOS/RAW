"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  clearDemoSession,
  getDemoSession,
  setDemoSession,
} from "@/src/lib/demoAuth";

type DemoRole = "buyer" | "seller" | "admin";

export default function LoginPage() {
  const session = useMemo(() => getDemoSession(), []);

  const handleLogin = (role: DemoRole) => {
    setDemoSession(role);

    if (role === "buyer") {
      window.location.href = "/client/materials";
      return;
    }

    if (role === "seller") {
      window.location.href = "/upload";
      return;
    }

    window.location.href = "/admin";
  };

  const handleLogout = () => {
    clearDemoSession();
    window.location.reload();
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Acceso demo</p>
            </div>
          </Link>

          {session ? (
            <button type="button" onClick={handleLogout} className="nav-link">
              Cerrar sesión demo
            </button>
          ) : null}
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(186,230,253,0.28),transparent_24%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" />
        <div className="site-container py-14 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 section-pill">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Demo multirrol
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Entra como comprador,
              <span className="block text-neutral-400">
                vendedor o admin.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Este acceso demo permite probar la plataforma por rol sin backend
              real. La sesión se guarda localmente para navegar el flujo.
            </p>

            {session ? (
              <div className="mt-6 rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                Sesión activa: <span className="font-semibold">{String(session)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <button
            type="button"
            onClick={() => handleLogin("buyer")}
            className="glass-card p-8 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-semibold text-white">
              C
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Comprador demo
            </h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Explora materiales, agrega al carrito, genera órdenes y revisa tus
              estatus.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleLogin("seller")}
            className="glass-card p-8 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-sm font-semibold text-white">
              V
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Vendedor demo
            </h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Sube inventario, descarga plantilla y atiende órdenes pendientes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleLogin("admin")}
            className="glass-card p-8 text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200 text-sm font-semibold text-neutral-950">
              A
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Admin demo
            </h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Supervisa métricas, revisa órdenes y controla el desempeño de la
              operación.
            </p>
          </button>
        </div>
      </section>
    </main>
  );
}