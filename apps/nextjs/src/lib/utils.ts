import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formalizeDate(input: any) {
  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const date = new Date(input);

  const formattedDate = date.toLocaleString("en-US", options);

  const parts = formattedDate.split(", ");

  const datePart = parts[0]?.split("/");

  return `${parts[1]}, ${datePart?.[1]}/${datePart?.[0]}/${datePart?.[2]}`;
}
