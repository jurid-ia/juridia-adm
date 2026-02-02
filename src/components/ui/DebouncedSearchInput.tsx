"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DebouncedSearchInputProps {
  placeholder?: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Input de busca com debounce interno. O estado do texto fica apenas neste componente,
 * então a digitação não causa re-render da página inteira — apenas o input re-renderiza.
 * O pai só é notificado após o delay (debounce), evitando travamento ao digitar.
 */
export function DebouncedSearchInput({
  placeholder = "Buscar...",
  onDebouncedChange,
  delay = 500,
  defaultValue = "",
  className = "",
  inputClassName = "",
}: DebouncedSearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      onDebouncedChange(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay, onDebouncedChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 rounded-lg border border-n-3 dark:border-n-6 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 ${inputClassName}`}
      />
    </div>
  );
}
