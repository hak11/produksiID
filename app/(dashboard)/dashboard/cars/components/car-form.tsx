
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Car as CarType } from "@/lib/db/schema";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CarForm({
  car,
  onSave,
  onClose,
}: {
  car: Partial<CarType> | null;
  onSave: (car: Partial<CarType>) => void;
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
      setFormData({ ...formData, lastMaintenanceDate: date.toISOString() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              : <span>Select maintenance date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={formData.lastMaintenanceDate ? new Date(formData.lastMaintenanceDate) : undefined}
            onSelect={(date) => handleDateChange(date ?? null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
