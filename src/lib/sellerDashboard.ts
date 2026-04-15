import type {
  SellerDashboardData,
  SellerGoal,
  SellerStatusBreakdownPoint,
  SellerTopSoldProduct,
  SellerWeeklySalesPoint,
} from "@/src/lib/models";
import { getOrders } from "@/src/lib/orders";
import {
  getInventoryWithRemaining,
  getSellerInventory,
  getSellerInventoryStats,
} from "@/src/lib/sellerInventory";

const SELLER_GOAL_KEY = "raw-seller-monthly-goal";

export function getCurrentMonthLabel() {
  const now = new Date();
  return now.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
}

export function getSellerMonthlyGoal(): SellerGoal {
  if (typeof window === "undefined") {
    return {
      month_label: getCurrentMonthLabel(),
      target_mt: 100,
    };
  }

  const raw = localStorage.getItem(SELLER_GOAL_KEY);

  try {
    if (!raw) {
      return {
        month_label: getCurrentMonthLabel(),
        target_mt: 100,
      };
    }

    return JSON.parse(raw) as SellerGoal;
  } catch {
    return {
      month_label: getCurrentMonthLabel(),
      target_mt: 100,
    };
  }
}

export function saveSellerMonthlyGoal(targetMt: number) {
  if (typeof window === "undefined") return;

  const goal: SellerGoal = {
    month_label: getCurrentMonthLabel(),
    target_mt: targetMt,
  };

  localStorage.setItem(SELLER_GOAL_KEY, JSON.stringify(goal));
}

export function getWeeklySalesForCurrentMonth(): SellerWeeklySalesPoint[] {
  const orders = getOrders().filter(
    (order) =>
      (order.status === "confirmed" || order.status === "admin_override") &&
      order.confirmed_at
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const buckets = [
    { label: "Sem 1", mt: 0 },
    { label: "Sem 2", mt: 0 },
    { label: "Sem 3", mt: 0 },
    { label: "Sem 4", mt: 0 },
    { label: "Sem 5", mt: 0 },
  ];

  for (const order of orders) {
    const confirmedDate = new Date(order.confirmed_at as string);

    if (
      confirmedDate.getMonth() !== currentMonth ||
      confirmedDate.getFullYear() !== currentYear
    ) {
      continue;
    }

    const dayOfMonth = confirmedDate.getDate();
    const bucketIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);

    const orderMt = order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    buckets[bucketIndex].mt += orderMt;
  }

  return buckets;
}

export function getStatusBreakdown(): SellerStatusBreakdownPoint[] {
  const stats = getSellerInventoryStats();

  return [
    {
      label: "Pendientes",
      value: stats.pending_orders,
    },
    {
      label: "Confirmadas",
      value: stats.confirmed_orders,
    },
    {
      label: "Rechazadas",
      value: stats.rejected_orders,
    },
  ];
}

function getSalesUsd() {
  const orders = getOrders().filter(
    (order) => order.status === "confirmed" || order.status === "admin_override"
  );

  return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
}

function getAverageDaysOnPlatform() {
  const inventory = getSellerInventory();

  if (inventory.length === 0) return 0;

  const now = new Date().getTime();

  const totalDays = inventory.reduce((sum, item) => {
    const publishedAt = item.published_at
      ? new Date(item.published_at).getTime()
      : now;

    const diffMs = Math.max(now - publishedAt, 0);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return sum + diffDays;
  }, 0);

  return totalDays / inventory.length;
}

function getTopSoldProducts(): SellerTopSoldProduct[] {
  const orders = getOrders().filter(
    (order) => order.status === "confirmed" || order.status === "admin_override"
  );

  const productMap = new Map<
    string,
    { label: string; sold_mt: number; sales_usd: number }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const label = `${item.grade} · ${item.thickness_mm}mm`;
      const current = productMap.get(label) ?? {
        label,
        sold_mt: 0,
        sales_usd: 0,
      };

      current.sold_mt += Number(item.quantity || 0);
      current.sales_usd +=
        Number(item.quantity || 0) * Number(item.price_per_mt || 0);

      productMap.set(label, current);
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.sold_mt - a.sold_mt)
    .slice(0, 3);
}

export function getSellerDashboardData(): SellerDashboardData {
  const stats = getSellerInventoryStats();
  const goal = getSellerMonthlyGoal();
  const weekly_sales = getWeeklySalesForCurrentMonth();
  const status_breakdown = getStatusBreakdown();
  const sales_usd = getSalesUsd();
  const avg_days_on_platform = getAverageDaysOnPlatform();
  const top_sold_products = getTopSoldProducts();

  const goal_progress_pct =
    goal.target_mt > 0
      ? Math.min((stats.sold_mt / goal.target_mt) * 100, 100)
      : 0;

  const top_remaining_inventory = getInventoryWithRemaining()
    .sort((a, b) => Number(b.remaining_mt) - Number(a.remaining_mt))
    .slice(0, 5);

  return {
    stats,
    goal,
    goal_progress_pct,
    weekly_sales,
    status_breakdown,
    top_remaining_inventory,
    sales_usd,
    avg_days_on_platform,
    top_sold_products,
  };
}