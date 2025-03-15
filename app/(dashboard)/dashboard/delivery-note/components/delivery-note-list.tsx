import React, { useState } from "react"
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
import { DeliveryNotes } from "@/lib/db/schema"
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Trash2, Loader, Download } from 'lucide-react'

export type DeliveryNoteListType = DeliveryNotes & {
  deliveryOrders: string[]
  totalItems: number
  // carInfo: string
}

const badgeVariants = (status: string) => {
  switch (status) {
    case "draf":
      return "outline" as BadgeProps["variant"]
    case "printed":
      return "info" as BadgeProps["variant"]
    case "delivered":
      return "success" as BadgeProps["variant"]
    case "canceled":
      return "destructive" as BadgeProps["variant"]
    default:
      return "warning" as BadgeProps["variant"]
  }
}

export function DeliveryNoteList({
  deliveryOrders,
  handleDownloadDO,
  onDelete,
}: {
  deliveryOrders: DeliveryNoteListType[]
  handleDownloadDO: (id: string, callback: () => void) => void
  onDelete: (id: string) => void
}) {
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const columns: ColumnDef<DeliveryNoteListType>[] = [
    {
      accessorKey: "noteNumber",
      header: "DN Number",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/delivery-order/${row.original.id}`}
          className="underline"
        >
          {row.original.noteNumber}
        </Link>
      ),
    },
    {
      accessorKey: "deliveryOrders",
      header: "List DO Number",
      cell: ({ row }) => {
        for (let i = 0; i < row.original.deliveryOrders.length; i++) {
          return (
            <Link
              href={`/dashboard/delivery-order/${row.original.deliveryOrders[i]}`}
              className="underline"
            >
              {row.original.deliveryOrders[i]}
            </Link>
          )
        }
      },
    },
    {
      accessorKey: "totalItems",
      header: "Total DO Items",
    },
    {
      accessorKey: "issueDate",
      header: "Tanggal Buat",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={badgeVariants(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isLoading = loadingIds.includes(row.original.id)

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setLoadingIds((prev) => [...prev, row.original.id])

                handleDownloadDO(row.original.id, () => {
                  setLoadingIds((prev) =>
                    prev.filter((id) => id !== row.original.id)
                  )
                })
              }}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <div className="flex">
                  <Download size={8} />
                </div>
              )}
              Cetak
            </Button>
            <Button
              variant="destructive"
              disabled={row.original.status !== "draft"}
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 />
            </Button>
          </div>
        )
      },
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
