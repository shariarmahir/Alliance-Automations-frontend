import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface TableColumn<Row> {
  label: string
  get: (row: Row) => ReactNode
  /** Classes for the cell text, such as a colour. */
  className?: string
}

interface ResponsiveTableProps<Row> {
  /** The first column is the row's heading. */
  columns: TableColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
}

/**
 * A comparison table from tablet width up; on a phone each row becomes a small stacked card, because three or four
 * narrow columns of prose cannot be read side by side.
 */
export function ResponsiveTable<Row>({ columns, rows, rowKey }: ResponsiveTableProps<Row>) {
  const [heading, ...rest] = columns

  return (
    <>
      <Table className="max-md:hidden">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.label}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column, index) => (
                <TableCell key={column.label} className={cn("align-top whitespace-normal", index === 0 ? "font-medium" : column.className)}>
                  {column.get(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ul className="flex flex-col divide-y md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
            <p className="font-medium">{heading.get(row)}</p>
            <dl className="grid gap-2.5 text-sm">
              {rest.map((column) => (
                <div key={column.label} className="grid gap-0.5">
                  <dt className="text-xs text-muted-foreground">{column.label}</dt>
                  <dd className={column.className}>{column.get(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
