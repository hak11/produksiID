import { NextResponse } from "next/server";
import { z } from 'zod';
import { db } from "@/lib/db/drizzle"
import { eq, and, inArray } from "drizzle-orm"
import {
  deliveryNotes,
  deliveryNoteItems,
  deliveryOrders,
} from "@/lib/db/schema"
import type { DeliveryNoteItems } from "@/lib/db/schema";
import { DeliveryNoteItemFormValues } from "@/lib/validatorSchema/deliveryNoteSchema"
import { postRequestSchema, postItemsSchema } from "../route"
import { getSession } from "@/lib/auth/session"

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

export async function PUT(request: Request, { params }: any) {
  const session = await getSession()
  if (!session || session.team_id === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teamId = session.team_id
  const { id } = params

  try {
    const bodyRequest = await request.json()
    const parsedQuery = postRequestSchema.safeParse(bodyRequest)
    if (!parsedQuery.success) {
      console.log("🚀 ~ PUT ~ parsedQuery:", parsedQuery.error)
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      )
    }

    const { noteNumber, issueDate, remarks, items } = bodyRequest

    const uniqueDeliveryOrderIds: string[] = [
      ...new Set<string>(
        items.map(
          (dataItem: z.infer<typeof postItemsSchema>) =>
            dataItem.deliveryOrderId
        )
      ),
    ]

    const updatedDeliveryNote = await db.transaction(async (tx) => {
      const [updatedNote] = await tx
        .update(deliveryNotes)
        .set({
          noteNumber,
          issueDate: new Date(issueDate).toISOString().split("T")[0],
          remarks,
          updatedAt: new Date(),
        })
        .where(and(eq(deliveryNotes.id, id), eq(deliveryNotes.teamId, teamId)))
        .returning()

      await tx
        .delete(deliveryNoteItems)
        .where(eq(deliveryNoteItems.deliveryNoteId, id))

      await tx.insert(deliveryNoteItems).values(
        items.map((orderItem: DeliveryNoteItems) => ({
          deliveryNoteId: id,
          deliveryOrderId: orderItem.deliveryOrderId,
          deliveryOrderItemId: orderItem.deliveryOrderItemId,
          actualQty: orderItem.actualQty,
        }))
      )

      await tx
        .update(deliveryOrders)
        .set({ deliveryStatus: "in_progress" })
        .where(inArray(deliveryOrders.id, uniqueDeliveryOrderIds))

      return updatedNote
    })

    return NextResponse.json({
      message: "Delivery note updated successfully.",
      deliveryNote: updatedDeliveryNote,
    })
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error)
    return NextResponse.json(
      { error: "Failed to update delivery note." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: any) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: "Delivery Note ID and status are required." },
        { status: 400 }
      )
    }

    await db
      .update(deliveryNotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(deliveryNotes.id, id))

    return NextResponse.json({ message: "Status updated successfully." })
  } catch (error) {
    console.error("🚀 ~ PATCH ~ error:", error)
    return NextResponse.json(
      { error: "Failed to update status." },
      { status: 500 }
    )
  }
}