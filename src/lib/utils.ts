import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data no formato longo (ex: "6 de janeiro de 2026")
 * Usa UTC timezone para evitar problemas com conversão de fuso horário
 */
export const formatDate = (date: string | number | Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC", // Evita conversão de timezone que causa dia anterior
  };
  return new Date(date).toLocaleDateString("pt-BR", options);
};

/**
 * Formata uma data no formato curto (ex: "06/01/2026")
 * Usa UTC timezone para evitar problemas com conversão de fuso horário
 */
export const formatDateShort = (date: string | number | Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC", // Evita conversão de timezone que causa dia anterior
  };
  return new Date(date).toLocaleDateString("pt-BR", options);
};
