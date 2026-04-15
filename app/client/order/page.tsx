"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { expirePendingOrders, getOrderById } from "@/src/lib/orders";
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

function formatDeliveryCountdown(dateIso: string | null | undefined) {
  if (!dateIso) return "Sin fecha";
  const now = new Date().getTime();
  const end = new Date(dateIso).getTime();
  const diff = end - now;

  if (diff <= 0) return "Fecha alcanzada";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days} días ${hours} hrs`;
}

export default function ClientOrderPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    expirePendingOrders();
    setOrder(getOrderById(orderId));
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const timer = window.setInterval(() => {
      expirePendingOrders();
      setOrder(getOrderById(orderId));
      setTick((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [orderId]);

  if (!order) {
    return (
      <main className="page-shell">
        <header className="site-header">
          <div className="site-container flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="logo-badge">RAW</div>
              <div>
                <p className="text-base font-semibold tracking-tight">RAW</p>
                <p className="text-sm text-neutral-500">
                  Vista comprador · orden
                </p>
              </div>
            </Link>
          </div>
        </header>

        <section className="site-container py-14 lg:py-20">
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
            <h1 className="text-2xl font-semibold text-neutral-950">
              No se encontró la orden
            </h1>
            <p className="mt-3 text-neutral-600">
              Revisa el número de orden o genera una nueva solicitud.
            </p>
            <Link
              href="/client/materials"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ir al marketplace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const isExpired = order.status === "expired";
  const showDeliveryPanel =
    order.status === "confirmed" || order.status === "admin_override";

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">
                Vista comprador · orden
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/client/materials" className="nav-link">
              Marketplace
            </Link>
            <Link href="/client/orders" className="nav-link">
              Mis órdenes
            </Link>
            <Link href="/client/cart" className="nav-link">
              Carrito
            </Link>
          </nav>
        </div>
      </header>

      <section className="site-container py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="glass-card p-8">
              <div
                className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${statusMeta.badgeClass}`}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                {statusMeta.label}
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
                {order.id}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
                {statusMeta.description}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-neutral-50 p-5">
                  <p className="text-xs text-neutral-500">Comprador</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {order.buyer_company}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {order.buyer_name}
                  </p>
                </div>

                <div className="rounded-[24px] bg-neutral-50 p-5">
                  <p className="text-xs text-neutral-500">Gestión</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    Operada por RAW
                  </p>
                </div>

                <div className="rounded-[24px] bg-neutral-50 p-5">
                  <p className="text-xs text-neutral-500">Documento</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {order.document_number || "Pendiente de confirmación"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-neutral-50 p-5">
                  <p className="text-xs text-neutral-500">Lugar de entrega</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {order.delivery_location || "San Luis Potosí, México"}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                Material solicitado
              </h2>

              <div className="mt-6 space-y-4">
                {order.items.map((item) => (
                  <article
                    key={`${order.id}-${item.id}`}
                    className="rounded-[24px] bg-neutral-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                          {item.finish}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-neutral-950">
                          {item.grade}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-500">
                          {item.location}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm md:min-w-[320px]">
                        <div>
                          <p className="text-neutral-500">Espesor</p>
                          <p className="mt-1 font-semibold text-neutral-950">
                            {Number(item.thickness_mm || 0)} mm
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Ancho</p>
                          <p className="mt-1 font-semibold text-neutral-950">
                            {Number(item.width_mm || 0)} mm
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Cantidad</p>
                          <p className="mt-1 font-semibold text-neutral-950">
                            {Number(item.quantity || 0)} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Precio</p>
                          <p className="mt-1 font-semibold text-neutral-950">
                            ${Number(item.price_per_mt || 0).toLocaleString()} USD/MT
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="glass-card h-fit p-8">
            {showDeliveryPanel ? (
              <>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Orden confirmada
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                  Proforma y entrega estimada
                </h2>

                <div className="mt-6 rounded-[24px] bg-neutral-50 p-5">
                  <p className="text-sm text-neutral-500">Documento generado</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    {order.document_number || "PF pendiente"}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">
                    Tipo: {order.document_type || "proforma"}
                  </p>
                </div>

                <div className="mt-5 rounded-[28px] border border-sky-100 bg-sky-50 p-6 text-center">
                  <p className="text-sm text-neutral-500">Entrega estimada</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-sky-700">
                    {formatDeliveryCountdown(order.estimated_delivery_date)}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">
                    Fecha objetivo:{" "}
                    {order.estimated_delivery_date
                      ? new Date(order.estimated_delivery_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <Link
                  href={`/client/proforma?orderId=${order.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Ver / descargar proforma
                </Link>
              </>
            ) : (
              <>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700">
                  <span className="h-2 w-2 rounded-full bg-neutral-900" />
                  Seguimiento en vivo
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                  Tiempo para respuesta
                </h2>

                <div className="mt-6 rounded-[28px] border border-sky-100 bg-sky-50 p-6 text-center">
                  <p className="text-sm text-neutral-500">Cronómetro</p>
                  <p
                    className={`mt-3 text-4xl font-semibold tracking-tight ${
                      isExpired ? "text-red-600" : "text-sky-700"
                    }`}
                  >
                    {formatTimeRemaining(order.supplier_response_deadline)}
                  </p>
                </div>
              </>
            )}

            <div
              className={`mt-6 rounded-[24px] border p-5 ${statusMeta.panelClass}`}
            >
              <p className="text-sm font-medium text-neutral-950">
                {statusMeta.title}
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                {statusMeta.description}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/client/orders"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Ver mis órdenes
              </Link>

              <Link
                href="/client/materials"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Volver al marketplace
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}