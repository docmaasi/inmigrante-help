// Type declarations for UI components
// These declarations enable TypeScript to understand the JSX components

declare module '@/components/ui/card' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const Card: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const CardHeader: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const CardTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const CardDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const CardContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const CardFooter: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/button' {
  import * as React from 'react';
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export interface ButtonProps extends HTMLButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const buttonVariants: (props?: { variant?: string; size?: string; className?: string }) => string;
}

declare module '@/components/ui/badge' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export interface BadgeProps extends HTMLDivProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
  export const Badge: React.FC<BadgeProps>;
  export const badgeVariants: (props?: { variant?: string; className?: string }) => string;
}

declare module '@/components/ui/avatar' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const Avatar: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLSpanElement>>;
  export const AvatarImage: React.ForwardRefExoticComponent<React.ImgHTMLAttributes<HTMLImageElement> & React.RefAttributes<HTMLImageElement>>;
  export const AvatarFallback: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLSpanElement>>;
}

declare module '@/components/ui/calendar' {
  import * as React from 'react';
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
    [key: string]: unknown;
  }
  export const Calendar: React.FC<CalendarProps>;
}

declare module '@/components/ui/popover' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const Popover: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; modal?: boolean }>;
  export const PopoverTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const PopoverContent: React.ForwardRefExoticComponent<HTMLDivProps & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>>;
  export const PopoverAnchor: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/select' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const Select: React.FC<{ children?: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string; open?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; name?: string; required?: boolean }>;
  export const SelectGroup: React.FC<HTMLDivProps>;
  export const SelectValue: React.FC<HTMLDivProps & { placeholder?: React.ReactNode }>;
  export const SelectTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const SelectContent: React.ForwardRefExoticComponent<HTMLDivProps & { position?: 'item-aligned' | 'popper' } & React.RefAttributes<HTMLDivElement>>;
  export const SelectLabel: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const SelectItem: React.ForwardRefExoticComponent<HTMLDivProps & { value: string; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
  export const SelectSeparator: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/table' {
  import * as React from 'react';
  type HTMLTableProps = React.TableHTMLAttributes<HTMLTableElement>;
  export const Table: React.ForwardRefExoticComponent<HTMLTableProps & React.RefAttributes<HTMLTableElement>>;
  export const TableHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableRow: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>>;
  export const TableHead: React.ForwardRefExoticComponent<React.ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
  export const TableCell: React.ForwardRefExoticComponent<React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
  export const TableCaption: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableCaptionElement> & React.RefAttributes<HTMLTableCaptionElement>>;
}

declare module '@/components/ui/dropdown-menu' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
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
}

declare module '@/components/ui/collapsible' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const Collapsible: React.FC<HTMLDivProps & { open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; asChild?: boolean }>;
  export const CollapsibleTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const CollapsibleContent: React.ForwardRefExoticComponent<HTMLDivProps & { asChild?: boolean } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/switch' {
  import * as React from 'react';
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export interface SwitchProps extends Omit<HTMLButtonProps, 'onChange'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }
  export const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/input' {
  import * as React from 'react';
  type HTMLInputProps = React.InputHTMLAttributes<HTMLInputElement>;
  export interface InputProps extends HTMLInputProps {}
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
}

declare module '@/components/ui/label' {
  import * as React from 'react';
  type HTMLLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;
  export interface LabelProps extends HTMLLabelProps {}
  export const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
}

declare module '@/components/ui/textarea' {
  import * as React from 'react';
  export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
  export const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
}

declare module '@/components/ui/tabs' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const Tabs: React.FC<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string }>;
  export const TabsList: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const TabsTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { value: string; disabled?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const TabsContent: React.ForwardRefExoticComponent<HTMLDivProps & { value: string } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/dialog' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
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
}

declare module '@/components/ui/sidebar' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  type HTMLInputProps = React.InputHTMLAttributes<HTMLInputElement>;

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
  export const SidebarMenuButton: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean; isActive?: boolean; variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg'; tooltip?: string | Record<string, unknown> } & React.RefAttributes<HTMLButtonElement>>;
  export const SidebarMenuAction: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean; showOnHover?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const SidebarMenuBadge: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const SidebarMenuSkeleton: React.ForwardRefExoticComponent<HTMLDivProps & { showIcon?: boolean } & React.RefAttributes<HTMLDivElement>>;
  export const SidebarMenuSub: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
  export const SidebarMenuSubItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
  export const SidebarMenuSubButton: React.ForwardRefExoticComponent<React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; size?: 'sm' | 'md'; isActive?: boolean } & React.RefAttributes<HTMLAnchorElement>>;
}

declare module '@/components/ui/role-badge' {
  import * as React from 'react';
  import type { UserRole } from '@/types/permissions';
  export { UserRole };
  export interface RoleBadgeProps {
    role: UserRole | string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
  }
  export const RoleBadge: React.FC<RoleBadgeProps>;
  export function isSuperAdminRole(role: string | null | undefined): boolean;
  export function isAdminRole(role: string | null | undefined): boolean;
}

declare module '@/components/ui/scroll-area' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const ScrollArea: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const ScrollBar: React.ForwardRefExoticComponent<HTMLDivProps & { orientation?: 'vertical' | 'horizontal' } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/separator' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const Separator: React.ForwardRefExoticComponent<HTMLDivProps & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/tooltip' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const TooltipProvider: React.FC<{ children?: React.ReactNode; delayDuration?: number; skipDelayDuration?: number; disableHoverableContent?: boolean }>;
  export const Tooltip: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; delayDuration?: number }>;
  export const TooltipTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const TooltipContent: React.ForwardRefExoticComponent<HTMLDivProps & { side?: 'top' | 'right' | 'bottom' | 'left'; sideOffset?: number; align?: 'start' | 'center' | 'end' } & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/skeleton' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const Skeleton: React.FC<HTMLDivProps>;
}

declare module '@/components/ui/alert' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export const Alert: React.ForwardRefExoticComponent<HTMLDivProps & { variant?: 'default' | 'destructive' } & React.RefAttributes<HTMLDivElement>>;
  export const AlertTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
}

declare module '@/components/ui/alert-dialog' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const AlertDialog: React.FC<{ children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const AlertDialogTrigger: React.ForwardRefExoticComponent<HTMLButtonProps & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
  export const AlertDialogContent: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLDivElement>>;
  export const AlertDialogHeader: React.FC<HTMLDivProps>;
  export const AlertDialogFooter: React.FC<HTMLDivProps>;
  export const AlertDialogTitle: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLHeadingElement>>;
  export const AlertDialogDescription: React.ForwardRefExoticComponent<HTMLDivProps & React.RefAttributes<HTMLParagraphElement>>;
  export const AlertDialogAction: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const AlertDialogCancel: React.ForwardRefExoticComponent<HTMLButtonProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/checkbox' {
  import * as React from 'react';
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export interface CheckboxProps extends Omit<HTMLButtonProps, 'onChange'> {
    checked?: boolean | 'indeterminate';
    onCheckedChange?: (checked: boolean | 'indeterminate') => void;
    disabled?: boolean;
  }
  export const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/radio-group' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
  export const RadioGroup: React.ForwardRefExoticComponent<HTMLDivProps & { value?: string; onValueChange?: (value: string) => void; defaultValue?: string; disabled?: boolean } & React.RefAttributes<HTMLDivElement>>;
  export const RadioGroupItem: React.ForwardRefExoticComponent<HTMLButtonProps & { value: string } & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/progress' {
  import * as React from 'react';
  type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
  export interface ProgressProps extends HTMLDivProps {
    value?: number;
    max?: number;
  }
  export const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
}
