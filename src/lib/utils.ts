import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Arredonda valor monetário para 2 casas decimais
 */
export function arredondarValor(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Formata valor como moeda brasileira (ex: 8.275,04)
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
