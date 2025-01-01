"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Driver } from "@/lib/db/schema";
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils";
import { format } from 'date-fns';


export function DriverForm({
  driver,
  onSave,
  onClose,
}: {
  driver: Partial<Driver> | null;
  onSave: (driver: Partial<Driver>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: "",
    licenseNumber: "",
    contactNumber: "",
    email: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    if (driver) {
      setFormData(driver);
    }
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBOD = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, dateOfBirth: formattedDate });
    }
  };

  const handleHiredDate = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, hiredDate: formattedDate });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="name"
        placeholder="Name"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="licenseNumber"
        placeholder="License Number"
        value={formData.licenseNumber || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="contactNumber"
        placeholder="Contact Number"
        value={formData.contactNumber || ""}
        onChange={handleChange}
        required
      />
      <Input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData.dateOfBirth && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.dateOfBirth ? (
              new Date(formData.dateOfBirth).toLocaleDateString()
            ) : (
              <span>Pilih Tanggal Lahir</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className=" w-auto p-0">
          <Calendar
            mode="single"
            captionLayout="dropdown-buttons"
            selected={
              formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
            }
            onSelect={(date) => handleBOD(date ?? null)}
            fromYear={1960}
            toYear={2005}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData.hiredDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.hiredDate ? (
              new Date(formData.hiredDate).toLocaleDateString()
            ) : (
              <span>Pilih Tanggal Join Driver</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            captionLayout="dropdown-buttons"
            selected={
              formData.hiredDate ? new Date(formData.hiredDate) : undefined
            }
            onSelect={(date) => handleHiredDate(date ?? null)}
            fromYear={1960}
            toYear={2024}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        name="address"
        placeholder="Address"
        value={formData.address || ""}
        onChange={handleChange}
        required
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
