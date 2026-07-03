"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Props = {
  title: string;
  data: {
    month: string;
    value: number;
  }[];
  yMax?: number;
  yMin?: number;
  referenceValue?: number;
  referenceLabel?: string;
};

export default function StoreTrendChart({
  title,
  data,
  yMin,
  yMax,
  referenceValue,
  referenceLabel,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[yMin ?? "auto", yMax ?? "auto"]} />
            <Tooltip />

            {referenceValue !== undefined && (
              <ReferenceLine
                y={referenceValue}
                stroke="red"
                strokeDasharray="4 4"
                label={referenceLabel}
              />
            )}

            <Line type="monotone" dataKey="value" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}