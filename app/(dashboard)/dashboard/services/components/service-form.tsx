"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/db/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast";

// Define validation schema using Zod
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  unit: z.string(),
  priceStr: z.string().default("Rp 0"),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service: Partial<Service> | null;
  onSave: (service: Partial<Service>) => void;
  onClose: () => void;
}) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: "",
      unit: "",
      priceStr: "Rp 0",
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name || "",
        price: service.price?.toString() || "0",
        unit: service.unit || "",
        priceStr: service.price ? formatCurrency(service.price) : "Rp 0",
      });
    }
  }, [service, form]);

  const handleChangePrice = (value: string) => {
    try {
      const numericValue = value.replace(/[^\d]/g, "")
      form.setValue("price", numericValue)
      const formattedValue = formatCurrency(value)
      form.setValue("priceStr", formattedValue)
    } catch (error) {
      console.log("🚀 ~ handleChangePrice ~ error:", error)
      toast.error("Invalid price format")
    }
  };

  const onSubmit = (data: ServiceFormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="priceStr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Price"
                  onChange={(e) => handleChangePrice(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input placeholder="Kg / Ctn / Box / Etc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  )
}
