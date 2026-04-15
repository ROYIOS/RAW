"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCart, getCart, removeFromCart } from "@/src/lib/cart";
import { createOrder } from "@/src/lib/orders";
import type { CartItem, InventoryStatus } from "@/src/lib/models";
import { getDemoSession } from "@/src/lib/demoAuth";

type LegacyCartItem = {
  id?: string | number;
  supplier_id?: string;
  supplier_name?: string;
  grade?: string;
  finish?: string;
  thickness_mm?: number;
  width_mm?: number;
  price_per_mt?: number;
  available_mt?: number;
  location?: string;
  inventory_status?: InventoryStatus;
  quantity?: number;
  thickness?: number;
  width?: number;
  pricePerMT?: number;
  availableMT?: number;
};

function normalizeCartItem(item: LegacyCartItem): CartItem {
  return {
    id: String(item.id ?? `fallback-${Math.random().toString(36).slice(2)}`),
    supplier_id: String(item.supplier_id ?? "seller@demo.com"),
    supplier_name: String(item.supplier_name ?? "Centro de Servicio Demo"),
    grade: item.grade ?? "N/A",
    finish: item.finish ?? "N/A",
    thickness_mm: Number(item.thickness_mm ?? item.thickness ?? 0),
    width_mm: Number(item.width_mm ?? item.width ?? 0),
    price_per_mt: Number(item.price_per_mt ?? item.pricePerMT ?? 0),
    available_mt: Number(item.available_mt ?? item.availableMT ?? 0),
    location: item.location ?? "N/A",
    inventory_status: item.inventory_status ?? "active",
    quantity: Number(item.quantity ?? item.available_mt ?? item.availableMT ?? 0),
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCart = () => {
    const rawItems = getCart() as LegacyCartItem[];
    const normalizedItems = rawItems.map(normalizeCartItem);
    setCartItems(normalizedItems);
    setCartCount(normalizedItems.length);
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    refreshCart();
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
    setCartCount(0);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    const session = getDemoSession();
    const buyer =
      session?.role === "buyer"
        ? session
        : {
            name: "Demo Buyer",
            company: "Demo Company",
            email: "buyer@demo.com",
          };

    const supplierName = cartItems[0]?.supplier_name || "Centro de Servicio Demo";
    const deliveryLocation = cartItems[0]?.location || "San Luis Potosí, México";

    const order = await createOrder({
      buyer_name: buyer.name,
      buyer_company: buyer.company,
      buyer_email: buyer.email,
      supplier_name: supplierName,
      delivery_location: deliveryLocation,
      items: cartItems,
      notes: "Orden generada desde ambiente de prueba.",
    });

    clearCart();
    setCartItems([]);
    setCartCount(0);

    router.push(`/order-success?orderId=${order.id}`);
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price_per_mt || 0) * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const freight = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return 250;
  }, [cartItems]);

  const total = subtotal + freight;

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

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/client/materials" className="nav-link">
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
              Carrito · resumen de compra
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              Revisa tu carrito
              <span className="block text-neutral-400">
                y genera tu solicitud.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
              Por ahora cada artículo se vende como rollo completo. El peso de compra
              es el peso total disponible del rollo.
            </p>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-16">
        {cartItems.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-neutral-950">
              Tu carrito está vacío
            </h2>
            <p className="mt-3 text-neutral-600">
              Agrega material desde el marketplace para comenzar tu pedido.
            </p>
            <Link
              href="/client/materials"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ir al marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-5">
              {cartItems.map((item) => (
                <article key={item.id} className="glass-card soft-hover p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                        Inventario validado por RAW
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                        {item.finish}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                        {item.grade}
                      </h2>
                      <p className="mt-2 text-sm text-neutral-500">
                        {item.location}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-[24px] bg-neutral-50 p-4 sm:grid-cols-4">
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
                            {item.quantity} MT
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Precio</p>
                          <p className="mt-1 text-sm font-medium text-neutral-900">
                            ${Number(item.price_per_mt || 0).toLocaleString()} USD/MT
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-[170px] flex-col items-start gap-4 md:items-end">
                      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-right shadow-sm">
                        <p className="text-xs text-neutral-500">Subtotal item</p>
                        <p className="mt-1 text-sm font-semibold text-sky-700">
                          $
                          {Number(
                            Number(item.price_per_mt || 0) * Number(item.quantity || 0)
                          ).toLocaleString()}{" "}
                          USD
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="glass-card h-fit p-6">
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-500">Resumen</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                  Total estimado
                </h3>
              </div>

              <div className="mb-5 rounded-[24px] bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">Gestión del pedido</p>
                <p className="mt-2 text-lg font-semibold text-neutral-950">
                  Administrado por RAW
                </p>
              </div>

              <div className="space-y-4 rounded-[24px] bg-neutral-50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-semibold text-neutral-950">
                    ${subtotal.toLocaleString()} USD
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Freight estimado</span>
                  <span className="font-semibold text-neutral-950">
                    ${freight.toLocaleString()} USD
                  </span>
                </div>

                <div className="h-px bg-neutral-200" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">
                    Total
                  </span>
                  <span className="text-xl font-semibold tracking-tight text-neutral-950">
                    ${total.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Generando orden..." : "Confirmar compra"}
                </button>

                <button
                  onClick={handleClearCart}
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Vaciar carrito
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}