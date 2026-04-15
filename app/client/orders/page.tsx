"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { expirePendingOrders, getOrdersByBuyerEmail } from "@/src/lib/orders";
import { getDemoSession } from "@/src/lib/demoAuth";
import type { Order } from "@/src/lib/models";
import { getOrderStatusMeta } from "@/src/lib/orderStatus";

function formatTimeRemaining(deadline: string) {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return "Expirada";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [, setTick] = useState(0);

  const refreshOrders = (email: string) => {
    expirePendingOrders();
    setOrders(getOrdersByBuyerEmail(email));
  };

  useEffect(() => {
    const session = getDemoSession();
    const email =
      session?.role === "buyer" ? session.email : "buyer@demo.com";

    setBuyerEmail(email);
    refreshOrders(email);
  }, []);

  useEffect(() => {
    if (!buyerEmail) return;

    const timer = window.setInterval(() => {
      refreshOrders(buyerEmail);
      setTick((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [buyerEmail]);

  const orderedList = useMemo(() => orders, [orders]);

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">Mis órdenes</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/client/materials" className="nav-link">
              Marketplace
            </Link>
            <Link href="/client/orders" className="nav-link-active">
              Mis órdenes
            </Link>
            <Link href="/client/cart" className="nav-link">
              Carrito
            </Link>
          </nav>
        </div>
      </header>

      <section className="site-container py-14">
        <div className="mb-8 max-w-3xl">
          <div className="mb-5 section-pill">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Comprador · seguimiento de órdenes
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Mis órdenes
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            Aquí puedes revisar todas tus solicitudes, su estatus actual, la
            proforma generada y la fecha estimada de entrega cuando ya fueron
            confirmadas.
          </p>
        </div>

        {orderedList.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-neutral-950">
              Aún no tienes órdenes
            </h2>
            <p className="mt-3 text-neutral-600">
              Genera una solicitud desde el marketplace para verla aquí.
            </p>
            <Link
              href="/client/materials"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ir al marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orderedList.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const pending = order.status === "pending_supplier";
              const confirmed =
                order.status === "confirmed" ||
                order.status === "admin_override";

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
                        Proveedor: {order.supplier_name}
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-4">
                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">Total</p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            ${Number(order.total || 0).toLocaleString()} USD
                          </p>
                        </div>

                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">Estatus</p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {statusMeta.label}
                          </p>
                        </div>

                        <div className="rounded-[24px] bg-neutral-50 p-4">
                          <p className="text-sm text-neutral-500">Documento</p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {order.document_number || "Pendiente"}
                          </p>
                        </div>

                        <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4">
                          <p className="text-sm text-neutral-500">
                            Seguimiento
                          </p>
                          <p className="mt-2 font-semibold text-neutral-950">
                            {pending
                              ? formatTimeRemaining(order.supplier_response_deadline)
                              : confirmed
                              ? "Entrega en curso"
                              : "Finalizada"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/client/order?orderId=${order.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        Ver orden
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}