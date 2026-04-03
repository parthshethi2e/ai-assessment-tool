"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const router = useRouter();

  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      text: "How extensively is AI/ML being used in your core business processes?",
      sub: "Consider number of use cases and business impact",
    },
    {
      id: 2,
      text: "What is the sophistication level of AI/ML models your organization uses?",
      sub: "Rule-based → ML → Deep Learning → GenAI",
    },
    {
      id: 3,
      text: "How well do you track AI model performance?",
      sub: "Monitoring, KPIs, accuracy tracking",
    },
  ];

  // ---------- SELECT SCORE ----------
  const handleSelect = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  // ---------- NAVIGATION ----------
  const handleNext = () => {
     const formatted = {
      dataScore: answers[1] || 1,
      techScore: answers[2] || 1,
      aiUsageScore: answers[3] || 1,
      workforceScore: 3,
      leadershipScore: 3,
      governanceScore: 3,
      qualitative: "",
  };

    localStorage.setItem("assessment", JSON.stringify(formatted));
    router.push("/survey/result");
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;

  // ---------- STYLES ----------
  const container = {
    maxWidth: "900px",
    margin: "auto",
    padding: "40px 20px",
  };

  const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  };

  const circle = (active) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: active ? "2px solid #4f46e5" : "1px solid #ccc",
    background: active ? "#4f46e5" : "#fff",
    color: active ? "#fff" : "#333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: "600",
  });

  return (
    <div style={container}>
      {/* HEADER */}
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        AI/ML Usage
      </h1>

      <p style={{ color: "#666", marginBottom: 10 }}>
        Assess the depth and breadth of AI adoption
      </p>

      {/* PROGRESS */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Step 3 of 7</span>
          <span>{Math.round(progress)}% Answered</span>
        </div>

        <div
          style={{
            height: 8,
            background: "#eee",
            borderRadius: 10,
            marginTop: 5,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#4f46e5",
              borderRadius: 10,
              transition: "0.3s",
            }}
          />
        </div>
      </div>

      {/* QUESTIONS */}
      {questions.map((q) => (
        <div key={q.id} style={card}>
          <h3 style={{ fontWeight: 600 }}>
            {q.id}. {q.text}
          </h3>

          <p style={{ color: "#666", fontSize: 14 }}>
            {q.sub}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <span style={{ fontSize: 12 }}>Strongly Disagree</span>
            <span style={{ fontSize: 12 }}>Strongly Agree</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                style={circle(answers[q.id] === num)}
                onClick={() => handleSelect(q.id, num)}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* NAV BUTTONS */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => router.back()}>
          ← Previous
        </button>

        <button
          onClick={handleNext}
          style={{
            background: "#4f46e5",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}