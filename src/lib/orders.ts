import type { CartItem, Order, OrderStatus } from "@/src/lib/models";
import {
  markInventoryItemsSold,
  reactivateInventoryItems,
  reserveInventoryItems,
} from "@/src/lib/sellerInventory";

const ORDERS_KEY = "raw-orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(ORDERS_KEY);

  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RAW-${year}-${random}`;
}

export function generateDocumentNumber(prefix: "PF" | "INV") {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-RAW-${year}-${random}`;
}

export function addBusinessDays(startDate: Date, businessDays: number) {
  const result = new Date(startDate);
  let added = 0;

  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();

    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }

  return result;
}

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => {
    return total + Number(item.price_per_mt || 0) * Number(item.quantity || 0);
  }, 0);
}

export function calculateFreight(items: CartItem[]) {
  if (items.length === 0) return 0;
  return 250;
}

export async function notifyNewOrderByEmail(params: {
  buyerName: string;
  buyerCompany: string;
  orderId: string;
  totalUsd: number;
}) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("Order notification failed:", error);
  }
}

export async function createOrder(params: {
  buyer_name: string;
  buyer_company: string;
  buyer_email: string;
  supplier_name?: string;
  delivery_location?: string;
  items: CartItem[];
  notes?: string;
}) {
  const orders = getOrders();
  const subtotal = calculateSubtotal(params.items);
  const freight = calculateFreight(params.items);

  const now = new Date();
  const deadline = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const order: Order = {
    id: generateOrderId(),
    created_at: now.toISOString(),
    supplier_response_deadline: deadline.toISOString(),
    buyer_name: params.buyer_name,
    buyer_company: params.buyer_company,
    buyer_email: params.buyer_email,
    supplier_name: params.supplier_name || "Centro de Servicio Demo",
    delivery_location: params.delivery_location || "San Luis Potosí, México",
    status: "pending_supplier",
    items: params.items,
    subtotal,
    freight,
    total: subtotal + freight,
    notes: params.notes || "",
    confirmed_at: null,
    estimated_delivery_date: null,
    document_type: null,
    document_number: null,
  };

  saveOrders([order, ...orders]);

  reserveInventoryItems(params.items.map((item) => item.id));

  await notifyNewOrderByEmail({
    buyerName: params.buyer_name,
    buyerCompany: params.buyer_company,
    orderId: order.id,
    totalUsd: order.total,
  });

  return order;
}

export function getOrderById(orderId: string) {
  return getOrders().find((order) => order.id === orderId) || null;
}

export function getOrdersByBuyerEmail(email: string) {
  return getOrders().filter((order) => order.buyer_email === email);
}

export function expirePendingOrders() {
  const now = new Date();

  const updated = getOrders().map((order) => {
    if (
      order.status === "pending_supplier" &&
      new Date(order.supplier_response_deadline) < now
    ) {
      reactivateInventoryItems(order.items.map((item) => item.id));
      return { ...order, status: "expired" as const };
    }

    return order;
  });

  saveOrders(updated);
  return updated;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const now = new Date();
  const previousOrder = getOrderById(orderId);

  const updatedOrders = getOrders().map((order) => {
    if (order.id !== orderId) return order;

    const updatedOrder: Order = {
      ...order,
      status,
    };

    if (
      (status === "confirmed" || status === "admin_override") &&
      !updatedOrder.confirmed_at
    ) {
      const estimatedDelivery = addBusinessDays(now, 5);

      updatedOrder.confirmed_at = now.toISOString();
      updatedOrder.estimated_delivery_date = estimatedDelivery.toISOString();
      updatedOrder.document_type = "proforma";
      updatedOrder.document_number = generateDocumentNumber("PF");
    }

    return updatedOrder;
  });

  saveOrders(updatedOrders);

  if (previousOrder) {
    const itemIds = previousOrder.items.map((item) => item.id);

    if (status === "confirmed" || status === "admin_override") {
      markInventoryItemsSold(itemIds);
    }

    if (status === "rejected") {
      reactivateInventoryItems(itemIds);
    }
  }

  return updatedOrders.find((order) => order.id === orderId) || null;
}