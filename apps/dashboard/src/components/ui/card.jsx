import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {React.HTMLAttributes<HTMLDivElement> & { className?: string }} CardProps
 */

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const Card = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow", className)}
    {...props} />
))
Card.displayName = "Card"

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const CardHeader = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const CardTitle = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const CardDescription = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const CardContent = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/** @type {React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>} */
const CardFooter = React.forwardRef((/** @type {CardProps} */ { className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
