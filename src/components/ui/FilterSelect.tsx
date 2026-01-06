import * as React from "react";

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ label, options, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-n-7 dark:text-n-3">
          {label}
        </label>
        <select
          ref={ref}
          className={`
            h-10 px-3 rounded-lg 
            border border-n-3 dark:border-n-6 
            bg-transparent
            text-n-7 dark:text-n-1
            focus:outline-none focus:ring-2 focus:ring-primary/50
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

FilterSelect.displayName = "FilterSelect";

export { FilterSelect };
