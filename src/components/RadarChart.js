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
  const formatLabel = (value) =>
    String(value || "")
      .replace("Strategy & Leadership V1", "Strategy")
      .replace("Strategy & Leadership", "Strategy")
      .replace("Data Readiness", "Data")
      .replace("Technology & Infrastructure", "Technology")
      .replace("AI Use Cases & Adoption", "AI Use Cases")
      .replace("Workforce & Change Capacity", "Workforce")
      .replace("Governance, Risk & Ethics", "Governance")
      .replace("Operations & Delivery", "Operations")
      .replace("Financial Capacity & Impact Measurement", "Financial Impact");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 28, right: 44, left: 44, bottom: 28 }}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tickFormatter={formatLabel}
          tick={{
            fontSize: 9,
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
