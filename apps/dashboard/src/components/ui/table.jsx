import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {React.HTMLAttributes<HTMLTableElement> & { className?: string }} TableProps
 */

/** @type {React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>} */
const Table = React.forwardRef((/** @type {TableProps} */ { className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
))
Table.displayName = "Table"

/**
 * @typedef {React.HTMLAttributes<HTMLTableSectionElement> & { className?: string }} TableSectionProps
 */

/** @type {React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<HTMLTableSectionElement>>} */
const TableHeader = React.forwardRef((/** @type {TableSectionProps} */ { className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/** @type {React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<HTMLTableSectionElement>>} */
const TableBody = React.forwardRef((/** @type {TableSectionProps} */ { className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"

/** @type {React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<HTMLTableSectionElement>>} */
const TableFooter = React.forwardRef((/** @type {TableSectionProps} */ { className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"

/**
 * @typedef {React.HTMLAttributes<HTMLTableRowElement> & { className?: string }} TableRowProps
 */

/** @type {React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>} */
const TableRow = React.forwardRef((/** @type {TableRowProps} */ { className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"

/**
 * @typedef {React.ThHTMLAttributes<HTMLTableCellElement> & { className?: string }} TableHeadProps
 */

/** @type {React.ForwardRefExoticComponent<TableHeadProps & React.RefAttributes<HTMLTableCellElement>>} */
const TableHead = React.forwardRef((/** @type {TableHeadProps} */ { className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"

/**
 * @typedef {React.TdHTMLAttributes<HTMLTableCellElement> & { className?: string }} TableCellProps
 */

/** @type {React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>} */
const TableCell = React.forwardRef((/** @type {TableCellProps} */ { className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"

/**
 * @typedef {React.HTMLAttributes<HTMLTableCaptionElement> & { className?: string }} TableCaptionProps
 */

/** @type {React.ForwardRefExoticComponent<TableCaptionProps & React.RefAttributes<HTMLTableCaptionElement>>} */
const TableCaption = React.forwardRef((/** @type {TableCaptionProps} */ { className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
