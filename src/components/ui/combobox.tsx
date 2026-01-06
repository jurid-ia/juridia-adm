
"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" 
// We might use a custom trigger or existing Button. Using a div/button raw for now or existing Button if compatible.
import { Button } from "@/components/ui/button"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "cmdk"

import * as PopoverPrimitive from "@radix-ui/react-popover"

// Basic Popover wrapper since we don't have one
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-n-1 p-4 text-n-7 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-n-6 dark:bg-n-6 dark:text-n-3",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

interface Option {
  value: string
  label: string
}

interface ComboboxProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
  className,
  disabled = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Find label for selected value
  const selectedLabel = React.useMemo(() => {
    return options.find((opt) => opt.value === value)?.label
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="stroke-light"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal text-left", !value && "text-n-4", className)}
          disabled={disabled}
          type="button"
        >
          <span className="truncate block">
              {value ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-n-1  border border-n-3 dark:border-n-6 shadow-lg">
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-md">
           <div className="flex items-center border-b border-n-3 px-3 dark:border-n-6">
            <CommandInput 
                placeholder={searchPlaceholder} 
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-n-4 disabled:cursor-not-allowed disabled:opacity-50 dark:text-n-1"
            />
           </div>
          <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-n-3 dark:scrollbar-thumb-n-6">
            <CommandEmpty className="py-6 text-center text-sm text-n-4">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search by label usually
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-n-2 data-[selected=true]:text-n-7 data-[disabled=true]:opacity-50 dark:data-[selected=true]:bg-n-7 dark:data-[selected=true]:text-n-1 hover:bg-n-2 dark:hover:bg-n-7 transition-colors cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
