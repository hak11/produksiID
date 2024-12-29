"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Car as CarType } from "@/lib/db/schema";
import { CarForm } from "./components/car-form";
import { CarList } from "./components/car-list";

export default function CarsPage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [selectedCar, setSelectedCar] = useState<Partial<CarType> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      const response = await fetch("/api/cars");
      const data = await response.json();
      setCars(data);
    };
    fetchCars();
  }, []);

  const handleSave = async (car: Partial<CarType>) => {
    if (selectedCar && selectedCar.id) {
      // Update existing car
      await fetch(`/api/cars/${selectedCar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });
      setAlertMessage("The car has been updated successfully.");
    } else {
      // Add new car
      await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });
      setAlertMessage("The car has been added successfully.");
    }

    // Refresh car list
    setOpen(false);
    const updatedCars = await fetch("/api/cars").then((res) => res.json());
    setCars(updatedCars);
    setSelectedCar(null);
    autoHideAlert();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/cars?id=${id}`, { method: "DELETE" });
    const updatedCars = await fetch("/api/cars").then((res) => res.json());
    setCars(updatedCars);
    setAlertMessage("The car has been deleted successfully.");
    autoHideAlert();
  };

  const autoHideAlert = () => {
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

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
                {isEditing ? "Edit the details of the selected car." : "Fill in the details of the new car."}
              </DialogDescription>
            </DialogHeader>
            <CarForm
              car={selectedCar}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      <CarList
        cars={cars}
        onEdit={(car: CarType) => {
          setIsEditing(true);
          setSelectedCar(car);
          setOpen(true);
        }}
        onDelete={(id: number) => setDeleteId(id)}
      />
      {deleteId !== null && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this car? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleDelete(deleteId);
                setDeleteId(null);
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {alertMessage && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
