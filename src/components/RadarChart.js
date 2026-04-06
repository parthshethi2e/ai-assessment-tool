"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function CustomRadar({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fontSize: 11,
            fill: "#334155",
          }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tick={{
            fontSize: 10,
            fill: "#64748b",
          }}
        />
        <Radar dataKey="value" stroke="#0891b2" fill="#0891b2" fillOpacity={0.24} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
