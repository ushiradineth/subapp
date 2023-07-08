import { useRouter } from "next/router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { theme } from "~/utils/consts";
import { getPercentage } from "~/lib/utils";
import ComparisonLabel from "../Atoms/ComparisonLabel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./Card";

type Props = {
  title: string;
  dataKey: string;
  currentWeek: number;
  previousWeek: number;
  height?: number;
  width?: number;
  href?: string;
};

export default function ChartCard({ title, dataKey, currentWeek, previousWeek, height = 100, width = 200, href }: Props) {
  const router = useRouter();

  return (
    <Card onClick={() => (href ? router.push(href) : null)}>
      <CardHeader>
        <CardTitle className="flex w-full justify-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-x-4">
        <ResponsiveContainer width={width} height={height}>
          <LineChart
            id={title}
            title={title}
            width={width}
            height={height}
            data={[
              { name: "Previous week", [dataKey]: previousWeek },
              { name: "Current week", [dataKey]: currentWeek },
            ]}>
            <XAxis hide dataKey="name" />
            <Tooltip labelStyle={{ color: theme.colors.accent }} itemStyle={{ color: "black" }} />
            <Line type="monotone" dataKey={dataKey} stroke={theme.colors.accent} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-2">
        <>
          <ComparisonLabel value={getPercentage(currentWeek, previousWeek)} />
          <p className="text-muted-foreground flex items-center justify-center text-sm">Compared to last week</p>
        </>
      </CardFooter>
    </Card>
  );
}
