"use client";

import { useState } from "react";

const steps = [
  "Data",
  "Technology",
  "AI Usage",
  "Workforce",
  "Leadership",
  "Governance",
  "Summary",
];

export default function SurveyPage() {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    dataScore: 3,
    techScore: 3,
    aiUsageScore: 3,
    workforceScore: 3,
    leadershipScore: 3,
    governanceScore: 3,
    qualitative: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) || e.target.value });
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 30, maxWidth: 500, margin: "auto" }}>
      <h1>AI Maturity Survey</h1>

      <p>
        Step {step + 1} of {steps.length}: <b>{steps[step]}</b>
      </p>

      {/* STEP CONTENT */}
      {step === 0 && (
        <input type="range" name="dataScore" min="1" max="5" value={form.dataScore} onChange={handleChange} />
      )}

      {step === 1 && (
        <input type="range" name="techScore" min="1" max="5" value={form.techScore} onChange={handleChange} />
      )}

      {step === 2 && (
        <input type="range" name="aiUsageScore" min="1" max="5" value={form.aiUsageScore} onChange={handleChange} />
      )}

      {step === 3 && (
        <input type="range" name="workforceScore" min="1" max="5" value={form.workforceScore} onChange={handleChange} />
      )}

      {step === 4 && (
        <input type="range" name="leadershipScore" min="1" max="5" value={form.leadershipScore} onChange={handleChange} />
      )}

      {step === 5 && (
        <input type="range" name="governanceScore" min="1" max="5" value={form.governanceScore} onChange={handleChange} />
      )}

      {step === 6 && (
        <textarea
          name="qualitative"
          placeholder="Describe your AI challenges..."
          value={form.qualitative}
          onChange={handleChange}
        />
      )}

      {/* NAVIGATION */}
      <div style={{ marginTop: 20 }}>
        {step > 0 && <button onClick={prev}>Back</button>}

        {step < steps.length - 1 ? (
          <button onClick={next} style={{ marginLeft: 10 }}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} style={{ marginLeft: 10 }}>
            Submit
          </button>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Result</h2>
          <p>Score: {result.score}</p>
          <p>Maturity: {result.maturity}</p>
        </div>
      )}
    </div>
  );
}