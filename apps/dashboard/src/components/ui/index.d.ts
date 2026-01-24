import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

// ============================================================================
// Common Types
// ============================================================================
type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type HTMLInputProps = React.InputHTMLAttributes<HTMLInputElement>;
type HTMLFormProps = React.FormHTMLAttributes<HTMLFormElement>;
type HTMLTableProps = React.TableHTMLAttributes<HTMLTableElement>;
type HTMLLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

// ============================================================================
// Accordion
// ============================================================================
export const Accordion: React.FC<HTMLDivProps & { type?: 'single' | 'multiple'; collapsible?: boolean; defaultValue?: string | string[]; value?: string | string[]; onValueChange?: (value: string | string[]) => void }>;
export const AccordionItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;
export const AccordionTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const AccordionContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Alert Dialog
// ============================================================================
export const AlertDialog: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
export const AlertDialogTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const AlertDialogContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const AlertDialogHeader: React.FC<HTMLDivProps>;
export const AlertDialogFooter: React.FC<HTMLDivProps>;
export const AlertDialogTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
export const AlertDialogDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
export const AlertDialogAction: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const AlertDialogCancel: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Alert
// ============================================================================
export const Alert: React.ForwardRefExoticComponent<HTMLDivProps & { variant?: 'default' | 'destructive' } & React.RefAttributes<HTMLDivElement>>;
export const AlertTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
export const AlertDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;

// ============================================================================
// Aspect Ratio
// ============================================================================
export const AspectRatio: React.ForwardRefExoticComponent<HTMLDivProps & { ratio?: number } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Avatar
// ============================================================================
export const Avatar: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLSpanElement>>;
export const AvatarImage: React.ForwardRefExoticComponent<React.ImgHTMLAttributes<HTMLImageElement> & React.RefAttributes<HTMLImageElement>>;
export const AvatarFallback: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLSpanElement>>;

// ============================================================================
// Badge
// ============================================================================
export const badgeVariants: (props?: { variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }) => string;
export interface BadgeProps extends HTMLDivProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
export const Badge: React.FC<BadgeProps>;

// ============================================================================
// Breadcrumb
// ============================================================================
export const Breadcrumb: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
export const BreadcrumbList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLOListElement> & React.RefAttributes<HTMLOListElement>>;
export const BreadcrumbItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export const BreadcrumbLink: React.ForwardRefExoticComponent<React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean } & React.RefAttributes<HTMLAnchorElement>>;
export const BreadcrumbPage: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLSpanElement>>;
export const BreadcrumbSeparator: React.FC<React.HTMLAttributes<HTMLLIElement>>;
export const BreadcrumbEllipsis: React.FC<HTMLDivProps>;

// ============================================================================
// Button
// ============================================================================
export const buttonVariants: (props?: { variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; size?: 'default' | 'sm' | 'lg' | 'icon'; className?: string }) => string;
export interface ButtonProps extends HTMLButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Calendar
// ============================================================================
export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void;
  disabled?: boolean | ((date: Date) => boolean);
  initialFocus?: boolean;
  numberOfMonths?: number;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  fromDate?: Date;
  toDate?: Date;
  fromYear?: number;
  toYear?: number;
  captionLayout?: 'dropdown' | 'buttons' | 'dropdown-buttons';
  locale?: any;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ISOWeek?: boolean;
  modifiers?: Record<string, Date | Date[] | ((date: Date) => boolean)>;
  modifiersClassNames?: Record<string, string>;
  modifiersStyles?: Record<string, React.CSSProperties>;
  styles?: Record<string, React.CSSProperties>;
  components?: Record<string, React.ComponentType<any>>;
  footer?: React.ReactNode;
}
export const Calendar: React.FC<CalendarProps>;

// ============================================================================
// Card
// ============================================================================
export const Card: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CardHeader: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CardTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CardDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CardContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CardFooter: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Carousel
// ============================================================================
export const Carousel: React.ForwardRefExoticComponent<HTMLDivProps & { opts?: any; plugins?: any[]; orientation?: 'horizontal' | 'vertical'; setApi?: (api: any) => void } & React.RefAttributes<HTMLDivElement>>;
export const CarouselContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CarouselItem: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CarouselPrevious: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const CarouselNext: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export function useCarousel(): { scrollPrev: () => void; scrollNext: () => void; canScrollPrev: boolean; canScrollNext: boolean };

// ============================================================================
// Chart
// ============================================================================
export const ChartContainer: React.ForwardRefExoticComponent<HTMLDivProps & { config: Record<string, any> } & React.RefAttributes<HTMLDivElement>>;
export const ChartTooltip: React.FC<any>;
export const ChartTooltipContent: React.FC<any>;
export const ChartLegend: React.FC<any>;
export const ChartLegendContent: React.FC<any>;
export const ChartStyle: React.FC<{ id: string; config: Record<string, any> }>;

// ============================================================================
// Checkbox
// ============================================================================
export interface CheckboxProps extends Omit<HTMLButtonProps, 'onChange'> {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
}
export const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Collapsible
// ============================================================================
export const Collapsible: React.FC<HTMLDivProps & { open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean }>;
export const CollapsibleTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const CollapsibleContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Command
// ============================================================================
export const Command: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CommandDialog: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
export const CommandInput: React.ForwardRefExoticComponent<HTMLInputProps & React.RefAttributes<HTMLInputElement>>;
export const CommandList: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CommandEmpty: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CommandGroup: React.ForwardRefExoticComponent<HTMLDivProps & { heading?: React.ReactNode } & React.RefAttributes<HTMLDivElement>>;
export const CommandItem: React.ForwardRefExoticComponent<HTMLDivProps & { disabled?: boolean; onSelect?: (value: string) => void; value?: string } & React.RefAttributes<HTMLDivElement>>;
export const CommandSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const CommandShortcut: React.FC<HTMLDivProps>;

// ============================================================================
// Context Menu
// ============================================================================
export const ContextMenu: React.FC<{ children?: React.ReactNode }>;
export const ContextMenuTrigger: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLSpanElement>>;
export const ContextMenuContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuItem: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<HTMLDivProps & { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuRadioGroup: React.FC<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void }>;
export const ContextMenuRadioItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuLabel: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuShortcut: React.FC<HTMLDivProps>;
export const ContextMenuSub: React.FC<{ children?: React.ReactNode }>;
export const ContextMenuSubTrigger: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const ContextMenuSubContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Dialog
// ============================================================================
export const Dialog: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; modal?: boolean }>;
export const DialogTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const DialogPortal: React.FC<{ children?: React.ReactNode; container?: HTMLElement }>;
export const DialogOverlay: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const DialogContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const DialogHeader: React.FC<HTMLDivProps>;
export const DialogFooter: React.FC<HTMLDivProps>;
export const DialogTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
export const DialogDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
export const DialogClose: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Drawer
// ============================================================================
export const Drawer: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; shouldScaleBackground?: boolean; direction?: 'top' | 'bottom' | 'left' | 'right' }>;
export const DrawerTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const DrawerPortal: React.FC<{ children?: React.ReactNode }>;
export const DrawerOverlay: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const DrawerContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const DrawerHeader: React.FC<HTMLDivProps>;
export const DrawerFooter: React.FC<HTMLDivProps>;
export const DrawerTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
export const DrawerDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
export const DrawerClose: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Dropdown Menu
// ============================================================================
export const DropdownMenu: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; modal?: boolean }>;
export const DropdownMenuTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const DropdownMenuContent: React.ForwardRefExoticComponent<HTMLDivProps & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuItem: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<HTMLDivProps & { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuRadioGroup: React.FC<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void }>;
export const DropdownMenuRadioItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuLabel: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuShortcut: React.FC<HTMLDivProps>;
export const DropdownMenuGroup: React.FC<HTMLDivProps>;
export const DropdownMenuPortal: React.FC<{ children?: React.ReactNode }>;
export const DropdownMenuSub: React.FC<{ children?: React.ReactNode }>;
export const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const DropdownMenuSubContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Form (react-hook-form integration)
// ============================================================================
export const Form: React.FC<HTMLFormProps & { children?: React.ReactNode }>;
export const FormField: React.FC<{ control?: any; name: string; render: (props: { field: any; fieldState: any; formState: any }) => React.ReactNode }>;
export const FormItem: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const FormLabel: React.ForwardRefExoticComponent<HTMLLabelProps & React.RefAttributes<HTMLLabelElement>>;
export const FormControl: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const FormDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
export const FormMessage: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
export function useFormField(): { id: string; name: string; formItemId: string; formDescriptionId: string; formMessageId: string; error?: any };

// ============================================================================
// Hover Card
// ============================================================================
export const HoverCard: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; openDelay?: number; closeDelay?: number }>;
export const HoverCardTrigger: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLAnchorElement>>;
export const HoverCardContent: React.ForwardRefExoticComponent<HTMLDivProps & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Input
// ============================================================================
export interface InputProps extends HTMLInputProps {}
export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

// ============================================================================
// Input OTP
// ============================================================================
export const InputOTP: React.ForwardRefExoticComponent<HTMLInputProps & { maxLength: number; containerClassName?: string; render?: (props: { slots: any[] }) => React.ReactNode } & React.RefAttributes<HTMLInputElement>>;
export const InputOTPGroup: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const InputOTPSlot: React.ForwardRefExoticComponent<HTMLDivProps & { index: number } & React.RefAttributes<HTMLDivElement>>;
export const InputOTPSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Label
// ============================================================================
export interface LabelProps extends HTMLLabelProps {}
export const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;

// ============================================================================
// Menubar
// ============================================================================
export const Menubar: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const MenubarMenu: React.FC<{ children?: React.ReactNode }>;
export const MenubarTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const MenubarContent: React.ForwardRefExoticComponent<HTMLDivProps & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>>;
export const MenubarItem: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const MenubarCheckboxItem: React.ForwardRefExoticComponent<HTMLDivProps & { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.RefAttributes<HTMLDivElement>>;
export const MenubarRadioGroup: React.FC<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void }>;
export const MenubarRadioItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;
export const MenubarLabel: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const MenubarSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const MenubarShortcut: React.FC<HTMLDivProps>;
export const MenubarGroup: React.FC<HTMLDivProps>;
export const MenubarPortal: React.FC<{ children?: React.ReactNode }>;
export const MenubarSub: React.FC<{ children?: React.ReactNode }>;
export const MenubarSubTrigger: React.ForwardRefExoticComponent<HTMLDivProps & { inset?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const MenubarSubContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Navigation Menu
// ============================================================================
export const NavigationMenu: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const NavigationMenuList: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLUListElement>>;
export const NavigationMenuItem: React.FC<HTMLDivProps>;
export const NavigationMenuTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const NavigationMenuContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const NavigationMenuLink: React.ForwardRefExoticComponent<React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean } & React.RefAttributes<HTMLAnchorElement>>;
export const NavigationMenuViewport: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const NavigationMenuIndicator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const navigationMenuTriggerStyle: () => string;

// ============================================================================
// Pagination
// ============================================================================
export const Pagination: React.FC<React.HTMLAttributes<HTMLElement>>;
export const PaginationContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLUListElement>>;
export const PaginationItem: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLLIElement>>;
export const PaginationLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean; size?: 'default' | 'sm' | 'lg' | 'icon' }>;
export const PaginationPrevious: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
export const PaginationNext: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
export const PaginationEllipsis: React.FC<HTMLDivProps>;

// ============================================================================
// Popover
// ============================================================================
export const Popover: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; modal?: boolean }>;
export const PopoverTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const PopoverContent: React.ForwardRefExoticComponent<HTMLDivProps & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>>;
export const PopoverAnchor: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Progress
// ============================================================================
export interface ProgressProps extends HTMLDivProps {
  value?: number;
  max?: number;
}
export const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Radio Group
// ============================================================================
export const RadioGroup: React.ForwardRefExoticComponent<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const RadioGroupItem: React.ForwardRefExoticComponent<HTMLButtonProps & { value: string } & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Resizable
// ============================================================================
export const ResizablePanelGroup: React.FC<HTMLDivProps & { direction?: 'horizontal' | 'vertical'; onLayout?: (sizes: number[]) => void; autoSaveId?: string }>;
export const ResizablePanel: React.ForwardRefExoticComponent<HTMLDivProps & { defaultSize?: number; minSize?: number; maxSize?: number; collapsible?: boolean; collapsedSize?: number; onCollapse?: () => void; onExpand?: () => void; onResize?: (size: number) => void } & React.RefAttributes<HTMLDivElement>>;
export const ResizableHandle: React.FC<HTMLDivProps & { withHandle?: boolean; disabled?: boolean }>;

// ============================================================================
// Scroll Area
// ============================================================================
export const ScrollArea: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const ScrollBar: React.ForwardRefExoticComponent<HTMLDivProps & { orientation?: 'vertical' | 'horizontal' } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Select
// ============================================================================
export const Select: React.FC<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string; open?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; name?: string; required?: boolean }>;
export const SelectGroup: React.FC<HTMLDivProps>;
export const SelectValue: React.FC<HTMLDivProps & { placeholder?: React.ReactNode }>;
export const SelectTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const SelectContent: React.ForwardRefExoticComponent<HTMLDivProps & { position?: 'item-aligned' | 'popper' } & React.RefAttributes<HTMLDivElement>>;
export const SelectLabel: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SelectItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const SelectSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SelectScrollUpButton: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SelectScrollDownButton: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Separator
// ============================================================================
export const Separator: React.ForwardRefExoticComponent<HTMLDivProps & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Sheet
// ============================================================================
export const Sheet: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; modal?: boolean }>;
export const SheetTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const SheetClose: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const SheetPortal: React.FC<{ children?: React.ReactNode }>;
export const SheetOverlay: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SheetContent: React.ForwardRefExoticComponent<HTMLDivProps & { side?: 'top' | 'right' | 'bottom' | 'left' } & React.RefAttributes<HTMLDivElement>>;
export const SheetHeader: React.FC<HTMLDivProps>;
export const SheetFooter: React.FC<HTMLDivProps>;
export const SheetTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
export const SheetDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;

// ============================================================================
// Sidebar
// ============================================================================
export interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}
export function useSidebar(): SidebarContextValue;
export const SidebarProvider: React.ForwardRefExoticComponent<HTMLDivProps & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void } & React.RefAttributes<HTMLDivElement>>;
export const Sidebar: React.ForwardRefExoticComponent<HTMLDivProps & { side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset'; collapsible?: 'offcanvas' | 'icon' | 'none' } & React.RefAttributes<HTMLDivElement>>;
export const SidebarTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const SidebarRail: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const SidebarInset: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
export const SidebarInput: React.ForwardRefExoticComponent<HTMLInputProps & React.RefAttributes<HTMLInputElement>>;
export const SidebarHeader: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarFooter: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarGroup: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarGroupLabel: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const SidebarGroupAction: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const SidebarGroupContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarMenu: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export const SidebarMenuItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export const SidebarMenuButton: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean; isActive?: boolean; variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg'; tooltip?: string | any } & React.RefAttributes<HTMLButtonElement>>;
export const SidebarMenuAction: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean; showOnHover?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const SidebarMenuBadge: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarMenuSkeleton: React.ForwardRefExoticComponent<HTMLDivProps & { showIcon?: boolean } & React.RefAttributes<HTMLDivElement>>;
export const SidebarMenuSub: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export const SidebarMenuSubItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export const SidebarMenuSubButton: React.ForwardRefExoticComponent<React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; size?: 'sm' | 'md'; isActive?: boolean } & React.RefAttributes<HTMLAnchorElement>>;

// ============================================================================
// Skeleton
// ============================================================================
export const Skeleton: React.FC<HTMLDivProps>;

// ============================================================================
// Slider
// ============================================================================
export const Slider: React.ForwardRefExoticComponent<HTMLDivProps & { value?: number[]; onValueChange?: (value: number[]) => void; defaultValue?: number[]; min?: number; max?: number; step?: number; disabled?: boolean; orientation?: 'horizontal' | 'vertical' } & React.RefAttributes<HTMLSpanElement>>;

// ============================================================================
// Sonner (Toast)
// ============================================================================
export const Toaster: React.FC<{ position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'; expand?: boolean; richColors?: boolean; closeButton?: boolean; duration?: number; theme?: 'light' | 'dark' | 'system'; className?: string; toastOptions?: any }>;

// ============================================================================
// Switch
// ============================================================================
export interface SwitchProps extends Omit<HTMLButtonProps, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Table
// ============================================================================
export const Table: React.ForwardRefExoticComponent<HTMLTableProps & React.RefAttributes<HTMLTableElement>>;
export const TableHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
export const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
export const TableFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
export const TableRow: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>>;
export const TableHead: React.ForwardRefExoticComponent<React.ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
export const TableCell: React.ForwardRefExoticComponent<React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
export const TableCaption: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableCaptionElement> & React.RefAttributes<HTMLTableCaptionElement>>;

// ============================================================================
// Tabs
// ============================================================================
export const Tabs: React.FC<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string }>;
export const TabsList: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const TabsTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { value: string; disabled?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const TabsContent: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Textarea
// ============================================================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;

// ============================================================================
// Toast (Radix)
// ============================================================================
export const ToastProvider: React.FC<{ children?: React.ReactNode; duration?: number; swipeDirection?: 'right' | 'left' | 'up' | 'down'; swipeThreshold?: number }>;
export const ToastViewport: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLOListElement>>;
export const Toast: React.ForwardRefExoticComponent<HTMLDivProps & { variant?: 'default' | 'destructive'; open?: boolean; onOpenChange?: (open: boolean) => void } & React.RefAttributes<HTMLLIElement>>;
export const ToastTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const ToastDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
export const ToastClose: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
export const ToastAction: React.ForwardRefExoticComponent<HTMLButtonProps & { altText: string } & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Toggle
// ============================================================================
export const toggleVariants: (props?: { variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg'; className?: string }) => string;
export interface ToggleProps extends HTMLButtonProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}
export const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Toggle Group
// ============================================================================
export const ToggleGroup: React.ForwardRefExoticComponent<HTMLDivProps & { type?: 'single' | 'multiple'; value?: string | string[]; onValueChange?: (value: string | string[]) => void; variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg' } & React.RefAttributes<HTMLDivElement>>;
export const ToggleGroupItem: React.ForwardRefExoticComponent<HTMLButtonProps & { value: string; variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg' } & React.RefAttributes<HTMLButtonElement>>;

// ============================================================================
// Tooltip
// ============================================================================
export const TooltipProvider: React.FC<{ children?: React.ReactNode; delayDuration?: number; skipDelayDuration?: number; disableHoverableContent?: boolean }>;
export const Tooltip: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; delayDuration?: number }>;
export const TooltipTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export const TooltipContent: React.ForwardRefExoticComponent<HTMLDivProps & { side?: 'top' | 'right' | 'bottom' | 'left'; sideOffset?: number; align?: 'start' | 'center' | 'end' } & React.RefAttributes<HTMLDivElement>>;

// ============================================================================
// Use Toast Hook
// ============================================================================
export interface ToastData {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive';
}
export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: 'default' | 'destructive';
}
export interface ToastReturn {
  id: string;
  dismiss: () => void;
  update: (props: ToastOptions) => void;
}
export function toast(options: ToastOptions): ToastReturn;
export interface UseToastReturn {
  toasts: ToastData[];
  toast: typeof toast;
  dismiss: (toastId?: string) => void;
}
export function useToast(): UseToastReturn;

// ============================================================================
// Hooks
// ============================================================================
export function useIsMobile(): boolean;
