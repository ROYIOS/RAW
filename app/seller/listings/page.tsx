"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Listing } from "@/src/lib/models";
import { getSellerInventory } from "@/src/lib/sellerInventory";
import { clearDemoSession, getDemoSession } from "@/src/lib/demoAuth";

function getStatusLabel(status: Listing["inventory_status"]) {
  switch (status) {
    case "active":
      return "Activo";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    case "inactive":
      return "Inactivo";
    default:
      return status;
  }
}

function getStatusClass(status: Listing["inventory_status"]) {
  switch (status) {
    case "active":
      return "border border-green-200 bg-green-50 text-green-700";
    case "reserved":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "sold":
      return "border border-sky-200 bg-sky-50 text-sky-700";
    case "inactive":
      return "border border-neutral-200 bg-neutral-100 text-neutral-700";
    default:
      return "border border-neutral-200 bg-neutral-100 text-neutral-700";
  }
}

export default function SellerListingsPage() {
  const session = useMemo(() => getDemoSession(), []);
  const listings = useMemo(() => getSellerInventory(), []);

  const handleLogout = () => {
    clearDemoSession();
    window.location.href = "/login";
  };

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
            <Link href="/seller/orders" className="nav-link">
              Órdenes
            </Link>
            <Link href="/seller/listings" className="nav-link-active">
              Listings
            </Link>
            <Link href="/login" className="nav-link">
              Cambiar rol
            </Link>
            <button type="button" onClick={handleLogout} className="nav-link">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className="site-container py-14">
        <div className="mb-8">
          <div className="mb-5 section-pill">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Proveedor · listings
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Material publicado
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-600">
            Vista interna del proveedor para revisar el material cargado en la
            plataforma con el modelo actual del inventario.
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

        {listings.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-600">
            No hay material cargado todavía.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-neutral-200 bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    ID
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Grade
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Finish
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Espesor
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Ancho
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Peso total
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Precio
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Ubicación
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold text-neutral-700">
                    Estatus
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3 text-neutral-900">{l.id}</td>
                    <td className="px-4 py-3 text-neutral-900">{l.grade}</td>
                    <td className="px-4 py-3 text-neutral-900">{l.finish}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      {Number(l.thickness_mm).toFixed(2)} mm
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      {Number(l.width_mm).toFixed(2)} mm
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      {Number(l.available_mt).toFixed(2)} MT
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      ${Number(l.price_per_mt).toLocaleString()} USD/MT
                    </td>
                    <td className="px-4 py-3 text-neutral-900">{l.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          l.inventory_status
                        )}`}
                      >
                        {getStatusLabel(l.inventory_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}