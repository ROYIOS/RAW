import type { CartItem, Listing } from "@/src/lib/models";

const CART_KEY = "raw-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(CART_KEY);

  try {
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getCartCount() {
  return getCart().length;
}

export function clearCart() {
  saveCart([]);
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

export function addToCart(item: Listing) {
  const cart = getCart();

  const fullRollItem: CartItem = {
    ...item,
    quantity: Number(item.available_mt || 0),
  };

  const exists = cart.find((cartItem) => cartItem.id === item.id);

  if (exists) {
    const updated = cart.map((cartItem) =>
      cartItem.id === item.id ? fullRollItem : cartItem
    );
    saveCart(updated);
    return updated;
  }

  const updated = [...cart, fullRollItem];
  saveCart(updated);
  return updated;
}