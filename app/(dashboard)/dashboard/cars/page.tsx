"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import type { Car as CarType, Driver as DriverType } from "@/lib/db/schema";
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { CarForm } from "./components/car-form";
import { CarList } from "./components/car-list";

export default function CarsPage() {
  const [cars, setCars] = useState<(CarType & { drivers: DriverType[] })[]>([]);
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [selectedCar, setSelectedCar] = useState<Partial<CarType> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/cars?id=${id}`, { method: "DELETE" })
      const updatedCars = await fetch("/api/cars").then((res) => res.json())
      setCars(updatedCars)
      toast.success("Data successfully deleted")
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the car")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const carsResponse = await fetch("/api/cars");
      const driversResponse = await fetch("/api/drivers");
      const carsWithAssignments = await fetch("/api/car-driver-assignments");

      const carsData: CarType[] = await carsResponse.json();
      const driversData: DriverType[] = await driversResponse.json();
      const assignments = await carsWithAssignments.json();

      // Map cars to include their assigned drivers
      const carsWithDrivers = carsData.map((car) => ({
        ...car,
        drivers: assignments
          .filter(
            (assignment: { carId: string; driverId: string }) =>
              assignment.carId === car.id
          )
          .map((assignment: { carId: string; driverId: string }) =>
            driversData.find((driver) => driver.id === assignment.driverId)
          )
          .filter(Boolean) as DriverType[], // Ensure valid drivers only
      }))

      setCars(carsWithDrivers);
      setDrivers(driversData);
    };

    fetchData();
  }, []);


  const handleSave = async (
    car: Partial<CarType>,
    assignedDrivers: string[]
  ) => {
    try {
      const isUpdate = car.id
      const url = "/api/cars"
      const method = isUpdate ? "PUT" : "POST"
      const message = isUpdate
        ? "Data successfully saved"
        : "Data successfully created"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car, driverIds: assignedDrivers }),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} driver: ${
            response.statusText
          }`
        )
      }

      toast.success(message)

      setOpen(false)
      const updatedCars = await fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch cars: ${res.statusText}`)
        return res.json()
      })
      setCars(updatedCars)
      setSelectedCar(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while saving the car")
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Cars</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCar(null)}>Add Car</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Car</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Edit the details of the selected car."
                  : "Fill in the details of the new car."}
              </DialogDescription>
            </DialogHeader>
            <CarForm
              car={selectedCar}
              drivers={drivers}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      {deleteId !== null && (
        <ConfirmationDialog
          open={deleteId !== null}
          title="Confirm Deletion"
          description="Are you sure you want to delete this car? This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete"
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <CarList
        cars={cars}
        onEdit={(car) => {
          setIsEditing(true)
          setSelectedCar(car)
          setOpen(true)
        }}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
