import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { cars, driver_car_assignments, drivers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type CarWithDrivers = {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  status: string;
  lastMaintenanceDate: string | null;
  drivers: { id: number; name: string }[];
};

// Get all cars
export async function GET() {
  try {
    const carsWithDrivers = await db
      .select()
      .from(cars)
      .leftJoin(driver_car_assignments, eq(cars.id, driver_car_assignments.carId))
      .leftJoin(drivers, eq(driver_car_assignments.driverId, drivers.id));

    const groupedCars = carsWithDrivers.reduce<Record<number, CarWithDrivers>>((acc, curr) => {
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
      await db.insert(driver_car_assignments).values(assignments);
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
    await db.delete(driver_car_assignments).where(eq(driver_car_assignments.carId, car.id));
    if (driverIds.length > 0) {
      const assignments = driverIds.map((driverId) => ({
        carId: car.id,
        driverId,
      }));
      await db.insert(driver_car_assignments).values(assignments);
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

  const carId = Number(id);

    await db.delete(driver_car_assignments).where(eq(driver_car_assignments.carId, carId));

    await db.delete(cars).where(eq(cars.id, Number(id)));
    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("🚀 ~ DELETE ~ error:", error)
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
