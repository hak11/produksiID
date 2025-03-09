import { NextResponse } from "next/server";
import { z } from 'zod';
import { db } from "@/lib/db/drizzle";
import { deliveryNotes, deliveryNoteItems, deliveryOrders, DeliveryNoteStatus, DeliveryNoteItems } from "@/lib/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

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
        deliveryOrders: sql<string>`ARRAY(SELECT order_number FROM ${deliveryOrders} WHERE id IN (SELECT delivery_order_id FROM ${deliveryNoteItems} WHERE delivery_note_id = ${deliveryNotes.id}))`,
        totalItems: sql<number>`(SELECT COUNT(*) FROM ${deliveryNoteItems} WHERE delivery_note_id = ${deliveryNotes.id})`
      })
      .from(deliveryNotes)
      .where(teamId ? eq(deliveryNotes.teamId, teamId) : undefined)
      .orderBy(desc(deliveryNotes.id));

    return NextResponse.json(deliveryNotesWithItems);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery notes" }, { status: 500 });
  }
}

const postRequestSchema = z.object({
  noteNumber: z.string(),
  issueDate: z.string(),
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      deliveryOrderId: z.string(),
      deliveryOrderItemId: z.string(),
      actualQty: z.string().optional(),
    })
  ),
  status: DeliveryNoteStatus,
});

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

    const { noteNumber, issueDate, remarks, status, items } = bodyRequest;

    const newDeliveryNote = await db.transaction(async (tx) => {
      const [insertedNote] = await tx.insert(deliveryNotes).values({
        teamId,
        noteNumber,
        issueDate: new Date(issueDate).toISOString().split('T')[0],
        status: status,
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

      return insertedNote;
    });

    return NextResponse.json({ message: "Delivery note created successfully.", deliveryNote: newDeliveryNote });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error: "Failed to create delivery note." }, { status: 500 });
  }
}

// **PUT: Update status atau jumlah aktual (`actualQty`)**
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

// **DELETE: Hapus Surat Jalan dan item terkait**
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
