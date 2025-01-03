import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { services } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allServices = await db.select().from(services).orderBy(desc(services.id));
    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, unit } = body;

    const newService = await db.insert(services).values({
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

