"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { stepsConfig } from "@/data/questions";
import QuestionStep from "@/components/QuestionStep";

export default function DynamicStepPage() {
  const { step } = useParams();
  const isLastStep = step === "governance";
  const router = useRouter();

  const stepIndex = stepsConfig.findIndex(s => s.slug === step);
  const currentStep = stepsConfig[stepIndex];

  // const [answers, setAnswers] = useState({});
  const [answers, setAnswers] = useState(() => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("assessment")) || {};
  }
  return {};
});

  if (!currentStep) return <p>Invalid step</p>;

  const handleNext = () => {
    const existing =
      JSON.parse(localStorage.getItem("assessment")) || {};

    const updated = {
      ...existing,
      ...answers,
    };

    localStorage.setItem("assessment", JSON.stringify(updated));

    const nextStep = stepsConfig[stepIndex + 1];

    if (nextStep) {
      router.push(`/survey/${nextStep.slug}`);
    } else {
      router.push("/survey/result");
    }
};

  const handlePrev = () => {
    if (stepIndex === 0) return router.back();

    const prevStep = stepsConfig[stepIndex - 1];
    router.push(`/survey/${prevStep.slug}`);
  };

return (
  <>
    <QuestionStep
      title={currentStep.title}
      stepIndex={stepIndex + 1}
      totalSteps={stepsConfig.length}
      questions={currentStep.questions}
      answers={answers}
      setAnswers={setAnswers}
      onNext={handleNext}
      onPrev={handlePrev}
      isLastStep={isLastStep}
    />

    {isLastStep && (
      <div style={{ marginTop: 20 }}>
        <h3>Additional Information</h3>

        <textarea
          placeholder="What are your biggest business challenges?"
          style={{ width: "100%", height: 100, marginBottom: 10 }}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              qualitative: e.target.value,
            }))
          }
        />

        <select
          style={{ width: "100%", marginBottom: 10 }}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              priority: e.target.value,
            }))
          }
        >
          <option value="">Select AI Priority</option>
          <option>Cost Reduction</option>
          <option>Revenue Growth</option>
          <option>Automation</option>
        </select>

        <select
          style={{ width: "100%" }}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              timeline: e.target.value,
            }))
          }
        >
          <option value="">Select Timeline</option>
          <option>0-3 months</option>
          <option>3-6 months</option>
          <option>6-12 months</option>
        </select>
      </div>
    )}
  </>
);
}