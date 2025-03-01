import React from "react"
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
import { Trash2, Edit, Building2Icon, PackageCheck } from 'lucide-react'
import { Badge, BadgeProps } from "@/components/ui/badge";

export type CompanyListType = {
  id: number
  name: string
  address: string
  picName: string
  companyRoles: string[]
}

export function CompanyList({
  companies,
  onEdit,
  onDelete,
}: {
  companies: CompanyListType[]
  onEdit: (companyID: number) => void
  onDelete: (id: number) => void
}) {
  const columns: ColumnDef<CompanyListType>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "picName",
      header: "Pic Name",
    },
    {
      id: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <ul className="space-y-2">
          {row.original.companyRoles.map((role) => (
          <li key={role}>
            <Badge
              variant={role === "customer" ? "info" as BadgeProps["variant"] : "warning" as BadgeProps["variant"]}
              className="items-center gap-2"
            >
              {role === "customer" ? (
                <Building2Icon className="w-4 h-4" />
              ) : (
                <PackageCheck className="w-4 h-4" />
              )}
              <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </Badge>
          </li>
        ))}
        </ul>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant={"outline"} onClick={() => onEdit(row.original.id)}>
            <Edit />
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: companies,
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
