import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryOrders, deliveryOrderItems, cars, companies, deliveryOrderDrivers } from "@/lib/db/schema";
import { sql, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { doNumber } = await request.json();
    console.log("🚀 ~ POST ~ doNumber:", doNumber)

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
      .where(inArray(deliveryOrders.orderNumber, doNumber));

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
        nameItem: sql<string>`'item ' || ROW_NUMBER() OVER (PARTITION BY ${deliveryOrderItems.doId} ORDER BY ${deliveryOrderItems.id})`.as('nameItem'),
      })
      .from(deliveryOrderItems)
      .where(inArray(deliveryOrderItems.doId, doIdsFound));

    const supplierIds = [...new Set(doDetails.map(detail => detail.supplierId))];
    const customerIds = [...new Set(doDetails.map(detail => detail.customerId))];
    const carIds = [...new Set(doDetails.map(detail => detail.carId))];

    const suppliers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, supplierIds));

    const customers = await db
      .select()
      .from(companies)
      .where(inArray(companies.id, customerIds));

    const dataCars = await db
      .select()
      .from(cars)
      .where(inArray(cars.id, carIds));

    const doDrivers = await db
      .select()
      .from(deliveryOrderDrivers)
      .where(inArray(deliveryOrderDrivers.deliveryOrderId, doIdsFound));

    const dataResponse = doDetails.map(doDetail => {
      const doItemsFiltered = doItems.filter(item => item.doId === doDetail.id);
      const supplierFiltered = suppliers.find(s => s.id === doDetail.supplierId) || {};
      const customerFiltered = customers.find(c => c.id === doDetail.customerId) || {};
      const carFiltered = dataCars.find(c => c.id === doDetail.carId) || {};
      const doDriversFiltered = doDrivers.filter(d => d.deliveryOrderId === doDetail.id);

      const doDriverReduce = doDriversFiltered.reduce((acc, curr) => {
        acc[curr.role] = curr.driverId;
        return acc;
      }, {} as Record<string, string>);

      return {
        ...doDetail,
        items: doItemsFiltered,
        supplier: supplierFiltered,
        customer: customerFiltered,
        car: carFiltered,
        deliveryDrivers: doDriverReduce,
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