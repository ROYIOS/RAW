"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderById } from "@/src/lib/orders";

export default function ClientProformaPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const order = orderId ? getOrderById(orderId) : null;

  const handlePrint = () => {
    window.print();
  };

  const emailHref =
    order && order.document_number
      ? `mailto:${encodeURIComponent(
          order.buyer_email
        )}?subject=${encodeURIComponent(
          `Proforma ${order.document_number}`
        )}&body=${encodeURIComponent(
          `Hola ${order.buyer_name},

Adjunto referencia de tu proforma ${order.document_number} correspondiente a la orden ${order.id}.

Entrega: ${order.delivery_location || "San Luis Potosí, México"}
Total: $${Number(order.total || 0).toLocaleString()} USD

Gracias.`
        )}`
      : "#";

  if (!order) {
    return (
      <main className="page-shell">
        <div className="site-container py-16">
          <div className="rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
            <h1 className="text-2xl font-semibold text-neutral-950">
              No se encontró la proforma
            </h1>
            <Link
              href="/client/orders"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Volver a mis órdenes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-neutral-900">
      <div className="site-container py-8 print:py-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/client/order?orderId=${order.id}`}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Volver a la orden
          </Link>

          <div className="flex flex-wrap gap-3">
            <a
              href={emailHref}
              className="rounded-2xl border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Llevar al correo
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl rounded-[28px] border border-neutral-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] print:shadow-none">
          <div className="flex flex-col gap-6 border-b border-neutral-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="logo-badge">RAW</div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">
                Proforma
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Documento comercial preliminar
              </p>
            </div>

            <div className="grid gap-3 text-sm md:text-right">
              <div>
                <p className="text-neutral-500">No. de Proforma</p>
                <p className="font-semibold text-neutral-950">
                  {order.document_number || "PF pendiente"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">No. de Orden</p>
                <p className="font-semibold text-neutral-950">{order.id}</p>
              </div>
              <div>
                <p className="text-neutral-500">Fecha</p>
                <p className="font-semibold text-neutral-950">
                  {order.confirmed_at
                    ? new Date(order.confirmed_at).toLocaleDateString()
                    : new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[24px] bg-neutral-50 p-5">
              <p className="text-sm text-neutral-500">Cliente</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">
                {order.buyer_company}
              </p>
              <p className="mt-1 text-sm text-neutral-700">{order.buyer_name}</p>
              <p className="mt-1 text-sm text-neutral-700">{order.buyer_email}</p>
            </div>

            <div className="rounded-[24px] bg-neutral-50 p-5">
              <p className="text-sm text-neutral-500">Entrega</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">
                {order.delivery_location || "San Luis Potosí, México"}
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                Gestión comercial operada por RAW
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                ETA:
                {" "}
                {order.estimated_delivery_date
                  ? new Date(order.estimated_delivery_date).toLocaleDateString()
                  : "Por confirmar"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-[24px] border border-neutral-200">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Material
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Espesor
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Ancho
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Cantidad
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Precio/MT
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={`${order.id}-${item.id}`} className="border-b border-neutral-100">
                    <td className="px-4 py-3 text-neutral-700">
                      {item.grade} / {item.finish}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {item.thickness_mm} mm
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {item.width_mm} mm
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {item.quantity} MT
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      ${Number(item.price_per_mt || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-950">
                      $
                      {Number(
                        Number(item.quantity || 0) * Number(item.price_per_mt || 0)
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="rounded-[24px] bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-950">
                Condiciones comerciales
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Esta proforma está sujeta a disponibilidad confirmada, validación
                final logística y condiciones comerciales aplicables. Los tiempos
                de entrega se muestran de forma estimada a 5 días hábiles a partir
                de la confirmación.
              </p>
            </div>

            <div className="rounded-[24px] bg-neutral-50 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold text-neutral-950">
                  ${Number(order.subtotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-neutral-500">Freight</span>
                <span className="font-semibold text-neutral-950">
                  ${Number(order.freight || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 h-px bg-neutral-200" />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Total</span>
                <span className="text-2xl font-semibold tracking-tight text-neutral-950">
                  ${Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}