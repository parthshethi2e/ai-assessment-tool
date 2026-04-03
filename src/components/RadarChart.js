"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function CustomRadar({ data }) {
  return (
    <RadarChart width={400} height={300} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis domain={[0, 5]} />
      <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
    </RadarChart>
  );
}