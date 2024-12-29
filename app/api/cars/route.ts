// /app/api/cars/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { cars } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Get all cars
export async function GET() {
  try {
    const allCars = await db.select().from(cars);
    return NextResponse.json(allCars);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error)
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}

// Add a new car
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCar = await db.insert(cars).values({
      brand: body.brand,
      model: body.model,
      year: body.year,
      licensePlate: body.licensePlate,
      vin: body.vin,
      color: body.color,
      status: body.status || "available",
      lastMaintenanceDate: body.lastMaintenanceDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json(newCar);
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error)
    return NextResponse.json({ error: "Failed to add car" }, { status: 500 });
  }
}

// Update an existing car
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    await db.update(cars).set(updates).where(eq(cars.id, id));
    return NextResponse.json({ message: "Car updated successfully" });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error)
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

// Delete a car
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 });
    }

    await db.delete(cars).where(eq(cars.id, Number(id)));
    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error)
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
