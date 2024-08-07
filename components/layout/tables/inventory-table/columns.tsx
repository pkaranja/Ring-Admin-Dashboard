"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryVariant } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { NumberColumn } from "../number-column";
import { MoneyColumn } from "../money-colum";

export const columns: ColumnDef<InventoryVariant>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "fullName",
    accessorKey: "fullName",
    header: "Stock item",
  },
  {
    header: "Quantity",
    id: "quantity",
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const packaging = row.original.inventory?.packaging;
      const suffix = packaging ? `${packaging}${quantity === 1 ? '' : 's'}` : undefined;

      return <NumberColumn value={quantity} suffix={suffix} />;
    },
  },
  {
    header: "Total items count",
    id: "itemsCount",
    cell: ({ row }) => <NumberColumn value={row.original.itemsPerPackage * row.original.quantity} />,
  },
  {
    header: "Total value",
    id: "totalValue",
    cell: ({ row }) => (
        <MoneyColumn
            currency={row.original.inventory?.currency ?? "TZS"}
            value={row.original.value ?? 0}
        />
    ),
  },
  {
    header: "Value per item",
    id: "itemValue",
    cell: ({ row }) => (
        <MoneyColumn
            currency={row.original.inventory?.currency ?? "TZS"}
            value={row.original.value / row.original.quantity ?? 0}
        />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
