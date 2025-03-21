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
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react'

export type DeliveryOrderListType = DeliveryOrder & {
  supplierName: string
  customerName: string
  carInfo: string
}

const badgeVariants = (status: string) => {
  switch (status) {
    case "pending":
      return "warning" as BadgeProps["variant"]
    case "in_progress":
      return "info" as BadgeProps["variant"]
    case "completed":
      return "success" as BadgeProps["variant"]
    case "canceled":
      return "destructive" as BadgeProps["variant"]
    default:
      return "warning" as BadgeProps["variant"]
  }
}

export function DeliveryOrderList({
  deliveryOrders,
  onDelete,
}: {
  deliveryOrders: DeliveryOrderListType[]
  onDelete: (id: string) => void
}) {

  const columns: ColumnDef<DeliveryOrderListType>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order Number",
      cell: ({ row }) => (
        <Link href={`/dashboard/delivery-order/${row.original.id}`} className="underline">
          {row.original.orderNumber}
        </Link>
      )
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
      cell: ({ row }) => (
        <Badge variant={(badgeVariants(row.original.deliveryStatus))}>{row.original.deliveryStatus}</Badge>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 />
            </Button>
          </div>
        )
      }
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
