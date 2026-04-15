"use client";

import Link from "next/link";
import { useMemo } from "react";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";
import { getOrders } from "@/src/lib/orders";
import type { Order } from "@/src/lib/models";

type DemoRole = "buyer" | "seller" | "admin";

type SellerStat = {
  name: string;
  mt: number;
  orders: number;
  avgResponseHours: number;
  acceptanceRate: number;
};

function getResolvedOrders(orders: Order[]) {
  return orders.filter(
    (order) =>
      order.status === "confirmed" ||
      order.status === "admin_override" ||
      order.status === "rejected"
  );
}

function getSoldOrders(orders: Order[]) {
  return orders.filter(
    (order) => order.status === "confirmed" || order.status === "admin_override"
  );
}

function getTotalSoldMt(orders: Order[]) {
  return orders.reduce((sum, order) => {
    const mt = order.items.reduce(
      (itemSum, item) => itemSum + Number(item.quantity || 0),
      0
    );
    return sum + mt;
  }, 0);
}

function getRawCommissionUsd(totalMt: number) {
  return totalMt * 25;
}

function getRawLogisticsUsd(totalMt: number) {
  return totalMt * 10;
}

function getTopSeller(orders: Order[]) {
  const sellerMap = new Map<string, number>();

  for (const order of orders) {
    const mt = order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const sellerName = order.supplier_name || "Sin proveedor";
    sellerMap.set(sellerName, (sellerMap.get(sellerName) || 0) + mt);
  }

  const ranking = Array.from(sellerMap.entries())
    .map(([name, mt]) => ({ name, mt }))
    .sort((a, b) => b.mt - a.mt);

  return ranking[0] ?? { name: "N/A", mt: 0 };
}

function getCityDemandRanking(orders: Order[]) {
  const cityMap = new Map<string, number>();

  for (const order of orders) {
    const city = order.delivery_location || "Sin ciudad";
    const mt = order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    cityMap.set(city, (cityMap.get(city) || 0) + mt);
  }

  return Array.from(cityMap.entries())
    .map(([city, mt]) => ({ city, mt }))
    .sort((a, b) => b.mt - a.mt);
}

function getAverageDaysBetweenSales(orders: Order[]) {
  const dates = orders
    .map((order) => order.confirmed_at)
    .filter(Boolean)
    .map((date) => new Date(date as string).getTime())
    .sort((a, b) => a - b);

  if (dates.length < 2) return 0;

  let totalDiff = 0;

  for (let i = 1; i < dates.length; i += 1) {
    totalDiff += dates[i] - dates[i - 1];
  }

  const avgMs = totalDiff / (dates.length - 1);
  return avgMs / (1000 * 60 * 60 * 24);
}

function getAverageMtPerOrder(orders: Order[]) {
  if (orders.length === 0) return 0;
  return getTotalSoldMt(orders) / orders.length;
}

function getSellerPerformanceStats(allOrders: Order[]) {
  const sellerMap = new Map<
    string,
    {
      soldMt: number;
      totalOrders: number;
      acceptedOrders: number;
      responseHoursTotal: number;
      responseCount: number;
    }
  >();

  for (const order of allOrders) {
    const sellerName = order.supplier_name || "Sin proveedor";
    const current = sellerMap.get(sellerName) ?? {
      soldMt: 0,
      totalOrders: 0,
      acceptedOrders: 0,
      responseHoursTotal: 0,
      responseCount: 0,
    };

    current.totalOrders += 1;

    if (order.status === "confirmed" || order.status === "admin_override") {
      current.acceptedOrders += 1;

      const mt = order.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
      current.soldMt += mt;
    }

    const createdAt = new Date(order.created_at).getTime();
    const resolvedAt =
      order.confirmed_at && !Number.isNaN(new Date(order.confirmed_at).getTime())
        ? new Date(order.confirmed_at).getTime()
        : null;

    if (resolvedAt && resolvedAt >= createdAt) {
      current.responseHoursTotal +=
        (resolvedAt - createdAt) / (1000 * 60 * 60);
      current.responseCount += 1;
    }

    sellerMap.set(sellerName, current);
  }

  const stats: SellerStat[] = Array.from(sellerMap.entries()).map(
    ([name, value]) => ({
      name,
      mt: value.soldMt,
      orders: value.totalOrders,
      avgResponseHours:
        value.responseCount > 0
          ? value.responseHoursTotal / value.responseCount
          : 0,
      acceptanceRate:
        value.totalOrders > 0
          ? (value.acceptedOrders / value.totalOrders) * 100
          : 0,
    })
  );

  return stats.sort((a, b) => b.mt - a.mt);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}`;
}

function formatMt(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} MT`;
}

function formatHours(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} hrs`;
}

function formatDays(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} días`;
}

export default function AdminDashboardPage() {
  const session = useMemo(
    () => getDemoSession() as DemoRole | null,
    []
  );

  const allOrders = useMemo(() => getOrders(), []);
  const soldOrders = useMemo(() => getSoldOrders(allOrders), [allOrders]);
  const resolvedOrders = useMemo(() => getResolvedOrders(allOrders), [allOrders]);

  const totalSoldMt = useMemo(() => getTotalSoldMt(soldOrders), [soldOrders]);
  const rawCommissionUsd = useMemo(
    () => getRawCommissionUsd(totalSoldMt),
    [totalSoldMt]
  );
  const rawLogisticsUsd = useMemo(
    () => getRawLogisticsUsd(totalSoldMt),
    [totalSoldMt]
  );
  const rawTotalProfitUsd = rawCommissionUsd + rawLogisticsUsd;

  const topSeller = useMemo(() => getTopSeller(soldOrders), [soldOrders]);
  const cityRanking = useMemo(
    () => getCityDemandRanking(soldOrders),
    [soldOrders]
  );
  const topCity = cityRanking[0] ?? { city: "N/A", mt: 0 };

  const avgDaysBetweenSales = useMemo(
    () => getAverageDaysBetweenSales(soldOrders),
    [soldOrders]
  );
  const avgMtPerOrder = useMemo(
    () => getAverageMtPerOrder(soldOrders),
    [soldOrders]
  );

  const sellerStats = useMemo(
    () => getSellerPerformanceStats(resolvedOrders),
    [resolvedOrders]
  );

  const fastestSeller =
    sellerStats.length > 0
      ? [...sellerStats].sort(
          (a, b) => a.avgResponseHours - b.avgResponseHours
        )[0]
      : null;

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
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
              Este dashboard está disponible solo para el rol admin.
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
              <p className="text-sm text-neutral-500">Panel admin</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/admin" className="nav-link-active">
              Dashboard admin
            </Link>
            <Link href="/admin/orders" className="nav-link">
              Órdenes
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
              RAW · control ejecutivo
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Rentabilidad, velocidad
              <span className="block text-neutral-400">
                y desempeño de vendedores.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Vista ejecutiva para entender cuánto gana RAW, quién mueve más
              material, dónde se vende más y qué proveedores responden más rápido.
            </p>

            <div className="mt-6 rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              Sesión activa como admin:{" "}
              <span className="font-semibold">RAW Admin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">Ganancia total RAW</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {formatMoney(rawTotalProfitUsd)}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Comisión + logística
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">MT vendidas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {totalSoldMt.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Material confirmado
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">Vendedor principal</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
              {topSeller.name}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {formatMt(topSeller.mt)}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-neutral-500">Ciudad con más movimiento</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
              {topCity.city}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {formatMt(topCity.mt)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Rentabilidad RAW
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">Comisión material</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {formatMoney(rawCommissionUsd)}
                </p>
                <p className="mt-2 text-sm text-neutral-500">25 USD / MT</p>
              </div>

              <div className="rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">Ganancia logística</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {formatMoney(rawLogisticsUsd)}
                </p>
                <p className="mt-2 text-sm text-neutral-500">10 USD / MT</p>
              </div>

              <div className="rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">Ingreso total</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-sky-700">
                  {formatMoney(rawTotalProfitUsd)}
                </p>
                <p className="mt-2 text-sm text-neutral-500">Margen bruto RAW</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Ritmo del mercado
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">
                  Cada cuántos días se mueve material
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {formatDays(avgDaysBetweenSales)}
                </p>
              </div>

              <div className="rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">MT promedio por orden</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {formatMt(avgMtPerOrder)}
                </p>
              </div>

              <div className="rounded-[24px] bg-neutral-50 p-5 sm:col-span-2">
                <p className="text-sm text-neutral-500">Vendedor más rápido</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {fastestSeller?.name || "N/A"}
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  {fastestSeller
                    ? `Tiempo promedio: ${formatHours(
                        fastestSeller.avgResponseHours
                      )}`
                    : "Sin datos suficientes"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Ranking de ciudades
            </h2>

            {cityRanking.length === 0 ? (
              <div className="mt-6 rounded-[24px] bg-neutral-50 p-5 text-sm text-neutral-600">
                Aún no hay ventas confirmadas para mostrar ciudades.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {cityRanking.slice(0, 5).map((city, index) => (
                  <div
                    key={`${city.city}-${index}`}
                    className="rounded-[24px] bg-neutral-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          {city.city}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatMt(city.mt)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-sky-700">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Desempeño de vendedores
            </h2>

            {sellerStats.length === 0 ? (
              <div className="mt-6 rounded-[24px] bg-neutral-50 p-5 text-sm text-neutral-600">
                Aún no hay órdenes suficientes para medir desempeño.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {sellerStats.slice(0, 5).map((seller, index) => (
                  <div
                    key={`${seller.name}-${index}`}
                    className="rounded-[24px] bg-neutral-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          {seller.name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatMt(seller.mt)} · {seller.orders} órdenes
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-neutral-500">
                          Resp. promedio
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-950">
                          {formatHours(seller.avgResponseHours)}
                        </p>
                        <p className="mt-1 text-xs text-sky-700">
                          {seller.acceptanceRate.toFixed(1)}% aceptación
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 glass-card p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Acción rápida
          </h2>

          <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-600">
            Desde aquí puedes ir al detalle operativo para validar órdenes,
            detectar cuellos de botella y revisar quién está respondiendo más
            lento de lo esperado.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ver órdenes admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
