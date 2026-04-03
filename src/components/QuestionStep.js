"use client";

export default function QuestionStep({
  title,
  stepIndex,
  totalSteps,
  questions,
  answers,
  setAnswers,
  onNext,
  onPrev,
}) {
  const progress =
    (Object.keys(answers).length / questions.length) * 100;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 30 }}>
      <h1 style={{ fontSize: 28 }}>{title}</h1>

      <p>Step {stepIndex + 1} of {totalSteps}</p>

      {/* Progress */}
      <div style={{ height: 8, background: "#eee", marginBottom: 20 }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#4f46e5",
          }}
        />
      </div>

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 25 }}>
          <h3>{i + 1}. {q.text}</h3>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                onClick={() =>
                  setAnswers({ ...answers, [q.id]: num })
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: answers[q.id] === num
                    ? "2px solid #4f46e5"
                    : "1px solid #ccc",
                  background: answers[q.id] === num
                    ? "#4f46e5"
                    : "#fff",
                  color: answers[q.id] === num ? "#fff" : "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {onPrev && <button onClick={onPrev}>← Previous</button>}
        <button onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}