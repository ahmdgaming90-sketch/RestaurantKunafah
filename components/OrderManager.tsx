"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/whatsapp";
import { ORDER_STATUS_LABELS_AR, ORDER_STATUSES } from "@/types/database";
import type { Order, OrderItem, OrderItemAddon, OrderStatus } from "@/types/database";

export type OrderWithItems = Order & {
  order_items: (OrderItem & { order_item_addons: OrderItemAddon[] })[];
};

export default function OrderManager({
  orders,
  updateOrderStatus,
}: {
  orders: OrderWithItems[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [items, setItems] = useState(orders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setItems((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const res = await updateOrderStatus(orderId, status);
    if (res.error) setMessage(res.error);
  }

  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-espresso/50">لا توجد طلبات حتى الآن.</p>;
  }

  return (
    <div>
      {message ? <p className="mb-4 text-xs text-red-600">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((order) => {
          const expanded = expandedId === order.id;
          return (
            <li key={order.id} className="rounded-2xl border border-espresso/10 bg-paper p-4">
              <button
                onClick={() => setExpandedId(expanded ? null : order.id)}
                className="flex w-full items-center justify-between text-right"
              >
                <div>
                  <p className="text-sm font-semibold text-espresso" dir="ltr">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-xs text-espresso/50">
                    {order.customer_name} · {order.customer_phone}
                  </p>
                  <p className="mt-0.5 text-xs text-espresso/40">
                    {new Date(order.created_at).toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gold">{formatPrice(order.total)}</p>
                  <p className="mt-1 text-xs text-espresso/50">{ORDER_STATUS_LABELS_AR[order.status]}</p>
                </div>
              </button>

              {expanded ? (
                <div className="mt-4 space-y-3 border-t border-espresso/10 pt-4">
                  <ul className="space-y-2 text-sm">
                    {order.order_items.map((item) => (
                      <li key={item.id}>
                        <p className="text-espresso">
                          {item.product_name} × {item.quantity}
                          <span className="mr-2 text-espresso/50">{formatPrice(item.line_total)}</span>
                        </p>
                        {item.order_item_addons.length > 0 ? (
                          <ul className="mr-4 mt-0.5 space-y-0.5 text-xs text-espresso/50">
                            {item.order_item_addons.map((addon) => (
                              <li key={addon.id}>
                                {addon.addon_name} +{formatPrice(addon.addon_price)}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-espresso/60">حالة الطلب</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS_AR[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
