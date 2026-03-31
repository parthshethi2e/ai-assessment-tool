"use client";

import { useState } from "react";

export default function SurveyPage() {
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div style={{ padding: 20 }}>
      <h1>AI Maturity Survey</h1>

      {[
        "dataScore",
        "techScore",
        "aiUsageScore",
        "workforceScore",
        "leadershipScore",
        "governanceScore",
      ].map((field) => (
        <div key={field}>
          <label>{field}</label>
          <input
            type="number"
            name={field}
            value={form[field]}
            onChange={handleChange}
            min="1"
            max="5"
          />
        </div>
      ))}

      <div>
        <label>Qualitative Input</label>
        <textarea
          name="qualitative"
          value={form.qualitative}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSubmit}>Submit</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Result</h2>
          <p>Score: {result.score}</p>
          <p>Maturity: {result.maturity}</p>
        </div>
      )}
    </div>
  );
}