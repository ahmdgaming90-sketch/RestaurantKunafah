import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";

type IncomingItem = {
  productId: string;
  quantity: number;
  addonIds?: string[];
};

export async function POST(request: Request) {
  let body: { customerName?: string; customerPhone?: string; items?: IncomingItem[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { customerName, customerPhone, items } = body;

  if (!customerName || !customerPhone || !items || items.length === 0) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("create_order", {
    p_restaurant_slug: RESTAURANT_SLUG,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      addon_ids: item.addonIds ?? [],
    })),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
