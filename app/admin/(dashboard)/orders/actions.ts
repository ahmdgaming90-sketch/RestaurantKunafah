"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) return { error: "حدث خطأ أثناء تحديث حالة الطلب" };

  revalidatePath("/admin/orders");
  return { success: true };
}
