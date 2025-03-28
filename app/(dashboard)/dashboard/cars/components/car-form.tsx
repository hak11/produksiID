"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Car as CarType, Driver as DriverType } from "@/lib/db/schema";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export function CarForm({
  car,
  drivers,
  onSave,
  onClose,
}: {
  car: Partial<CarType> | null;
  drivers: DriverType[];
  onSave: (car: Partial<CarType>, drivers: string[]) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CarType>>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    vin: "",
    color: "",
    status: "available",
    lastMaintenanceDate: "",
  });

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, lastMaintenanceDate: formattedDate });
    }
  };

  const handleDriverSelection = (driverId: string) => {
    if (!selectedDrivers.includes(driverId)) {
      setSelectedDrivers((prev) => [...prev, driverId]);
    } else {
      setSelectedDrivers((prev) => prev.filter((id) => id !== driverId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, selectedDrivers); // Pass drivers as a separate argument
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="brand"
        placeholder="Brand"
        value={formData.brand || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="model"
        placeholder="Model"
        value={formData.model || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="year"
        type="number"
        placeholder="Year"
        value={formData.year || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="licensePlate"
        placeholder="License Plate"
        value={formData.licensePlate || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="vin"
        placeholder="VIN"
        value={formData.vin || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="color"
        placeholder="Color"
        value={formData.color || ""}
        onChange={handleChange}
        required
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData.lastMaintenanceDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.lastMaintenanceDate
              ? new Date(formData.lastMaintenanceDate).toLocaleDateString()
              : "Pilih Tanggal Maintenance"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            captionLayout="dropdown-buttons"
            selected={
              formData.lastMaintenanceDate
                ? new Date(formData.lastMaintenanceDate)
                : undefined
            }
            onSelect={(date) => handleDateChange(date ?? null)}
            fromYear={1960}
            toYear={2030}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div>
        <h3 className="text-lg font-bold">Assign Drivers</h3>
        <Select onValueChange={(value) => handleDriverSelection(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Driver" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id.toString()}>
                {driver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="mt-2 space-y-1">
          {selectedDrivers.map((driverId) => (
            <li key={driverId} className="flex items-center justify-between">
              <span>
                {drivers.find((driver) => driver.id === driverId)?.name}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDriverSelection(driverId)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
