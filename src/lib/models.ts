export type InventoryStatus = "active" | "reserved" | "sold" | "inactive";

export type Listing = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  grade: string;
  finish: string;
  thickness_mm: number;
  width_mm: number;
  price_per_mt: number;
  available_mt: number;
  location: string;
  inventory_status: InventoryStatus;
  published_at?: string;
};

export type CartItem = Listing & {
  quantity: number;
};

export type OrderStatus =
  | "pending_supplier"
  | "confirmed"
  | "rejected"
  | "expired"
  | "admin_override";

export type OrderDocumentType = "proforma" | "invoice" | null;

export type Order = {
  id: string;
  created_at: string;
  supplier_response_deadline: string;
  buyer_name: string;
  buyer_company: string;
  buyer_email: string;
  supplier_name: string;
  delivery_location?: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  freight: number;
  total: number;
  notes?: string;
  confirmed_at?: string | null;
  estimated_delivery_date?: string | null;
  document_type?: OrderDocumentType;
  document_number?: string | null;
};

export type SellerInventoryRow = Listing & {
  sold_mt: number;
  remaining_mt: number;
  remaining_value_usd: number;
};

export type SellerInventoryStats = {
  total_skus: number;
  total_available_mt: number;
  sold_mt: number;
  remaining_mt: number;
  pending_orders: number;
  confirmed_orders: number;
  rejected_orders: number;
  inventory_value_usd: number;
  avg_price_per_mt: number;
  sell_through_rate: number;
};

export type SellerGoal = {
  month_label: string;
  target_mt: number;
};

export type SellerWeeklySalesPoint = {
  label: string;
  mt: number;
};

export type SellerStatusBreakdownPoint = {
  label: string;
  value: number;
};

export type SellerTopSoldProduct = {
  label: string;
  sold_mt: number;
  sales_usd: number;
};

export type SellerDashboardData = {
  stats: SellerInventoryStats;
  goal: SellerGoal;
  goal_progress_pct: number;
  weekly_sales: SellerWeeklySalesPoint[];
  status_breakdown: SellerStatusBreakdownPoint[];
  top_remaining_inventory: SellerInventoryRow[];
  sales_usd: number;
  avg_days_on_platform: number;
  top_sold_products: SellerTopSoldProduct[];
};

export type ShippingQuoteRequest = {
  origin?: string;
  originZip?: string;
  destinationZip?: string;
  totalMt?: number;
  weightMt?: number;
};

export type ShippingQuoteResponse = {
  ok?: boolean;
  message?: string;
  zone?: string;
  transitDays?: number;
  estimatedUsd?: number;
  usd_per_mt?: number;
  total_usd?: number;
  origin?: string;
  destinationZip?: string;
  totalMt?: number;
};
