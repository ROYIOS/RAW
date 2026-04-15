"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, []);

  return (
    <header className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold">
            RAW
          </div>
          <div className="text-sm text-neutral-500">
            Marketplace · precio por MT
          </div>
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/client/materials">Cliente</Link>
          <Link href="/upload">Vendedor</Link>
          <Link href="/client/cart" className="relative">
            Carrito
            {cartCount > 0 && (
              <span className="ml-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
