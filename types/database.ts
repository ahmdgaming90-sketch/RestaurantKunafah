export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type RestaurantSettings = {
  restaurant_id: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
  maps_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  updated_at: string;
};

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const DAY_NAMES_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

export type OpeningHour = {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 0 = الأحد ... 6 = السبت
  open_time: string | null; // "HH:MM:SS"
  close_time: string | null;
  is_closed: boolean;
};

export type Profile = {
  id: string;
  restaurant_id: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
};

export type AddonSelectionType = "single" | "multiple";

export type ProductAddon = {
  id: string;
  product_id: string;
  restaurant_id: string;
  name: string;
  price: number;
  is_active: boolean;
  selection_type: AddonSelectionType;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = "new" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export const ORDER_STATUS_LABELS_AR: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  ready: "جاهز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "preparing", "ready", "completed", "cancelled"];

export type Order = {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

export type OrderItemAddon = {
  id: string;
  order_item_id: string;
  addon_id: string | null;
  addon_name: string;
  addon_price: number;
  created_at: string;
};

// Cart types (client-side only, never trusted for pricing — server recomputes everything)
export type CartAddonSelection = {
  id: string;
  name: string;
  price: number;
};

export type CartLine = {
  lineId: string; // client-generated id so the same product can appear twice with different addons
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  addons: CartAddonSelection[];
};

// Single-restaurant deployment: this is the active restaurant slug/id.
// Copy this project per client and change RESTAURANT_SLUG to reuse it for another restaurant.
export const RESTAURANT_SLUG = "kunafa-sokara";
