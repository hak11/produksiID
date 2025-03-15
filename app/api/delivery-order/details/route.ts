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

    // const carIds = [...new Set(doDetails.map(detail => detail.carId))];

    const suppliers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, supplierIds));

    const customers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, customerIds));


    // const dataCars = await db
    //   .select()
    //   .from(cars)
    //   .where(inArray(cars.id, carIds));

    // const doDrivers = await db
    //   .select()
    //   .from(deliveryOrderDrivers)
    //   .where(inArray(deliveryOrderDrivers.deliveryOrderId, doIdsFound));

    const dataResponse = doDetails.map(doDetail => {
      const doItemsFiltered = doItems.filter(item => item.doId === doDetail.id);
      const supplierFiltered = suppliers.find(s => s.id === doDetail.supplierId) || {};
      const customerFiltered = customers.find(c => c.id === doDetail.customerId) || {};
      // const carFiltered = dataCars.find(c => c.id === doDetail.carId) || {};
      // const doDriversFiltered = doDrivers.filter(d => d.deliveryOrderId === doDetail.id);

      // const doDriverReduce = doDriversFiltered.reduce((acc, curr) => {
      //   acc[curr.role] = curr.driverId;
      //   return acc;
      // }, {} as Record<string, string>);

      return {
        ...doDetail,
        items: doItemsFiltered,
        supplier: supplierFiltered,
        customer: customerFiltered,
        // car: carFiltered,
        // deliveryDrivers: doDriverReduce,
      };
    });

    return NextResponse.json(
      dataResponse
    );
  } catch (error) {
    console.error("🚀 ~ POST (multiple details) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery order details." }, { status: 500 });
  }
}