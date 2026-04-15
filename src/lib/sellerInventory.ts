import type {
  InventoryStatus,
  Listing,
  SellerInventoryRow,
  SellerInventoryStats,
} from "@/src/lib/models";
import { getOrders } from "@/src/lib/orders";

const INVENTORY_KEY = "raw-seller-inventory";

export function getSellerInventory(): Listing[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(INVENTORY_KEY);

  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSellerInventory(items: Listing[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function replaceSellerInventory(items: Listing[]) {
  saveSellerInventory(items);
}

export function deleteSellerInventoryItem(id: string) {
  const inventory = getSellerInventory().filter((item) => item.id !== id);
  saveSellerInventory(inventory);
  return inventory;
}

export function updateSellerInventoryStatus(
  id: string,
  inventoryStatus: InventoryStatus
) {
  const inventory = getSellerInventory().map((item) =>
    item.id === id ? { ...item, inventory_status: inventoryStatus } : item
  );

  saveSellerInventory(inventory);
  return inventory;
}

export function getSoldMtByListingId() {
  const orders = getOrders().filter(
    (order) => order.status === "confirmed" || order.status === "admin_override"
  );

  const soldMap: Record<string, number> = {};

  for (const order of orders) {
    for (const item of order.items) {
      soldMap[item.id] = (soldMap[item.id] || 0) + Number(item.quantity || 0);
    }
  }

  return soldMap;
}

export function getInventoryWithRemaining(): SellerInventoryRow[] {
  const inventory = getSellerInventory();
  const soldMap = getSoldMtByListingId();

  const rows = inventory.map((item) => {
    const sold = soldMap[item.id] || 0;
    const remaining = Math.max(Number(item.available_mt || 0) - sold, 0);

    let computedStatus: InventoryStatus = item.inventory_status || "active";

    if (remaining <= 0 && item.inventory_status !== "sold") {
      computedStatus = "sold";
    }

    return {
      ...item,
      inventory_status: computedStatus,
      sold_mt: sold,
      remaining_mt: remaining,
      remaining_value_usd: remaining * Number(item.price_per_mt || 0),
    };
  });

  const normalized = inventory.map((item) => {
    const row = rows.find((r) => r.id === item.id);
    return row
      ? {
          ...item,
          inventory_status: row.inventory_status,
        }
      : item;
  });

  saveSellerInventory(normalized);

  return rows;
}

export function getVisibleInventoryForClient(): Listing[] {
  return getInventoryWithRemaining()
    .filter((item) => item.inventory_status === "active" && item.remaining_mt > 0)
    .map((item) => ({
      id: item.id,
      supplier_id: item.supplier_id,
      supplier_name: item.supplier_name,
      grade: item.grade,
      finish: item.finish,
      thickness_mm: item.thickness_mm,
      width_mm: item.width_mm,
      price_per_mt: item.price_per_mt,
      available_mt: item.remaining_mt,
      location: item.location,
      inventory_status: item.inventory_status,
    }));
}

export function reserveInventoryItems(itemIds: string[]) {
  if (itemIds.length === 0) return getSellerInventory();

  const idSet = new Set(itemIds);
  const inventory = getSellerInventory().map((item) =>
    idSet.has(item.id) && item.inventory_status === "active"
      ? { ...item, inventory_status: "reserved" as const }
      : item
  );

  saveSellerInventory(inventory);
  return inventory;
}

export function markInventoryItemsSold(itemIds: string[]) {
  if (itemIds.length === 0) return getSellerInventory();

  const idSet = new Set(itemIds);
  const inventory = getSellerInventory().map((item) =>
    idSet.has(item.id) ? { ...item, inventory_status: "sold" as const } : item
  );

  saveSellerInventory(inventory);
  return inventory;
}

export function reactivateInventoryItems(itemIds: string[]) {
  if (itemIds.length === 0) return getSellerInventory();

  const idSet = new Set(itemIds);
  const inventory = getSellerInventory().map((item) =>
    idSet.has(item.id) && item.inventory_status !== "sold"
      ? { ...item, inventory_status: "active" as const }
      : item
  );

  saveSellerInventory(inventory);
  return inventory;
}

export function getSellerInventoryStats(): SellerInventoryStats {
  const inventory = getSellerInventory();
  const inventoryWithRemaining = getInventoryWithRemaining();
  const orders = getOrders();

  const totalAvailableMt = inventory.reduce(
    (sum, item) => sum + Number(item.available_mt || 0),
    0
  );

  const remainingMt = inventoryWithRemaining.reduce(
    (sum, item) => sum + Number(item.remaining_mt || 0),
    0
  );

  const soldMt = inventoryWithRemaining.reduce(
    (sum, item) => sum + Number(item.sold_mt || 0),
    0
  );

  const inventoryValueUsd = inventoryWithRemaining.reduce(
    (sum, item) => sum + Number(item.remaining_value_usd || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending_supplier"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed" || order.status === "admin_override"
  ).length;

  const rejectedOrders = orders.filter(
    (order) => order.status === "rejected" || order.status === "expired"
  ).length;

  const avgPricePerMt =
    inventory.length > 0
      ? inventory.reduce(
          (sum, item) => sum + Number(item.price_per_mt || 0),
          0
        ) / inventory.length
      : 0;

  const sellThroughRate =
    totalAvailableMt > 0 ? (soldMt / totalAvailableMt) * 100 : 0;

  return {
    total_skus: inventory.length,
    total_available_mt: totalAvailableMt,
    sold_mt: soldMt,
    remaining_mt: remainingMt,
    pending_orders: pendingOrders,
    confirmed_orders: confirmedOrders,
    rejected_orders: rejectedOrders,
    inventory_value_usd: inventoryValueUsd,
    avg_price_per_mt: avgPricePerMt,
    sell_through_rate: sellThroughRate,
  };
}