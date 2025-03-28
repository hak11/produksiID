"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import type { Driver } from "@/lib/db/schema";
import { DriverForm } from "./components/driver-form";
import { DriverList } from "./components/driver-list";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Partial<Driver> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    try {
      const isUpdate = selectedDriver && selectedDriver.id;
      const url = "/api/drivers";
      const method = isUpdate ? "PUT" : "POST";
      const message = isUpdate ? "Data successfully saved" : "Data successfully created";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? "update" : "create"} driver: ${response.statusText}`);
      }

      toast.success(message);

      setOpen(false);
      const updatedDrivers = await fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.statusText}`);
        return res.json();
      });
      setDrivers(updatedDrivers);
      setSelectedDriver(null);
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast.error(`Error: ${error.message || "Something went wrong"}`);
    }

  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/drivers?id=${id}`, { method: "DELETE" });
      const updatedDrivers = await fetch("/api/drivers").then((res) => res.json());
      setDrivers(updatedDrivers);
      toast.success("Data successfully deleted");
      setDeleteId(null)
    } catch (error: any) {
      console.error("Error in handleDelete:", error);
      toast.error(`Error: ${error.message || "Something went wrong"}`);
    }
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
        <ConfirmationDialog
          open={deleteId !== null}
          title="Confirm Deletion"
          description="Are you sure you want to delete this driver?"
          onConfirm={() => handleDelete(deleteId)}
          confirmLabel="Delete"
          onCancel={() => setDeleteId(null)}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        />
      )}
      <DriverList
        drivers={drivers}
        onEdit={(driver) => {
          setIsEditing(true)
          setSelectedDriver(driver)
          setOpen(true)
        }}
        onDelete={(id: string) => setDeleteId(id)}
      />
    </div>
  )
}
