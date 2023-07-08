import { Pie, PieChart as PieChartRecharts, Tooltip } from "recharts";

import { theme } from "~/utils/consts";
import { CardContent, CardDescription } from "./Card";

type Props = {
  id: string;
  title?: string;
  truthy: {
    title: string;
    value: number;
  };
  falsity: {
    title: string;
    value: number;
  };
  height?: number;
  width?: number;
};

export default function PieChart({ id, title, truthy, falsity, height = 230, width = 300 }: Props) {
  return (
    <>
      {title && <CardDescription className="flex w-full items-center justify-center">{title}</CardDescription>}
      <CardContent key={id}>
        <PieChartRecharts width={width} height={height}>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={[
              { name: truthy.title, value: truthy.value },
              {
                name: falsity.title,
                value: falsity.value,
              },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill={theme.colors.accent}
            label
          />
          <Tooltip />
        </PieChartRecharts>
      </CardContent>
    </>
  );
}
