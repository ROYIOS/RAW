"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";
import { getOrders, updateOrderStatus } from "@/src/lib/orders";
import type { Order } from "@/src/lib/models";

type DemoRole = "buyer" | "seller" | "admin";

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "pending_supplier":
      return "Pendiente proveedor";
    case "confirmed":
      return "Confirmada";
    case "admin_override":
      return "Override admin";
    case "rejected":
      return "Rechazada";
    case "expired":
      return "Expirada";
    default:
      return status;
  }
}

function getStatusClass(status: Order["status"]) {
  switch (status) {
    case "pending_supplier":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "confirmed":
      return "border border-green-200 bg-green-50 text-green-700";
    case "admin_override":
      return "border border-sky-200 bg-sky-50 text-sky-700";
    case "rejected":
      return "border border-red-200 bg-red-50 text-red-700";
    case "expired":
      return "border border-neutral-200 bg-neutral-100 text-neutral-700";
    default:
      return "border border-neutral-200 bg-neutral-100 text-neutral-700";
  }
}

export default function AdminOrdersPage() {
  const session = useMemo(
    () => getDemoSession() as DemoRole | null,
    []
  );
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const refreshOrders = () => {
    setOrders(getOrders());
  };

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
  };

  const handleOverride = (orderId: string) => {
    updateOrderStatus(orderId, "admin_override");
    refreshOrders();
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, "rejected");
    refreshOrders();
  };

  if (session !== "admin") {
    return (
      <main className="page-shell">
        <section className="site-container py-16">
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
            <h1 className="text-2xl font-semibold text-neutral-950">
              Acceso restringido
            </h1>
            <p className="mt-3 text-neutral-600">
              Esta vista está disponible solo para el rol admin.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ir a login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Órdenes admin</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/admin" className="nav-link">
              Dashboard admin
            </Link>
            <button type="button" onClick={handleLogout} className="nav-link">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(186,230,253,0.26),transparent_24%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" />
        <div className="site-container py-14 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 section-pill">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Admin · órdenes y override manual
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Órdenes y override manual
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Revisa pedidos, detecta retrasos y aplica override manual cuando
              sea necesario para mantener el flujo operativo.
            </p>
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-14">
        {orders.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
            <h2 className="text-2xl font-semibold text-neutral-950">
              No hay órdenes registradas
            </h2>
            <p className="mt-3 text-neutral-600">
              Cuando existan órdenes aparecerán aquí para gestión admin.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="glass-card p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusClass(
                        order.status
                      )}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                      {getStatusLabel(order.status)}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                      {order.id}
                    </h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-4">
                      <div className="rounded-[24px] bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Cliente</p>
                        <p className="mt-2 font-semibold text-neutral-950">
                          {order.buyer_company}
                        </p>
                      </div>

                      <div className="rounded-[24px] bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Proveedor</p>
                        <p className="mt-2 font-semibold text-neutral-950">
                          {order.supplier_name}
                        </p>
                      </div>

                      <div className="rounded-[24px] bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Total</p>
                        <p className="mt-2 font-semibold text-neutral-950">
                          ${Number(order.total || 0).toLocaleString()} USD
                        </p>
                      </div>

                      <div className="rounded-[24px] bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Entrega</p>
                        <p className="mt-2 font-semibold text-neutral-950">
                          {order.delivery_location || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleOverride(order.id)}
                      className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Override admin
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(order.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Rechazar
                    </button>

                    <Link
                      href="/admin"
                      className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                    >
                      Volver a Dashboard admin
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
