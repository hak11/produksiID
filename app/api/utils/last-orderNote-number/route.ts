import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";


export async function GET() {
  try {
    const deliveryNotesDetails = await db
      .select({
        orderNumber: deliveryNotes.noteNumber,
      })
      .from(deliveryNotes)
      .orderBy(desc(deliveryNotes.id))
      .limit(1);

    return NextResponse.json(deliveryNotesDetails[0])
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery orders" }, { status: 500 });
  }
}