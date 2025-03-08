// /app/api/drivers/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { drivers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session"

// Get all drivers
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = session.team_id
    const allDrivers = await db.select().from(drivers).where(eq(drivers.teamId, teamId));
    return NextResponse.json(allDrivers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

// Add a new driver
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const body = await request.json();
    const newDriver = await db.insert(drivers).values({
      name: body.name,
      licenseNumber: body.licenseNumber,
      contactNumber: body.contactNumber,
      email: body.email,
      dateOfBirth: body.dateOfBirth,
      hiredDate: body.hiredDate,
      address: body.address,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json(newDriver);
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error)
    return NextResponse.json({ error: "Failed to add driver" }, { status: 500 });
  }
}

// Update an existing driver

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    updates.updatedAt = new Date();
    delete updates.createdAt;

    await db.update(drivers).set(updates).where(eq(drivers.id, id));

    return NextResponse.json({ message: "Driver updated successfully" });
  } catch (error) {
    console.error("🚀 ~ PUT ~ error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}


// Delete a driver
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
    }

    await db.delete(drivers).where(eq(drivers.id, id));
    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error)
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}
