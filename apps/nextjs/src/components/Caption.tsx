export default function Caption({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mt-4 text-sm">{children}</p>;
}
