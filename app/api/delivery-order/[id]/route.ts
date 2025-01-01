import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryOrders, deliveryOrderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET( request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: doID } = await params;

    if (!doID) {
      return NextResponse.json({ error: "Do ID is required" }, { status: 400 });
    }

    const companyDetail: any = await db
      .select({
        id: deliveryOrders.id,
        orderDate: deliveryOrders.orderDate,
        deliveryDate: deliveryOrders.deliveryDate,
        deliveryStatus: deliveryOrders.deliveryStatus,
        orderNumber: deliveryOrders.orderNumber,
        supplierId: deliveryOrders.supplierId,
        customerId: deliveryOrders.customerId,
        carId: deliveryOrders.carId,
        deliveryAddress: deliveryOrders.deliveryAddress,
      })
      .from(deliveryOrders)
      .where(eq(deliveryOrders.id, Number(doID)))
      .limit(1);

    if (!companyDetail.length) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const doItems = await db
      .select({
        id: deliveryOrderItems.id,
        loadQty: deliveryOrderItems.loadQty,
        loadQtyActual: deliveryOrderItems.loadQtyActual,
        loadPerPrice: deliveryOrderItems.loadPerPrice,
        totalLoadPrice: deliveryOrderItems.totalLoadPrice,
      })
      .from(deliveryOrderItems)
      .where(eq(deliveryOrderItems.doId, Number(doID)));

    companyDetail[0].items = doItems;

    return NextResponse.json(companyDetail[0]);
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch company detail." }, { status: 500 });
  }
}
