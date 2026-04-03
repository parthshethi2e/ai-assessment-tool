"use client";

import { useEffect, useState } from "react";
import { calculateScore, getMaturityLevel } from "@/lib/scoring";
import { stepsConfig } from "@/data/questions";
import { analyzeSurveyWithAI } from "@/services/analysisService";
import { generateRecommendations } from "@/services/recommendationService";
import CustomRadar from "@/components/RadarChart";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const answers =
      JSON.parse(localStorage.getItem("assessment")) || {};

    const { finalScore, categoryScores } =
      calculateScore(answers, stepsConfig);

    const maturity = getMaturityLevel(finalScore);

    const recommendations =
      generateRecommendations(categoryScores);

    analyzeSurveyWithAI({
      finalScore,
      maturity,
      categoryScores,
      qualitative: answers.qualitative,
      priority: answers.priority,
      timeline: answers.timeline,
    }).then((ai) => {
      setResult({
        finalScore,
        maturity,
        categoryScores,
        ai,
        recommendations,
      });
    });
  }, []);

  if (!result) return <p>Analyzing...</p>;

  console.log("AI RESULT:", result.ai);
    const chartData = Object.entries(result.categoryScores).map(
    ([key, value]) => ({
      subject: key,
      value,
    })
  );
  // ✅ SAFE RENDER HELPER
  const renderItem = (item) => {
    if (!item) return "";

    if (typeof item === "string") return item;

    if (typeof item === "object") {
      return (
        <>
          {item.area && <strong>{item.area}: </strong>}
          {item.title && <strong>{item.title}: </strong>}
          {item.description || JSON.stringify(item)}
        </>
      );
    }

    return String(item);
  };

  const handleSave = async () => {
  try {
    const answers =
      JSON.parse(localStorage.getItem("assessment")) || {};

    const res = await fetch("/api/save-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        finalScore: result.finalScore,
        maturity: result.maturity,
        categoryScores: result.categoryScores,
        answers,
        ai: result.ai,
      }),
    });

      const data = await res.json();

      if (data.success) {
        alert("Saved successfully ✅");
      } else {
        alert("Save failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  return (
  <div style={{ padding: 40, fontFamily: "sans-serif" }}>
    {/* HEADER */}
    <h1 style={{ fontSize: 28, marginBottom: 10 }}>
      AI Maturity Dashboard
    </h1>

    {/* SCORE CARD */}
    <div
      style={{
        padding: 20,
        borderRadius: 10,
        background: "#f4f6ff",
        marginBottom: 30,
      }}
    >
      <h2>Score: {result.finalScore.toFixed(2)}</h2>
      <h3>Maturity: {result.maturity}</h3>
    </div>

    {/* CHART */}
    <h3>Capability Overview</h3>
    <CustomRadar data={chartData} />

    {/* AI INSIGHTS */}
    <h3 style={{ marginTop: 30 }}>AI Insights</h3>

    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <h4>Gaps</h4>
        {result.ai.gaps.map((g, i) => (
  <div
    key={i}
    style={{
      background: "#ffe4e6",
      padding: 12,
      marginBottom: 10,
      borderRadius: 8,
    }}
  >
    {typeof g === "string" ? (
      <p>{g}</p>
    ) : (
      <>
        <strong>{g.area}</strong>
        <p>{g.description}</p>
      </>
    )}
  </div>
))}
      </div>

      <div style={{ flex: 1 }}>
        <h4>Opportunities</h4>
          {result.ai.opportunities.map((o, i) => (
          <div
            key={i}
            style={{
              background: "#dcfce7",
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            {typeof o === "string" ? (
              <p>{o}</p>
            ) : (
              <>
                <strong>{o.opportunity}</strong>
                <p>{o.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* SUMMARY */}
   <h3 style={{ marginTop: 30 }}>Executive Summary</h3>

<div
  style={{
    background: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    lineHeight: 1.6,
  }}
>
    <p>
      <strong>Current State:</strong>{" "}
      {result.ai.summary?.current_state}
    </p>

    <p style={{ marginTop: 10 }}>
      <strong>Key Risk:</strong>{" "}
      {result.ai.summary?.key_risk}
    </p>

    <p style={{ marginTop: 10 }}>
      <strong>Recommended Focus:</strong>{" "}
      {result.ai.summary?.recommended_focus}
    </p>
  </div>

    {/* ROADMAP */}
    <h3 style={{ marginTop: 40 }}>AI Transformation Roadmap</h3>

<div style={{ display: "flex", gap: 20, marginTop: 20 }}>
  {[
    { title: "Short Term", data: result.ai.roadmap.short_term },
    { title: "Mid Term", data: result.ai.roadmap.mid_term },
    { title: "Long Term", data: result.ai.roadmap.long_term },
  ].map((section, idx) => (
    <div
      key={idx}
      style={{
        flex: 1,
        background: "#f9fafb",
        padding: 20,
        borderRadius: 12,
        borderTop: "4px solid #6366f1",
      }}
    >
      <h4 style={{ marginBottom: 10 }}>{section.title}</h4>

      {section.data.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: 10,
            padding: 10,
            background: "white",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  ))}
</div>

<h3 style={{ marginTop: 40 }}>Recommended Tools</h3>

{[
  { title: "Data", data: result.ai.tools.data },
  { title: "AI", data: result.ai.tools.ai },
  { title: "Cloud", data: result.ai.tools.cloud },
].map((section, idx) => (
  <div key={idx} style={{ marginBottom: 20 }}>
    <h4 style={{ marginBottom: 10 }}>{section.title}</h4>

    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {section.data.map((tool, i) => (
        <div
          key={i}
          style={{
            padding: "8px 14px",
            background: "#eef2ff",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {tool}
        </div>
      ))}
    </div>
  </div>
))}
    
    <div style={{ marginTop: 40 }}>
  <button
    onClick={handleSave}
    style={{
      padding: "12px 20px",
      background: "#6366f1",
      color: "white",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      marginRight: 10,
    }}
  >
    Save Assessment
  </button>

  <button
    onClick={() => router.push("/dashboard")}
    style={{
      padding: "12px 20px",
      background: "#16a34a",
      color: "white",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
    }}
  >
    View History
  </button>
</div>

  </div>
);
}