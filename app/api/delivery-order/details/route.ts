import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { deliveryNotes, deliveryNoteItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET: Ambil daftar delivery notes, bisa difilter berdasarkan teamId jika diperlukan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const notes = await db
      .select({
        id: deliveryNotes.id,
        noteNumber: deliveryNotes.noteNumber,
        teamId: deliveryNotes.teamId,
        issueDate: deliveryNotes.issueDate,
        status: deliveryNotes.status,
        remarks: deliveryNotes.remarks,
        createdAt: deliveryNotes.createdAt,
        updatedAt: deliveryNotes.updatedAt,
      })
      .from(deliveryNotes)
      .where(teamId ? eq(deliveryNotes.teamId, teamId) : undefined)
      .orderBy(desc(deliveryNotes.createdAt));

    return NextResponse.json(notes);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery notes" },
      { status: 500 }
    );
  }
}

// POST: Buat delivery note baru beserta item–nya (jika ada)
export async function POST(request: NextRequest) {
  try {
    const { items, ...noteData } = await request.json();

    if (!noteData) {
      return NextResponse.json(
        { error: "Delivery note data is required." },
        { status: 400 }
      );
    }

    const newNote = await db.transaction(async (tx) => {
      const [insertedNote] = await tx
        .insert(deliveryNotes)
        .values(noteData)
        .returning();

      if (items && Array.isArray(items) && items.length > 0) {
        await tx.insert(deliveryNoteItems).values(
          items.map((item: any) => ({
            ...item,
            deliveryNoteId: insertedNote.id,
          }))
        );
      }

      return insertedNote;
    });

    return NextResponse.json({
      message: "Delivery note created successfully.",
      deliveryNote: newNote,
    });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
    return NextResponse.json(
      { error: "Failed to create delivery note." },
      { status: 500 }
    );
  }
}

// PUT: Update delivery note yang sudah ada (juga update item–nya)
export async function PUT(request: NextRequest) {
  try {
    const { id, items, ...noteData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Delivery note ID is required." },
        { status: 400 }
      );
    }

    const updatedNote = await db.transaction(async (tx) => {
      const [note] = await tx
        .update(deliveryNotes)
        .set({ ...noteData, updatedAt: new Date() })
        .where(eq(deliveryNotes.id, id))
        .returning();

      if (items) {
        // Hapus item lama
        await tx.delete(deliveryNoteItems).where(eq(deliveryNoteItems.deliveryNoteId, id));
        // Masukkan item baru (jika ada)
        if (Array.isArray(items) && items.length > 0) {
          await tx.insert(deliveryNoteItems).values(
            items.map((item: any) => ({
              ...item,
              deliveryNoteId: id,
            }))
          );
        }
      }

      return note;
    });

    return NextResponse.json({
      message: "Delivery note updated successfully.",
      deliveryNote: updatedNote,
    });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery note." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Delivery note ID is required." },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(deliveryNoteItems).where(eq(deliveryNoteItems.deliveryNoteId, id));
      await tx.delete(deliveryNotes).where(eq(deliveryNotes.id, id));
    });

    return NextResponse.json({ message: "Delivery note deleted successfully." });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery note." },
      { status: 500 }
    );
  }
}
