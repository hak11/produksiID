import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes  } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Delivery note ID is required." },
        { status: 400 }
      );
    }

    // Ambil detail delivery note
     const noteDetail = await db.query.deliveryNotes.findFirst({
      where: eq(deliveryNotes.id, id),
      with: {
        deliveryNoteItems: true,
      },
    });

    if (!noteDetail) {
      return NextResponse.json(
        { error: "Delivery note not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(noteDetail);
  } catch (error) {
    console.error("🚀 ~ GET (detail) ~ error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery note details." },
      { status: 500 }
    );
  }
}
