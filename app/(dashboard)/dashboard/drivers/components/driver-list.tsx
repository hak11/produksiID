"use client";

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

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
}

export function DriverList({
  drivers,
  onEdit,
  onDelete,
}: {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
}) {
  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "licenseNumber",
      header: "License Number",
    },
    {
      accessorKey: "contactNumber",
      header: "Contact Number",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(row.original)}>
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
    data: drivers,
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
