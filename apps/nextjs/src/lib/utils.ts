import { clsx, type ClassValue } from "clsx";
import moment from "moment";
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

  // @ts-ignore
  const formattedDate = date.toLocaleString("en-US", options);

  const parts = formattedDate.split(", ");

  const datePart = parts[0]?.split("/");

  return `${parts[1]}, ${datePart?.[1]}/${datePart?.[0]}/${datePart?.[2]}`;
}

export function generalizeDate(input: any) {
  return moment(input).fromNow();
}

export function getPercentage(current: number, previous: number) {
  if (previous === 0) {
    current = current + 1;
    previous = previous + 1;
  }

  const percentage = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isNaN(percentage) ? 0 : !Number.isFinite(percentage) ? -9999 : percentage.toPrecision(4);
}
