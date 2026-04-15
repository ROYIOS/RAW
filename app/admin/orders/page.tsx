"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  expirePendingOrders,
  getOrders,
  updateOrderStatus,
} from "@/src/lib/orders";
import type { Order } from "@/src/lib/models";
import { getOrderStatusMeta } from "@/src/lib/orderStatus";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = () => {
    expirePendingOrders();
    setOrders(getOrders());
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleOverride = (orderId: string) => {
    updateOrderStatus(orderId, "admin_override");
    refreshOrders();
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, "rejected");
    refreshOrders();
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Panel admin</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/client/materials" className="nav-link">
              Cliente
            </Link>
            <Link href="/seller/orders" className="nav-link">
              Proveedor
            </Link>
            <Link href="/admin/orders" className="nav-link-active">
              Admin RAW
            </Link>
          </nav>
        </div>
      </header>

      <section className="site-container py-14">
        <div className="mb-8">
          <div className="mb-5 section-pill">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            RAW · control operativo
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Órdenes y override manual
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-600">
            Aquí RAW puede intervenir si el proveedor tarda en responder o si se
            requiere forzar una confirmación operativa.
          </p>
        </div>

        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-600">
              No hay órdenes todavía.
            </div>
          ) : (
            orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);

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
                          <p className="text-sm text-neutral-500">Estatus</p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {statusMeta.label}
                          </p>
                        </div>

                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">
                            Deadline proveedor
                          </p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {new Date(
                              order.supplier_response_deadline
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">Total</p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            ${Number(order.total || 0).toLocaleString()} USD
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
                        onClick={() => handleOverride(order.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        Confirmar como RAW
                      </button>

                      <button
                        onClick={() => handleReject(order.id)}
                        className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Rechazar orden
                      </button>
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