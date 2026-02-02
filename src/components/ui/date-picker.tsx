"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Selecione a data",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    return new Date(value);
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date ?? null);
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="secondary"
          disabled={disabled}
          className={cn(
            "w-max justify-start text-left font-normal h-9 px-3",
            !value && "text-n-4",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 w-[272px] max-w-[calc(100vw-1rem)] p-0 rounded-xl border border-n-3 dark:border-n-6",
            "bg-n-1 dark:bg-n-8 text-n-7 dark:text-n-1 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={minDate ? { before: minDate } : undefined}
            defaultMonth={selectedDate ?? minDate ?? new Date()}
            initialFocus
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
