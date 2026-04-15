"use client";

import Link from "next/link";
import { getOrderById } from "@/src/lib/orders";

export default function OrderSuccessView({
  orderId,
}: {
  orderId: string;
}) {
  const order = orderId ? getOrderById(orderId) : null;

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">
                Marketplace · precio por MT
              </p>
            </div>
          </Link>
        </div>
      </header>

      <section className="site-container py-16 lg:py-24">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-neutral-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Solicitud enviada
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Orden registrada correctamente
          </h1>

          <p className="mt-5 text-base leading-7 text-neutral-600">
            Tu solicitud fue creada y quedó pendiente de confirmación. Ahora
            puedes revisar el estatus y el tiempo restante desde la vista de tu orden.
          </p>

          {order ? (
            <div className="mt-8 rounded-[24px] bg-neutral-50 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500">Número de orden</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Estatus</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-sky-700">
                    {order.status.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Gestión</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    Operada por RAW
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Total estimado</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    ${Number(order.total || 0).toLocaleString()} USD
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] bg-red-50 p-6 text-red-700">
              No se encontró la orden.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {orderId && (
              <Link
                href={`/client/order?orderId=${orderId}`}
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Ver mi orden
              </Link>
            )}

            <Link
              href="/client/orders"
              className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Ver mis órdenes
            </Link>

            <Link
              href="/client/materials"
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Volver al marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}