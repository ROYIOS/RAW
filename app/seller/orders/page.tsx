"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  expirePendingOrders,
  getOrders,
  updateOrderStatus,
} from "@/src/lib/orders";
import type { Order } from "@/src/lib/models";
import { getOrderStatusMeta } from "@/src/lib/orderStatus";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";

function formatTimeRemaining(deadline: string) {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return "Expirada";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tick, setTick] = useState(0);
  const session = useMemo(() => getDemoSession(), []);

  const refreshOrders = () => {
    expirePendingOrders();
    setOrders(getOrders());
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      expirePendingOrders();
      setOrders(getOrders());
      setTick((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, "confirmed");
    refreshOrders();
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, "rejected");
    refreshOrders();
  };

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
  };

  const visibleOrders = useMemo(() => orders, [orders, tick]);

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/upload" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Portal proveedor</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/upload" className="nav-link">
              Dashboard
            </Link>
            <Link href="/seller/orders" className="nav-link-active">
              Órdenes
            </Link>
            <Link href="/login" className="nav-link">
              Cambiar rol
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="nav-link"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className="site-container py-14">
        <div className="mb-8">
          <div className="mb-5 section-pill">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Proveedor · órdenes pendientes
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Solicitudes por revisar
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-600">
            Aquí puedes aceptar o rechazar solicitudes. Mientras estén pendientes,
            el inventario relacionado permanece reservado.
          </p>

          {session?.role === "seller" ? (
            <div className="mt-6 rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              Sesión activa como vendedor:{" "}
              <span className="font-semibold">
                {session.company || "Centro de Servicio Demo"}
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          {visibleOrders.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-600">
              No hay órdenes pendientes por revisar.
            </div>
          ) : (
            visibleOrders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const isExpired = order.status === "expired";
              const isResolved =
                order.status === "confirmed" ||
                order.status === "rejected" ||
                order.status === "admin_override";

              const timeRemaining = formatTimeRemaining(
                order.supplier_response_deadline
              );

              return (
                <article key={order.id} className="glass-card p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${statusMeta.badgeClass}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        {statusMeta.label}
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                        {order.id}
                      </h2>

                      <p className="mt-2 text-sm text-neutral-500">
                        {order.buyer_company} · {order.buyer_name}
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">
                            Estatus actual
                          </p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {statusMeta.label}
                          </p>
                        </div>

                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">
                            Total estimado
                          </p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            ${Number(order.total || 0).toLocaleString()} USD
                          </p>
                        </div>

                        <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4">
                          <p className="text-sm text-neutral-500">
                            Tiempo restante
                          </p>
                          <p
                            className={`mt-2 text-xl font-semibold ${
                              timeRemaining === "Expirada"
                                ? "text-red-600"
                                : "text-sky-700"
                            }`}
                          >
                            {timeRemaining}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`mt-5 rounded-[24px] border p-4 ${statusMeta.panelClass}`}
                      >
                        <p className="text-sm font-medium text-neutral-950">
                          {statusMeta.title}
                        </p>
                        <p className="mt-2 text-sm text-neutral-600">
                          {statusMeta.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={isExpired || isResolved}
                        className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Aceptar orden
                      </button>

                      <button
                        onClick={() => handleReject(order.id)}
                        disabled={isExpired || isResolved}
                        className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Rechazar orden
                      </button>

                      <Link
                        href="/upload"
                        className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                      >
                        Volver al dashboard
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}