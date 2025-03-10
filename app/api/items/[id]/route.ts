import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: any 
) {
  try {
    const service = await db.select().from(items).where(eq(items.id, params.id)).limit(1);

    if (service.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service[0]);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const body = await request.json();
    const { name, price, unit } = body;

    const updatedService = await db.update(items)
      .set({ name, price, unit, updatedAt: new Date() })
      .where(eq(items.id, params.id))
      .returning();

    if (updatedService.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(updatedService[0]);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const deletedService = await db.delete(items).where(eq(items.id, params.id)).returning();

    if (deletedService.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}

