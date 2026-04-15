"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";
import { getCartCount } from "@/src/lib/cart";

type HeaderMode = "public" | "buyer" | "seller" | "admin";

type AppHeaderProps = {
  subtitle: string;
  mode: HeaderMode;
};

export default function AppHeader({ subtitle, mode }: AppHeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [sessionRole, setSessionRole] = useState("");

  useEffect(() => {
    const session = getDemoSession();
    setSessionRole(session?.role || "");
    setCartCount(getCartCount());
  }, []);

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
  };

  const nav = useMemo(() => {
    if (mode === "buyer") {
      return (
        <>
          <Link href="/client/materials" className="nav-link">
            Marketplace
          </Link>
          <Link href="/client/orders" className="nav-link">
            Mis órdenes
          </Link>
          <Link href="/client/cart" className="cart-pill">
            Carrito
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-950 px-2 text-xs font-semibold text-white">
              {cartCount}
            </span>
          </Link>
        </>
      );
    }

    if (mode === "seller") {
      return (
        <>
          <Link href="/upload" className="nav-link">
            Dashboard
          </Link>
          <Link href="/seller/orders" className="nav-link">
            Órdenes
          </Link>
          <button
            onClick={handleLogout}
            className="nav-link"
            type="button"
          >
            Cerrar sesión
          </button>
        </>
      );
    }

    if (mode === "admin") {
      return (
        <>
          <Link href="/admin/orders" className="nav-link">
            Admin RAW
          </Link>
          <Link href="/seller/orders" className="nav-link">
            Portal proveedor
          </Link>
          <button
            onClick={handleLogout}
            className="nav-link"
            type="button"
          >
            Cerrar sesión
          </button>
        </>
      );
    }

    return (
      <>
        <Link href="/client/materials" className="nav-link">
          Cliente
        </Link>
        <Link href="/upload" className="nav-link">
          Vendedor
        </Link>
        <Link href="/login" className="cart-pill">
          Acceso demo
        </Link>
      </>
    );
  }, [mode, cartCount]);

  return (
    <header className="site-header">
      <div className="site-container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="logo-badge">RAW</div>
          <div>
            <p className="text-base font-semibold tracking-tight">RAW</p>
            <p className="text-sm text-neutral-500">{subtitle}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav}
        </nav>
      </div>

      {sessionRole ? (
        <div className="site-container pb-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-500">
            Sesión:
            <span className="font-semibold text-neutral-900">{sessionRole}</span>
          </div>
        </div>
      ) : null}
    </header>
  );
}