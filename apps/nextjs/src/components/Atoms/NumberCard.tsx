import { Card } from "../Molecules/Card";

export default function NumberCard({ number, text }: { number: number; text: string }) {
  return (
    <Card className="flex items-center justify-center">
      <h3 className="text-2xl">
        {number} {text}
      </h3>
    </Card>
  );
}
