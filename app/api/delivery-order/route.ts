import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { db } from "@/lib/db/drizzle";
import { deliveryOrders, deliveryOrderItems, companies, cars, deliveryOrderDrivers, DeliveryStatus } from "@/lib/db/schema";
import { eq, sql, desc, or, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session"

const querySchema = z.object({
  companyId: z.string().optional(),
  status: DeliveryStatus.optional(),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.team_id === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = session.team_id

  try {
    const { searchParams } = new URL(request.url);

    const queryObj = Object.fromEntries(searchParams.entries());
    const parsedQuery = querySchema.safeParse(queryObj);

    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { companyId, status: statusDO } = parsedQuery.data;

    const deliveryOrdersWithDetails = await db
      .select({
        id: deliveryOrders.id,
        orderNumber: deliveryOrders.orderNumber,
        supplierId: deliveryOrders.supplierId,
        customerId: deliveryOrders.customerId,
        carId: deliveryOrders.carId,
        orderDate: deliveryOrders.orderDate,
        deliveryDate: deliveryOrders.deliveryDate,
        deliveryStatus: deliveryOrders.deliveryStatus,
        deliveryAddress: deliveryOrders.deliveryAddress,
        deliveryAddressAttachment: deliveryOrders.deliveryAddressAttachment,
        supplierName: companies.name,
        customerName: sql<string>`(SELECT name FROM ${companies} WHERE id = ${deliveryOrders.customerId})`,
        carInfo: sql<string>`${cars.brand} || ' ' || ${cars.model} || ' - ' || ${cars.licensePlate}`,
      })
      .from(deliveryOrders)
      .leftJoin(companies, eq(deliveryOrders.supplierId, companies.id))
      .leftJoin(cars, eq(deliveryOrders.carId, cars.id))
      .where(
        and(
          eq(deliveryOrders.teamId, teamId),
          companyId
            ? or(
                eq(deliveryOrders.supplierId, companyId),
                eq(deliveryOrders.customerId, companyId)
              )
            : undefined
          ,
          statusDO
            ? eq(deliveryOrders.deliveryStatus, statusDO)
            : undefined
        )
      )
      .orderBy(desc(deliveryOrders.id));
    
    return NextResponse.json(deliveryOrdersWithDetails);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery orders" }, { status: 500 });
  }
}

// Create a new delivery order
export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.team_id === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teamId = session.team_id
  try {
    const { items, deliveryDrivers,  ...deliveryOrderData } = await request.json();

    deliveryOrderData.teamId = teamId
    if (!deliveryOrderData) {
      return NextResponse.json(
        { error: "Delivery order data is required." },
        { status: 400 }
      );
    }

    const newDeliveryOrder = await db.transaction(async (tx) => {
      const [insertedOrder] = await tx
        .insert(deliveryOrders)
        .values(deliveryOrderData)
        .returning();

      if (items && items.length > 0) {
        await tx.insert(deliveryOrderItems).values(
          items.map((item: any) => ({
            ...item,
            doId: insertedOrder.id,
          }))
        );
      }

      if (deliveryDrivers) {
        if (deliveryDrivers.main) {
          await tx.insert(deliveryOrderDrivers).values({
            driverId: deliveryDrivers.main,
            role: "main" ,
            deliveryOrderId: insertedOrder.id,
          });
        }

        if (deliveryDrivers.assistant) {
          await tx.insert(deliveryOrderDrivers).values({
            driverId: deliveryDrivers.assistant,
            role: "assistant",
            deliveryOrderId: insertedOrder.id,
          });
        }
      }

      return insertedOrder;
    });

    return NextResponse.json({ message: "Delivery order created successfully.", deliveryOrder: newDeliveryOrder });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error: "Failed to create delivery order." }, { status: 500 });
  }
}

// Update an existing delivery order
export async function PUT(request: Request) {
  try {
    const { id, items, deliveryDrivers, ...deliveryOrderData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Delivery order ID is required." },
        { status: 400 }
      );
    }

    const updatedDeliveryOrder = await db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(deliveryOrders)
        .set({ ...deliveryOrderData, updatedAt: new Date() })
        .where(eq(deliveryOrders.id, id))
        .returning();

      if (items) {
        await tx.delete(deliveryOrderItems).where(eq(deliveryOrderItems.doId, id));
        if (items.length > 0) {
          await tx.insert(deliveryOrderItems).values(
            items.map((item: any) => ({
              ...item,
              loadQty: item.loadQty,
              loadQtyActual: item.loadQtyActual,
              loadPerPrice: item.loadPerPrice,
              totalLoadPrice: item.totalLoadPrice,
              createdAt: item.createdAt,
              updatedAt: new Date(),
              doId: id,
            }))
          );
        }
      }

      if (deliveryDrivers) {
        await tx.delete(deliveryOrderDrivers).where(eq(deliveryOrderDrivers.deliveryOrderId, id));
        if (deliveryDrivers.main) {
          await tx.insert(deliveryOrderDrivers).values({
            driverId: deliveryDrivers.main,
            role: "main" ,
            deliveryOrderId: id,
          });
        }

        if (deliveryDrivers.assistant) {
          await tx.insert(deliveryOrderDrivers).values({
            driverId: deliveryDrivers.assistant,
            role: "assistant",
            deliveryOrderId: id,
          });
        }
      }

      return updatedOrder;
    });

    return NextResponse.json({ message: "Delivery order updated successfully.", deliveryOrder: updatedDeliveryOrder });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error);
    return NextResponse.json({ error: "Failed to update delivery order." }, { status: 500 });
  }
}

// Delete a delivery order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Delivery order ID is required" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(deliveryOrderItems).where(eq(deliveryOrderItems.doId, id));
      await tx.delete(deliveryOrders).where(eq(deliveryOrders.id, id));
    });

    return NextResponse.json({ message: "Delivery order deleted successfully." });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error);
    return NextResponse.json({ error: "Failed to delete delivery order." }, { status: 500 });
  }
}

