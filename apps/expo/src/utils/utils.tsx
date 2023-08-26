import { type ImagePickerAsset } from "expo-image-picker";
import mime from "mime";
import moment from "moment";

export function formalizeDate(input: string | number | Date) {
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

  // @ts-expect-error Works as intended
  const formattedDate = date.toLocaleString("en-US", options);

  const parts = formattedDate.split(", ");

  const datePart = parts[0]?.split("/");

  return `${parts[1]}, ${datePart?.[1]}/${datePart?.[0]}/${datePart?.[2]}`;
}

export function generalizeDate(input: moment.MomentInput) {
  return moment(input).fromNow();
}

export function trimString(input: string, length: number) {
  return input.length > length ? input.substring(0, length).trim() + "..." : input;
}

export const PERIODS = [
  { period: 1, label: "Day", standard: "days" },
  { period: 7, label: "Week", standard: "weeks" },
  { period: 28, label: "Month", standard: "months" },
  { period: 365, label: "Year", standard: "years" },
];

export const getPayload = (file: ImagePickerAsset, fields: { [key: string]: string }, fileName: string) => {
  const payload = new FormData();

  Object.entries(fields).forEach(([key, val]) => {
    payload.append(key, val);
  });

  const newImageUri = "file:///" + file.uri.split("file:/").join("");

  // @ts-expect-error Works as intended
  payload.append("file", {
    uri: newImageUri,
    type: mime.getType(newImageUri),
    name: fileName,
  });

  return payload;
};
