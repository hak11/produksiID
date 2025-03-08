import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes, deliveryNoteOrders, deliveryOrders, deliveryNoteStatusEnum, teams } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

// **GET: Ambil semua Surat Jalan**
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const deliveryNotesWithOrders = await db
      .select({
        id: deliveryNotes.id,
        noteNumber: deliveryNotes.noteNumber,
        issueDate: deliveryNotes.issueDate,
        status: deliveryNotes.status,
        remarks: deliveryNotes.remarks,
        deliveryOrders: sql<string>`ARRAY(SELECT order_number FROM ${deliveryOrders} WHERE id IN (SELECT delivery_order_id FROM ${deliveryNoteOrders} WHERE delivery_note_id = ${deliveryNotes.id}))`
      })
      .from(deliveryNotes)
      .where(teamId ? eq(deliveryNotes.teamId, teamId) : undefined)
      .orderBy(desc(deliveryNotes.id));

    return NextResponse.json(deliveryNotesWithOrders);
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

    const noteNumber = `DN-${Math.floor(1000 + Math.random() * 9000)}`; // Generate random note number

    const newDeliveryNote = await db.transaction(async (tx) => {
      const [insertedNote] = await tx.insert(deliveryNotes).values({
        teamId: team.id,
        noteNumber,
        issueDate: new Date(issueDate).toISOString().split('T')[0],
        status: deliveryNoteStatusEnum.enumValues[0], // 'draft'
        remarks,
      }).returning();

      await tx.insert(deliveryNoteOrders).values(
        deliveryOrderIds.map((orderId: string) => ({
          deliveryNoteId: insertedNote.id,
          deliveryOrderId: orderId,
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
