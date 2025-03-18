import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryOrders, deliveryOrderItems, companies, items } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { doNumber } = await request.json();

    if (!Array.isArray(doNumber) || doNumber.length === 0) {
      return NextResponse.json({ error: "Valid array of Delivery Order IDs is required" }, { status: 400 });
    }

    const doDetails = await db
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
      .where(inArray(deliveryOrders.id, doNumber));

    if (doDetails.length === 0) {
      return NextResponse.json({ error: "No delivery orders found." }, { status: 404 });
    }

    const doIdsFound = doDetails.map(detail => detail.id);

    const doItems = await db
      .select({
        id: deliveryOrderItems.id,
        doId: deliveryOrderItems.doId,
        loadQty: deliveryOrderItems.loadQty,
        loadPerPrice: deliveryOrderItems.loadPerPrice,
        totalLoadPrice: deliveryOrderItems.totalLoadPrice,
        name: deliveryOrderItems.name,
        itemName: items.name
      })
      .from(deliveryOrderItems)
      .leftJoin(items, eq(deliveryOrderItems.itemId, items.id))
      .where(inArray(deliveryOrderItems.doId, doIdsFound));

    const supplierIds = [...new Set(doDetails.map(detail => detail.supplierId))];
    const customerIds = [...new Set(doDetails.map(detail => detail.customerId))];

    const suppliers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, supplierIds));

    const customers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, customerIds));

    const dataResponse = doDetails.map(doDetail => {
      const doItemsFiltered = doItems
        .filter((item) => item.doId === doDetail.id)
        .map((item) => ({
          ...item,
          loadQty:
            typeof item.loadQty === "string"
              ? parseFloat(item.loadQty)
              : item.loadQty,
          loadPerPrice:
            typeof item.loadPerPrice === "string"
              ? parseFloat(item.loadPerPrice)
              : item.loadPerPrice,
          totalLoadPrice:
            typeof item.totalLoadPrice === "string"
              ? parseFloat(item.totalLoadPrice)
              : item.totalLoadPrice,
          deliveryDate: doDetail.deliveryDate,
        }))
      const supplierFiltered = suppliers.find(s => s.id === doDetail.supplierId) || {};
      const customerFiltered = customers.find(c => c.id === doDetail.customerId) || {};
        console.log("🚀 ~ POST ~ doItemsFiltered:", doItemsFiltered)
        return {
          ...doDetail,
          items: doItemsFiltered,
          supplier: supplierFiltered,
          customer: customerFiltered,
        }
    });

    return NextResponse.json(
      dataResponse
    );
  } catch (error) {
    console.error("🚀 ~ POST (multiple details) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery order details." }, { status: 500 });
  }
}