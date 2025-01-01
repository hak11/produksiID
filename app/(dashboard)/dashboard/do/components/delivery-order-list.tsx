import React from "react"
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DeliveryOrder } from "@/lib/db/schema"

export type DeliveryOrderListType = DeliveryOrder & {
  supplierName: string
  customerName: string
  carInfo: string
}

export function DeliveryOrderList({
  deliveryOrders,
  onDelete,
}: {
  deliveryOrders: DeliveryOrderListType[]
  onDelete: (id: number) => void
}) {
  const columns: ColumnDef<DeliveryOrderListType>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "orderNumber",
      header: "Order Number",
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "carInfo",
      header: "Car",
    },
    {
      accessorKey: "orderDate",
      header: "Tanggal Order",
      cell: ({ row }) => (
        <span>{new Date(row.original.orderDate).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "deliveryDate",
      header: "Tanggal Kirim",
      cell: ({ row }) => (
        <span>{new Date(row.original.deliveryDate).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "deliveryStatus",
      header: "Status",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/do/${row.original.id}`}>
            <Button variant={"outline"}>
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => onDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: deliveryOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
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
  )
}
