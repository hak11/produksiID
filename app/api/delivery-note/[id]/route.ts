import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  DeliveryNoteItemFormValues,
} from "@/lib/validatorSchema/deliveryNoteSchema"

export async function GET( request: Request, { params }: any) {
  try {
    const { id } = params;
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

    const dataItems: DeliveryNoteItemFormValues[] = noteDetail.dnItems.map((item: any) => ({
      name: item.doItem.name ? `${item.doItem.name}` : item.doItem.doItemName,
      supplierName: item.doItem.do.sup.name,
      deliveryDate: item.doItem.do.deliveryDate,
      customerName: item.doItem.do.cus.name,
      loadQty: item.doItem.loadQty,
      doNumber: item.doItem.do.orderNumber,
      actualQty: item.actualQty,
      deliveryOrderId: item.deliveryOrderId,
      deliveryOrderItemId: item.deliveryOrderItemId,
    }))

    return NextResponse.json({...noteDetail, dnItems: dataItems}, { status: 200 });
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch company detail." }, { status: 500 });
  }
}
