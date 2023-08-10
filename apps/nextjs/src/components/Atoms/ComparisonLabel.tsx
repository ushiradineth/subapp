import { Equal, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  value: string | number;
};

export default function ComparisonLabel({ value }: Props) {
  return (
    <div
      className={`flex h-fit w-fit items-center justify-center gap-1 rounded-sm p-1 px-2 text-sm ${
        Number(value) === 0 ? "bg-gray-100 text-gray-500" : Number(value) > 0 ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"
      }`}>
      {Number(value) === 0 ? <Equal size={12} /> : Number(value) > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Number(value)}%
    </div>
  );
}
