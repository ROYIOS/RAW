"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearDemoSession,
  getDemoSession,
  setDemoSession,
  type DemoRole,
} from "@/src/lib/demoAuth";

export default function LoginPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string>("");

  useEffect(() => {
    const session = getDemoSession();
    setCurrentRole(session?.role || "");
  }, []);

  const handleLogin = (role: DemoRole) => {
    setDemoSession(role);

    if (role === "buyer") {
      router.push("/client/materials");
      return;
    }

    if (role === "seller") {
      router.push("/upload");
      return;
    }

    router.push("/admin/orders");
  };

  const handleLogout = () => {
    clearDemoSession();
    setCurrentRole("");
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

          <Link href="/" className="nav-link">
            Volver
          </Link>
        </div>
      </header>

      <section className="site-container py-16 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 max-w-2xl">
            <div className="mb-5 section-pill">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Demo multirol
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              COMPRAR ACERO NUNCA FUE TAN FACIL
            </h1>

            <p className="mt-5 text-base leading-7 text-neutral-600">
            COMPRA, VENDE Y CONTROLA TUS INVENTARIOS FACIL Y RÁPIDO DESDE UNA SOLA PLATAFORMA.
            </p>
          </div>

          {currentRole ? (
            <div className="mb-8 rounded-[24px] border border-sky-200 bg-sky-50 p-5">
              <p className="text-sm text-neutral-600">
                Sesión activa:
                <span className="ml-2 font-semibold text-neutral-950">
                  {currentRole}
                </span>
              </p>
              <button
                onClick={handleLogout}
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Cerrar sesión demo
              </button>
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-3">
            <article className="glass-card p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-bold text-white">
                C
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                Comprador demo
              </h2>
              <p className="mt-3 text-base leading-7 text-neutral-600">
                Explora materiales, agrega al carrito, genera órdenes y revisa
                tus estatus.
              </p>
              <button
                onClick={() => handleLogin("buyer")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Entrar como comprador
              </button>
            </article>

            <article className="glass-card p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white">
                V
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                Vendedor demo
              </h2>
              <p className="mt-3 text-base leading-7 text-neutral-600">
                Sube inventario, descarga la plantilla y atiende órdenes
                pendientes.
              </p>
              <button
                onClick={() => handleLogin("seller")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Entrar como vendedor
              </button>
            </article>

            <article className="glass-card p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200 text-sm font-bold text-neutral-900">
                A
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                Admin demo
              </h2>
              <p className="mt-3 text-base leading-7 text-neutral-600">
                Supervisa órdenes, revisa expiraciones y ejecuta override desde
                RAW.
              </p>
              <button
                onClick={() => handleLogin("admin")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Entrar como admin
              </button>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}