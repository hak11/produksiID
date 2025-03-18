import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { eq, and } from "drizzle-orm"
import {
  deliveryNotes,
  deliveryNoteItems,
} from "@/lib/db/schema"
import { DeliveryNoteItemFormValues } from "@/lib/validatorSchema/deliveryNoteSchema"

export async function GET( request: Request, { params }: any) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Delivery note ID is required." },
        { status: 400 }
      );
    }

     const noteDetail = await db.query.deliveryNotes.findFirst({
      where: eq(deliveryNotes.id, id),
      columns: {
        id: true,
        teamId: true,
        noteNumber: true,
        issueDate: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        dnItems: {
          columns: {
            id: true,
            deliveryNoteId: true,
            deliveryOrderId: true,
            deliveryOrderItemId: true,
            actualQty: true,
            createdAt: true,
          },
          with: {
            doItem: {
              columns: {
                name: true,
                loadQty: true,
              },
              with: {
                do: {
                  columns: {
                    deliveryDate: true,
                    orderNumber: true,
                  },
                  with: {
                    cus: {
                      columns: { name: true },
                    },
                    sup: {
                      columns: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!noteDetail) {
      return NextResponse.json(
        { error: "Delivery note not found." },
        { status: 404 }
      );
    }

    const dataItems: DeliveryNoteItemFormValues[] = noteDetail.dnItems.map(
      (item: any) => ({
        name: item.doItem.name ? `${item.doItem.name}` : item.doItem.doItemName,
        supplierName: item.doItem.do.sup.name,
        deliveryDate: item.doItem.do.deliveryDate,
        customerName: item.doItem.do.cus.name,
        loadQty: parseFloat(item.doItem.loadQty),
        doNumber: item.doItem.do.orderNumber,
        actualQty: parseFloat(item.actualQty),
        deliveryOrderId: item.deliveryOrderId,
        deliveryOrderItemId: item.deliveryOrderItemId,
      })
    )

    return NextResponse.json({...noteDetail, dnItems: dataItems}, { status: 200 });
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch company detail." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, deliveryOrderItems } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Delivery Note ID is required." }, { status: 400 });
    }

    const updatedDeliveryNote = await db.transaction(async (tx) => {
      if (status) {
        await tx.update(deliveryNotes).set({ status, updatedAt: new Date() }).where(eq(deliveryNotes.id, id));
      }

      if (deliveryOrderItems && deliveryOrderItems.length > 0) {
        for (const { deliveryOrderId, actualQty } of deliveryOrderItems) {
          await tx.update(deliveryNoteItems)
          .set({ actualQty })
          .where(
            and(
              eq(deliveryNoteItems.deliveryOrderId, deliveryOrderId),
              eq(deliveryNoteItems.deliveryNoteId, id)
            )
          )
        }
      }

      return await tx.select().from(deliveryNotes).where(eq(deliveryNotes.id, id)).limit(1);
    });

    return NextResponse.json({ message: "Delivery note updated successfully.", deliveryNote: updatedDeliveryNote });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error);
    return NextResponse.json({ error: "Failed to update delivery note." }, { status: 500 });
  }
}
