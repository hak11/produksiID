import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes, deliveryNoteItems, deliveryOrders, deliveryNoteStatusEnum, teams } from "@/lib/db/schema";
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

// **POST: Buat Surat Jalan baru**
export async function POST(request: Request) {
  try {
    const { deliveryOrderIds, issueDate, remarks } = await request.json();

    if (!deliveryOrderIds || deliveryOrderIds.length === 0) {
      return NextResponse.json({ error: "At least one Delivery Order ID is required." }, { status: 400 });
    }

    const [team] = await db.select().from(teams).limit(1);
    if (!team) throw new Error("Team not found!");

    const noteNumber = `DN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDeliveryNote = await db.transaction(async (tx) => {
      // Insert delivery note
      const [insertedNote] = await tx.insert(deliveryNotes).values({
        teamId: team.id,
        noteNumber,
        issueDate: new Date(issueDate).toISOString().split('T')[0],
        status: deliveryNoteStatusEnum.enumValues[0], // 'draft'
        remarks,
      }).returning();

      // Insert delivery note items
      await tx.insert(deliveryNoteItems).values(
        deliveryOrderIds.map((orderId: string) => ({
          deliveryNoteId: insertedNote.id,
          deliveryOrderId: orderId,
          actualQty: null, // Default null, bisa diupdate nanti
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
