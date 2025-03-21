import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { cars, driverCarAssignments, drivers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

type CarWithDrivers = {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string | null;
  status: string;
  lastMaintenanceDate: string | null;
  drivers: { id: string; name: string }[];
};

// Get all cars
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.team_id === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = session.team_id
    const carsWithDrivers = await db
      .select()
      .from(cars)
      .leftJoin(driverCarAssignments, eq(cars.id, driverCarAssignments.carId))
      .leftJoin(drivers, eq(driverCarAssignments.driverId, drivers.id))
      .where(eq(cars.teamId, teamId));

    const groupedCars = carsWithDrivers.reduce<Record<string, CarWithDrivers>>((acc, curr) => {
      const car = curr.cars;
      const driver = curr.drivers;

      if (!acc[car.id]) {
        acc[car.id] = {
          id: car.id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          licensePlate: car.licensePlate,
          vin: car.vin,
          color: car.color,
          status: car.status,
          lastMaintenanceDate: car.lastMaintenanceDate,
          drivers: [],
        };
      }

      if (driver?.id) {
        acc[car.id].drivers.push({ id: driver.id, name: driver.name });
      }

      return acc;
    }, {});

    return NextResponse.json(Object.values(groupedCars));
  } catch (error) {
    console.error("🚀 ~ GET ~ error:", error)
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const { car, driverIds } = await request.json();

    if (!car || !Array.isArray(driverIds)) {
      return NextResponse.json(
        { error: "'car' object and 'driverIds' array are required." },
        { status: 400 }
      );
    }

    const newCar = await db.insert(cars).values(car).returning({ id: cars.id });

    const carId = newCar[0]?.id;
    if (!carId) {
      throw new Error("Failed to create car.");
    }

    if (driverIds.length > 0) {
      const assignments = driverIds.map((driverId) => ({
        carId,
        driverId,
      }));
      await db.insert(driverCarAssignments).values(assignments);
    }

    return NextResponse.json({ message: "Car created successfully.", carId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create car." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { car, driverIds } = await request.json();

    if (!car?.id || !Array.isArray(driverIds)) {
      return NextResponse.json(
        { error: "'car.id' and 'driverIds' array are required." },
        { status: 400 }
      );
    }

    car.updatedAt = new Date();


    // Update existing car
    await db.update(cars).set(car).where(eq(cars.id, car.id));

    // Update driver assignments
    await db.delete(driverCarAssignments).where(eq(driverCarAssignments.carId, car.id));
    if (driverIds.length > 0) {
      const assignments = driverIds.map((driverId) => ({
        carId: car.id,
        driverId,
      }));
      await db.insert(driverCarAssignments).values(assignments);
    }

    return NextResponse.json({ message: "Car updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update car." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 });
    }

    await db.delete(driverCarAssignments).where(eq(driverCarAssignments.carId, id));

    await db.delete(cars).where(eq(cars.id, id));
    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error)
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
