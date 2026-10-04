"use client"

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

type Features = typeof dataTableFeatures

export type DataTableColumn<TData extends RowData> = ColumnDef<Features, TData, any>

export const columnHelper = <TData extends RowData>() => createColumnHelper<Features, TData>()

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumn<TData>[]
  data: TData[]
  searchPlaceholder?: string
  pageSize?: number
  toolbar?: ReactNode
  getRowId?: (row: TData) => string
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Search…",
  pageSize = 15,
  toolbar,
  getRowId,
  onRowClick,
  rowClassName,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    globalFilterFn: "includesString",
    autoResetPageIndex: false,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  const { pageIndex } = table.state.pagination
  const filtered = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            value={String(table.state.globalFilter ?? "")}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value)
              table.setPageIndex(0)
            }}
            placeholder={searchPlaceholder}
            aria-label="Search table"
          />
        </InputGroup>
        {toolbar}
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
                  return (
                    <TableHead key={header.id} className="h-10 text-xs font-medium tracking-wide uppercase">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          <SortIcon className={cn("size-3", !sorted && "opacity-40")} aria-hidden />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer", rowClassName?.(row.original))}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                  No matching rows.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="tabular">
          {filtered} {filtered === 1 ? "row" : "rows"}
        </span>
        <div className="flex items-center gap-2">
          <span className="tabular">
            Page {Math.min(pageIndex + 1, pageCount)} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
