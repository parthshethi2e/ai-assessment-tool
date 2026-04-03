"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #eee",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>AI Assess</h2>

        <div>
          <button
            onClick={() => router.push("/reports")}
            style={navBtn}
          >
            Reports
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          maxWidth: 900,
          margin: "auto",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          AI Readiness Assessment
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#555",
            marginBottom: 30,
          }}
        >
          Evaluate your organization's AI maturity and get
          data-driven insights, roadmap, and recommendations.
        </p>

        <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
          <button
            onClick={() => router.push("/survey")}
            style={primaryBtn}
          >
            Start Assessment →
          </button>

          <button
            onClick={() => router.push("/reports")}
            style={secondaryBtn}
          >
            View Reports
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          padding: "40px",
          maxWidth: 1000,
          margin: "auto",
        }}
      >
        <FeatureCard
          title="AI Maturity Score"
          desc="Get a clear score of your organization's AI readiness level."
        />

        <FeatureCard
          title="AI Insights"
          desc="Identify gaps, opportunities, and risks instantly."
        />

        <FeatureCard
          title="Roadmap"
          desc="Receive a structured AI transformation roadmap."
        />

        <FeatureCard
          title="Tool Recommendations"
          desc="Discover the best tools tailored to your needs."
        />
      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          padding: 20,
          color: "#777",
          fontSize: 14,
        }}
      >
        © 2026 AI Assess • Built with AI 🚀
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #eee",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <p style={{ color: "#555", fontSize: 14 }}>{desc}</p>
    </div>
  );
}

const primaryBtn = {
  padding: "14px 24px",
  background: "#6366f1",
  color: "white",
  borderRadius: 8,
  border: "none",
  fontSize: 16,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "14px 24px",
  background: "white",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};

const navBtn = {
  padding: "8px 14px",
  background: "#111827",
  color: "white",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};