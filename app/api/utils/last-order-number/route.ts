import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryOrders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";


export async function GET() {
  try {
    const deliveryOrdersWithDetails = await db
      .select({
        orderNumber: deliveryOrders.orderNumber,
      })
      .from(deliveryOrders)
      .orderBy(desc(deliveryOrders.id))
      .limit(1);
    
    if (deliveryOrdersWithDetails.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }
    return NextResponse.json(deliveryOrdersWithDetails[0]);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery orders" }, { status: 500 });
  }
}