import { clsx, type ClassValue } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formalizeDate(input: Date) {
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

  // @ts-expect-error Type not available
  const formattedDate = date.toLocaleString("en-US", options);

  const parts = formattedDate.split(", ");

  const datePart = parts[0]?.split("/");

  return `${parts[1]}, ${datePart?.[1]}/${datePart?.[0]}/${datePart?.[2]}`;
}

export function generalizeDate(input: Date) {
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

export function trimString(input: string, length: number) {
  return input.length > length ? input.substring(0, length).trim() + "..." : input;
}

export const getPayload = (file: File, fields: { [key: string]: string }) => {
  const payload = new FormData();

  Object.entries(fields).forEach(([key, val]) => {
    payload.append(key, val);
  });

  payload.append("file", file);
  payload.append("Content-Type", "application-octet-stream");

  return payload;
};

export const getBucketUrl = (bucket: string) => {
  return `https://${bucket}.s3.ap-southeast-1.amazonaws.com`;
};

export const PERIODS = [
  { period: 1, label: "Day", standard: "days" },
  { period: 7, label: "Week", standard: "weeks" },
  { period: 28, label: "Month", standard: "months" },
  { period: 365, label: "Year", standard: "years" },
];
