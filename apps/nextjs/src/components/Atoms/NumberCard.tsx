import { Card } from "../Molecules/Card";

export default function NumberCard({ number, text }: { number: number; text: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 p-4">
      <h2 className="font-mono text-3xl">{number}</h2>
      <h3 className="text-1xl">{text}</h3>
    </Card>
  );
}
