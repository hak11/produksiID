import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allItems = await db.select().from(items).orderBy(desc(items.id));
    return NextResponse.json(allItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, unit } = body;

    const newService = await db.insert(items).values({
      name,
      price,
      unit,
    }).returning();

    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

