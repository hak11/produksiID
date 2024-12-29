"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Driver } from "@/lib/db/schema";
import { DriverForm } from "./components/driver-form";
import { DriverList } from "./components/driver-list";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Partial<Driver> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      const response = await fetch("/api/drivers");
      const data = await response.json();
      setDrivers(data);
    };
    fetchDrivers();
  }, []);

  const handleSave = async (driver: Partial<Driver>) => {
    if (selectedDriver && selectedDriver.id) {
      // Update existing driver
      await fetch(`/api/drivers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });
      toast.success("Data successfully saved");
    } else {
      // Add new driver
      await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });
      toast.success("Data successfully created");
    }

    // Refresh driver list
    setOpen(false);
    const updatedDrivers = await fetch("/api/drivers").then((res) => res.json());
    setDrivers(updatedDrivers);
    setSelectedDriver(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/drivers?id=${id}`, { method: "DELETE" });
    const updatedDrivers = await fetch("/api/drivers").then((res) => res.json());
    setDrivers(updatedDrivers);
    toast.success("Data successfully deleted");
  };

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Drivers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedDriver(null)}>Add Driver</Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Driver</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edit the details of the selected driver." : ""}
              </DialogDescription>
            </DialogHeader>
            <DriverForm
              driver={selectedDriver}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      {deleteId !== null && (
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this driver? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <DriverList
        drivers={drivers}
        onEdit={(driver) => {
          setIsEditing(true);
          setSelectedDriver(driver);
          setOpen(true);
        }}
        onDelete={(id: number) => setDeleteId(id)}
      />
    </div>
  );
}
