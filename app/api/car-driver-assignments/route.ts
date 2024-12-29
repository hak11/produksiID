import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { driver_car_assignments } from "@/lib/db/schema";
import { eq  } from "drizzle-orm";

export async function GET() {
  try {
    const assignments = await db
      .select()
      .from(driver_car_assignments);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const { carId, driverIds } = await request.json();

    await db.delete(driver_car_assignments).where(eq(driver_car_assignments.carId, carId));

    const newAssignments = driverIds.map((driverId: number) => ({
      carId,
      driverId,
    }));
    await db.insert(driver_car_assignments).values(newAssignments);

    return NextResponse.json({ message: "Assignments updated successfully" });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error)
    return NextResponse.json({ error: "Failed to update assignments" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    await db.delete(driver_car_assignments).where(eq(driver_car_assignments.id, Number(id)));
    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
