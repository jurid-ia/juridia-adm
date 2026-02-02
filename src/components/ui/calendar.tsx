"use client";

import { ptBR } from "date-fns/locale";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn("rdp-theme", className)}
      style={
        {
          "--rdp-accent-color": "var(--tw-color-primary-1, #0084FF)",
          "--rdp-background-color": "var(--tw-color-n-2, #ab8e63)",
          "--rdp-accent-color-dark": "var(--tw-color-primary-1, #0084FF)",
          "--rdp-background-color-dark": "var(--tw-color-n-6, #151718)",
        } as React.CSSProperties
      }
    >
      <DayPicker
        locale={ptBR}
        showOutsideDays={showOutsideDays}
        className="p-3"
        classNames={{
          root: "rdp-root",
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-n-7 dark:text-n-1",
          nav: "flex items-center gap-1",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            "inline-flex items-center justify-center rounded-md text-n-7 dark:text-n-1",
            "hover:bg-n-2 dark:hover:bg-n-6"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex justify-between",
          head_cell:
            "text-n-4 rounded-md w-9 font-normal text-[0.8rem] dark:text-n-3",
          row: "flex w-full mt-2 justify-between",
          cell: "relative p-0 text-center text-sm focus-within:relative",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            "inline-flex items-center justify-center rounded-md text-sm",
            "hover:bg-n-2/80 dark:hover:bg-n-6/80 hover:text-n-7 dark:hover:text-n-1",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 focus-visible:ring-offset-2"
          ),
          day_outside: "text-n-4 opacity-50",
          day_disabled: "text-n-4 opacity-50 cursor-not-allowed",
          day_selected: "bg-primary-1 text-white hover:bg-primary-1 hover:text-white",
          day_today: "font-semibold text-primary-1",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
