"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addToCart, getCart, getCartCount } from "@/src/lib/cart";
import { getVisibleInventoryForClient } from "@/src/lib/sellerInventory";
import type { Listing } from "@/src/lib/models";

export default function ClientMaterialsPage() {
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [inventoryVersion, setInventoryVersion] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());

    const handleFocus = () => {
      setCartCount(getCartCount());
      setInventoryVersion((prev) => prev + 1);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const inventory = useMemo(() => getVisibleInventoryForClient(), [inventoryVersion]);

  const filteredListings = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) return inventory;

    return inventory.filter((item: Listing) => {
      return (
        item.grade.toLowerCase().includes(search) ||
        item.finish.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search) ||
        String(item.thickness_mm).includes(search) ||
        String(item.width_mm).includes(search)
      );
    });
  }, [query, inventory]);

  const handleAddToCart = (item: Listing) => {
    const currentCart = getCart();

    if (
      currentCart.length > 0 &&
      currentCart.some((cartItem) => cartItem.supplier_id !== item.supplier_id)
    ) {
      alert(
        "Por ahora solo puedes generar una orden por proveedor. Vacía el carrito o termina la orden actual."
      );
      return;
    }

    addToCart(item);
    setCartCount(getCartCount());
    setAddedId(item.id);

    window.setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="site-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-badge">RAW</div>
            <div>
              <p className="text-base font-semibold tracking-tight">RAW</p>
              <p className="text-sm text-neutral-500">
                Marketplace · 
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/client/materials" className="nav-link-active">
              Cliente
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
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(186,230,253,0.35),transparent_28%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" />
        <div className="site-container py-14 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 section-pill">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Inventario disponible
            </div>

           <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
  CON RAW NUNCA FUE TAN FÁCIL
  <span className="block text-neutral-400">
    compra de forma rápida y segura
  </span>
</h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Busca por grado, espsor, el material que necesitas y agrégalo al carrito para generar tu orden.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <input
                type="text"
                placeholder="Buscar por grado, acabado, ubicación, espesor o ancho"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-[22px] border border-transparent bg-transparent px-4 py-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-sky-200 focus:bg-sky-50/40"
              />
            </div>

            <Link
              href="/client/cart"
              className="inline-flex items-center justify-center rounded-[22px] border border-sky-200 bg-white px-6 py-4 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
            >
              Ver carrito
            </Link>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Resultados disponibles
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              {filteredListings.length} materiales encontrados
            </h2>
          </div>

          <p className="text-sm text-neutral-500">
            Precio mostrado en USD por MT
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
            <h3 className="text-xl font-semibold text-neutral-900">
              No encontramos inventario publicado
            </h3>
            <p className="mt-2 text-neutral-600">
              Publica inventario activo desde el portal vendedor para verlo aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((item) => {
              const isAdded = addedId === item.id;

              return (
                <article
                  key={`${item.supplier_id}-${item.id}`}
                  className="soft-hover relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-100/70 blur-3xl" />

                  <div className="relative">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                      Inventario validado por RAW
                    </div>

                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                          {item.finish}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                          {item.grade}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-500">
                          Compra actual: rollo completo
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-right shadow-sm">
                        <p className="text-xs text-neutral-500">Precio</p>
                        <p className="mt-1 text-sm font-semibold text-sky-700">
                          ${item.price_per_mt.toLocaleString()} USD/MT
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-[24px] bg-neutral-50 p-4">
                      <div>
                        <p className="text-xs text-neutral-500">Espesor</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {item.thickness_mm} mm
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Ancho</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {item.width_mm} mm
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Peso del rollo</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {item.available_mt} MT
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Ubicación</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {item.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-neutral-500">Compra</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          Se vende el rollo completo
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`inline-flex min-w-[170px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                          isAdded
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                            : "bg-neutral-950 text-white hover:bg-neutral-800"
                        }`}
                      >
                        {isAdded ? "Agregado" : "Agregar rollo"}
                      </button>
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