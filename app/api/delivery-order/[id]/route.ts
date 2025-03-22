import { NextResponse, NextRequest } from "next/server"
import { db } from "@/lib/db/drizzle";
import { deliveryOrders, deliveryOrderItems, cars, companies, deliveryOrderDrivers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function GET(request: NextRequest, { params }: any) {
  try {
    const { id: doID } = params
    if (!doID) {
      return NextResponse.json(
        { error: "Delivery Order ID is required." },
        { status: 400 }
      )
    }

    const doDetails: any = await db
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
      .where(eq(deliveryOrders.id, doID))
      .limit(1)

    if (!doDetails.length) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 })
    }

    const doDetail = doDetails[0]

    const doItems = await db
      .select({
        id: deliveryOrderItems.id,
        loadQty: deliveryOrderItems.loadQty,
        loadPerPrice: deliveryOrderItems.loadPerPrice,
        totalLoadPrice: deliveryOrderItems.totalLoadPrice,
        itemId: deliveryOrderItems.itemId,
        name: deliveryOrderItems.name,
      })
      .from(deliveryOrderItems)
      .where(eq(deliveryOrderItems.doId, doID))

    const supplier = await db
      .select()
      .from(companies)
      .where(eq(companies.id, doDetail.supplierId))
      .limit(1)

    const customer = await db
      .select()
      .from(companies)
      .where(eq(companies.id, doDetail.customerId))
      .limit(1)

    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.id, doDetail.carId))
      .limit(1)

    const doDriver = await db
      .select()
      .from(deliveryOrderDrivers)
      .where(eq(deliveryOrderDrivers.deliveryOrderId, doDetail.id))

    const carDetail = car[0]

    const doDriverReduce = doDriver.reduce((acc, curr) => {
      acc[curr.role] = curr.driverId
      return acc
    }, {} as Record<string, string>)

    doDetail.items = doItems

    const dataResponse = {
      ...doDetail,
      supplier: supplier[0] || {},
      customer: customer[0] || {},
      car: carDetail || { drivers: {} },
      deliveryDrivers: doDriverReduce,
    }

    return NextResponse.json(dataResponse)
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error)
    return NextResponse.json(
      { error: "Failed to fetch delivery note details." },
      { status: 500 }
    )
  }
}
