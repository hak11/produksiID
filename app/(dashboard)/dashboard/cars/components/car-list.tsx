import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from 'lucide-react'

interface Car {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  drivers: { id: number; name: string }[]; // Include driver details
}

export function CarList({
  cars,
  onEdit,
  onDelete,
}: {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (id: number) => void;
}) {
  const columns: ColumnDef<Car>[] = [
    {
      accessorKey: "brand",
      header: "Brand",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "licensePlate",
      header: "License Plate",
    },
    {
      id: "drivers",
      header: "Drivers",
      cell: ({ row }) => (
        <ul>
          {row.original.drivers.map((driver) => (
            <li key={driver.id}>{driver.name}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant={"outline"} onClick={() => onEdit(row.original)}>
            <Edit />
          </Button>
          <Button variant="destructive" onClick={() => onDelete(row.original.id)}>
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: cars,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
