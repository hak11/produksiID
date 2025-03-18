import { NextResponse } from "next/server";
import { z } from 'zod';
import { db } from "@/lib/db/drizzle";
import { deliveryNotes, deliveryNoteItems, deliveryOrders, DeliveryNoteStatus, DeliveryNoteItems } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

const postItemsSchema = z.object({
  deliveryOrderId: z.string(),
  deliveryOrderItemId: z.string(),
  actualQty: z.string().optional(),
})

const postRequestSchema = z.object({
  noteNumber: z.string(),
  issueDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg)
    }
  }, z.date()),
  remarks: z.string().optional(),
  items: z.array(postItemsSchema),
  status: DeliveryNoteStatus.optional(),
})

const updateRequestSchema = z.object({
  id: z.string(),
  noteNumber: z.string(),
  issueDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg)
    }
  }, z.date()),
  remarks: z.string().optional(),
  items: z.array(postItemsSchema),
  status: DeliveryNoteStatus.optional(),
})

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = session.team_id

    const deliveryNotesWithItems = await db
      .select({
        id: deliveryNotes.id,
        noteNumber: deliveryNotes.noteNumber,
        issueDate: deliveryNotes.issueDate,
        status: deliveryNotes.status,
        remarks: deliveryNotes.remarks,
        totalItems: count(deliveryNoteItems.id).as('totalItems'),
        deliveryOrders: sql`
          (json_agg(
            DISTINCT (json_build_object(
              'id', ${deliveryOrders.id},
              'orderNumber', ${deliveryOrders.orderNumber}
            )::jsonb)
          ))::json
        `.as('deliveryOrders'),
      })
      .from(deliveryNotes)
      .leftJoin(
        deliveryNoteItems,
        eq(deliveryNoteItems.deliveryNoteId, deliveryNotes.id)
      )
      .leftJoin(
        deliveryOrders,
        eq(deliveryOrders.id, deliveryNoteItems.deliveryOrderId)
      )
      .where(teamId ? eq(deliveryNotes.teamId, teamId) : undefined)
      .groupBy(deliveryNotes.id)
      .orderBy(desc(deliveryNotes.id));

    return NextResponse.json(deliveryNotesWithItems);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery notes" }, { status: 500 });
  }
}




// **POST: Buat Surat Jalan baru**
export async function POST(request: Request) {
  const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const teamId = session.team_id
  try {
    const bodyRequest = await request.json();
    const parsedQuery = postRequestSchema.safeParse(bodyRequest);
    if (!parsedQuery.success) {
      console.log("🚀 ~ POST ~ parsedQuery:", parsedQuery.error)
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { noteNumber, issueDate, remarks, items } = bodyRequest;

    const uniqueDeliveryOrderIds = [...new Set(items.map((dataItem:z.infer<typeof postItemsSchema>) => dataItem.deliveryOrderId))];

    const newDeliveryNote = await db.transaction(async (tx) => {
      const [insertedNote] = await tx.insert(deliveryNotes).values({
        teamId,
        noteNumber,
        issueDate: new Date(issueDate).toISOString().split('T')[0],
        status: "draft",
        remarks,
      }).returning();

      await tx.insert(deliveryNoteItems).values(
        items.map((orderItem: DeliveryNoteItems) => ({
          deliveryNoteId: insertedNote.id,
          deliveryOrderId: orderItem.deliveryOrderId,
          deliveryOrderItemId: orderItem.deliveryOrderItemId,
          actualQty: orderItem.actualQty,
        }))
      );

      await tx
        .update(deliveryOrders)
        .set({ deliveryStatus: "in_progress" })
        .where(
          sql`${deliveryOrders.id} IN (${sql.join(
            uniqueDeliveryOrderIds.map((id) => sql`${id}`),
            ', '
          )})`
        );

      return insertedNote;
    });

    return NextResponse.json({ message: "Delivery note created successfully.", deliveryNote: newDeliveryNote });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error: "Failed to create delivery note." }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  const session = await getSession()

  const teamId = session?.team_id

  if (!session || teamId === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const bodyRequest = await request.json()
    const parsedQuery = updateRequestSchema.safeParse(bodyRequest)

    if (!parsedQuery.success) {
      console.log("🚀 ~ PUT ~ parsedQuery:", parsedQuery.error)
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      )
    }

    const { id, noteNumber, issueDate, remarks, items, status } = bodyRequest

    const uniqueDeliveryOrderIds = [
      ...new Set(
        items.map(
          (item: z.infer<typeof postItemsSchema>) => item.deliveryOrderId
        )
      ),
    ]

    const updatedDeliveryNote = await db.transaction(async (tx) => {
      await tx
        .update(deliveryNotes)
        .set({
          noteNumber,
          issueDate: new Date(issueDate).toISOString().split("T")[0],
          remarks,
          status,
        })
        .where(eq(deliveryNotes.id, id))

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
        .where(
          sql`${deliveryOrders.id} IN (${sql.join(
            uniqueDeliveryOrderIds.map((id) => sql`${id}`),
            ", "
          )})`
        )

      const [updatedNote] = await tx
        .select()
        .from(deliveryNotes)
        .where(eq(deliveryNotes.id, id))
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Delivery Note ID is required" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(deliveryNoteItems).where(eq(deliveryNoteItems.deliveryNoteId, id));
      await tx.delete(deliveryNotes).where(eq(deliveryNotes.id, id));
    });

    return NextResponse.json({ message: "Delivery note deleted successfully." });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error);
    return NextResponse.json({ error: "Failed to delete delivery note." }, { status: 500 });
  }
}
