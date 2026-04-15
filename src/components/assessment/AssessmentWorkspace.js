"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, CircleDashed, Home } from "lucide-react";
import {
  annualBudgetBands,
  priorityOptions,
  respondentRoles,
  scoreLabels,
  sectorOptions,
  sizeBands,
  timelineOptions,
} from "@/data/assessmentFramework";
import { calculateAssessment, getResponseRecord, isResolvedResponse, normalizeAnalysis } from "@/lib/assessment";
import { analyzeSurveyWithAI } from "@/services/analysisService";
import BrandBadge from "@/components/BrandBadge";
import CustomRadar from "@/components/RadarChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "ai-assessment-professional-draft";
const nonScoreOptions = [
  {
    value: "skip",
    label: "Skip for now",
    description: "Come back to this later without affecting the score.",
  },
  {
    value: "na",
    label: "Preferred not to answer",
    description: "Mark this as not answered and exclude it from scoring.",
  },
];

function getQuestionScoreLabels(question) {
  return [1, 2, 3, 4, 5].map((value) => question.scoreLabels?.[value] || question.scoreLabels?.[String(value)] || scoreLabels[value - 1]);
}

function getClickedAnchor(event) {
  const target = event.target;

  if (target?.closest) {
    return target.closest("a[href]");
  }

  const path = event.composedPath?.() || [];
  return path.find((item) => item?.tagName === "A" && item?.href) || null;
}

const defaultDraft = {
  profile: {
    organizationName: "",
    organizationType: "for-profit",
    sector: "",
    sizeBand: "",
    annualBudgetBand: "",
    geography: "",
    respondentRole: "",
    currentTools: "",
    mission: "",
  },
  responses: {},
  notes: {
    priority: "",
    timeline: "3-6 months",
    challenges: "",
    knownRisks: "",
    successMeasures: "",
  },
};

export default function AssessmentWorkspace({ sections, restoreDraft = false, reportGenerationEnabled = true }) {
  const router = useRouter();
  const [draft, setDraft] = useState(defaultDraft);
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("idle");
  const [saveState, setSaveState] = useState("idle");
  const [savedReportId, setSavedReportId] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [sectionError, setSectionError] = useState("");
  const [questionErrors, setQuestionErrors] = useState({});
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [leavePrompt, setLeavePrompt] = useState(null);

  useEffect(() => {
    if (!restoreDraft) {
      window.localStorage.removeItem(STORAGE_KEY);
      setDraft(defaultDraft);
      setAnalysis(null);
      setSavedReportId("");
      setCurrentStep(0);
      setStatus("idle");
      setSaveState("idle");
      setProfileErrors({});
      setSectionError("");
      setQuestionErrors({});
      setHasAutoSubmitted(false);
      setHydrated(true);
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDraft({
          ...defaultDraft,
          ...parsed,
          profile: {
            ...defaultDraft.profile,
            ...parsed.profile,
            organizationType: "for-profit",
            sector: sectorOptions.includes(parsed.profile?.sector) ? parsed.profile.sector : "",
          },
          notes: { ...defaultDraft.notes, ...parsed.notes },
          responses: normalizeDraftResponses(parsed.responses),
        });
      } catch (error) {
        console.error("Failed to restore draft", error);
      }
    }

    setHydrated(true);
  }, [restoreDraft]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const assessment = useMemo(() => calculateAssessment(draft, sections), [draft, sections]);
  const summaryStep = sections.length + 1;
  const reportStep = sections.length + 2;
  const activeSection = currentStep > 0 && currentStep < summaryStep ? sections[currentStep - 1] : null;
  const progress = Math.round((Math.min(currentStep, reportStep) / reportStep) * 100);
  const reportIsSaved = currentStep === reportStep && saveState === "saved" && Boolean(savedReportId);
  const reportIsGenerating = currentStep === reportStep && !reportIsSaved;

  const chartData = assessment.scoredSections.map((section) => ({
    subject: section.title,
    value: section.score,
  }));

  useEffect(() => {
    if (currentStep !== reportStep || savedReportId || hasAutoSubmitted || saveState === "saving" || status === "loading") {
      return;
    }

    const submitAssessment = async () => {
      setHasAutoSubmitted(true);
      setStatus("loading");
      setSaveState("saving");

      let finalAnalysis = null;

      if (reportGenerationEnabled) {
        try {
          const ai = await analyzeSurveyWithAI({
            profile: draft.profile,
            notes: draft.notes,
            assessment,
          });

          finalAnalysis = normalizeAnalysis(ai, draft, assessment);
        } catch (error) {
          console.error(error);
          finalAnalysis = normalizeAnalysis(null, draft, assessment);
        }
      }

      setAnalysis(finalAnalysis);

      try {
        const payload = {
          finalScore: assessment.finalScore,
          maturity: assessment.stage,
          categoryScores: Object.fromEntries(assessment.scoredSections.map((item) => [item.id, item.score])),
          draft,
          assessment,
          ai: finalAnalysis,
          reportGenerationEnabled,
        };

        const response = await fetch("/api/save-result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Save failed");
        }

        setSavedReportId(json.id);
        setSaveState("saved");
        setStatus("ready");
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error(error);
        setSaveState("error");
        setStatus("error");
      }
    };

    submitAssessment();
  }, [assessment, currentStep, draft, hasAutoSubmitted, reportGenerationEnabled, reportStep, saveState, savedReportId, status]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = getClickedAnchor(event);

      if (!anchor) {
        return;
      }

      const targetUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (targetUrl.origin !== currentUrl.origin || targetUrl.pathname.startsWith("/survey")) {
        return;
      }

      if (reportIsSaved) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      setLeavePrompt({
        href: `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
        type: reportIsGenerating ? "generating" : "progress",
      });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [reportIsGenerating, reportIsSaved]);

  const updateProfile = (field, value) => {
    setProfileErrors((current) => ({ ...current, [field]: "" }));
    setDraft((current) => ({
      ...current,
          profile: {
            ...current.profile,
            organizationType: "for-profit",
            [field]: value,
          },
    }));
  };

  const updateNotes = (field, value) => {
    setProfileErrors((current) => ({ ...current, [field]: "" }));
    setDraft((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [field]: value,
      },
    }));
  };

  const updateResponse = (questionId, next) => {
    setSectionError("");
    setQuestionErrors((current) => ({ ...current, [questionId]: "" }));
    setDraft((current) => ({
      ...current,
      responses: {
        ...current.responses,
        [questionId]: {
          ...getResponseRecord(current.responses[questionId]),
          ...next,
        },
      },
    }));
  };

  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDraft(defaultDraft);
    setAnalysis(null);
    setSavedReportId("");
    setCurrentStep(0);
    setStatus("idle");
    setSaveState("idle");
    setProfileErrors({});
    setSectionError("");
    setQuestionErrors({});
    setHasAutoSubmitted(false);
  };

  const confirmLeaveAssessment = () => {
    const href = leavePrompt?.href || "/";
    window.localStorage.removeItem(STORAGE_KEY);
    setLeavePrompt(null);
    router.push(href);
  };

  const requestLeaveAssessment = (href) => {
    if (reportIsSaved) {
      router.push(href);
      return;
    }

    setLeavePrompt({
      href,
      type: reportIsGenerating ? "generating" : "progress",
    });
  };

  const validateProfile = () => {
    const errors = {};

    if (!draft.profile.organizationName.trim()) {
      errors.organizationName = "Organization name is required.";
    } else if (draft.profile.organizationName.trim().length < 3) {
      errors.organizationName = "Organization name must be at least 3 characters.";
    }

    if (!draft.profile.sector) {
      errors.sector = "Sector is required.";
    }

    if (!draft.profile.sizeBand) {
      errors.sizeBand = "Organization size is required.";
    }

    if (!draft.profile.respondentRole) {
      errors.respondentRole = "Primary respondent role is required.";
    }

    if (!draft.notes.priority) {
      errors.priority = "Primary transformation priority is required.";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSection = () => {
    if (!activeSection) {
      return true;
    }

    const unanswered = activeSection.questions.filter((question) => !isResolvedResponse(draft.responses[question.id], question.requiresTarget));

    if (unanswered.length) {
      setQuestionErrors(
        Object.fromEntries(
          unanswered.map((question) => [
            question.id,
            question.requiresTarget
              ? "Select current and target maturity, or choose skip for now / preferred not to answer."
              : "Select current maturity, or choose skip for now / preferred not to answer.",
          ])
        )
      );
      setSectionError(`Please answer all questions in ${activeSection.title} before continuing.`);
      return false;
    }

    setQuestionErrors({});
    setSectionError("");
    return true;
  };

  const canContinueFromProfile = validateProfilePreview(draft);

  const canContinueFromSection = !activeSection
    ? true
    : activeSection.questions.every((question) => isResolvedResponse(draft.responses[question.id], question.requiresTarget));

  const handleNext = () => {
    if (currentStep === 0 && !validateProfile()) return;
    if (activeSection && !validateSection()) return;
    setCurrentStep((step) => Math.min(step + 1, reportStep));
  };

  const handleBack = () => {
    if (currentStep === reportStep) {
      setAnalysis(null);
      setStatus("idle");
      setSaveState("idle");
      setSavedReportId("");
      setHasAutoSubmitted(false);
    }

    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const saveDraftHint =
    saveState === "saved"
      ? "Report generated and saved."
      : saveState === "error"
        ? "We could not save the report."
        : currentStep === reportStep
          ? reportGenerationEnabled
            ? "AI report is being prepared automatically."
            : "Assessment report is being saved with scorecard-only mode."
          : "Draft autosaves locally.";

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-sm text-muted-foreground">Loading assessment workspace...</div>;
  }

  return (
    <div className="mx-auto max-w-[92rem] px-6 py-8 lg:px-8">
      <div className="mb-5 flex justify-end">
        <Button asChild variant="outline" className="rounded-full">
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              requestLeaveAssessment("/");
            }}
          >
            <Home className="size-4" />
            Exit assessment
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[285px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-0 bg-[linear-gradient(160deg,rgba(14,116,144,0.98),rgba(15,23,42,0.98))] text-white ring-0 shadow-2xl">
            <CardHeader>
              <BrandBadge dark subtitle="Assessment flow" />
              <CardTitle className="text-2xl font-semibold text-white">Assessment workspace</CardTitle>
              <CardDescription className="text-white/75">Designed by I2E Consulting for executive-ready AI readiness outputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/70">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/15">
                  <div className="h-2 rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                {["Profile", ...sections.map((section) => section.title), "Review", "Report"].map((label, index) => {
                  const complete = index < currentStep || (label === "Report" && reportIsSaved);
                  const active = index === currentStep;

                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${
                        active ? "bg-white/12 text-white" : "text-white/72"
                      }`}
                    >
                      {complete ? (
                        <CheckCircle2 className="size-4 text-cyan-300" />
                      ) : active ? (
                        <CircleDashed className="size-4 text-cyan-300" />
                      ) : (
                        <span className="flex size-4 items-center justify-center rounded-full border border-white/25 text-[10px]">
                          {index + 1}
                        </span>
                      )}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/78 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Snapshot</CardTitle>
              <CardDescription>High-level scorecard updates as we complete the assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Readiness score" value={`${assessment.finalScore}/5`} />
                <Metric label="Stage" value={assessment.stage} />
                <Metric label="Confidence" value={`${Math.round(assessment.confidence * 100)}%`} />
                <Metric label="Benchmark" value={assessment.benchmark} compact />
              </div>
              <p className="text-xs text-muted-foreground">{saveDraftHint}</p>
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0 space-y-6">
          {currentStep === 0 ? (
            <ProfileStep
              draft={draft}
              updateProfile={updateProfile}
              updateNotes={updateNotes}
              canContinue={canContinueFromProfile}
              errors={profileErrors}
              onNext={handleNext}
            />
          ) : activeSection ? (
            <SectionStep
              section={activeSection}
              draft={draft}
              updateResponse={updateResponse}
              onBack={handleBack}
              onNext={handleNext}
              canContinue={canContinueFromSection}
              sectionError={sectionError}
              questionErrors={questionErrors}
              currentStep={currentStep}
              totalSteps={summaryStep}
            />
          ) : currentStep === summaryStep ? (
            <SubmissionReviewStep
              draft={draft}
              assessment={assessment}
              onBack={handleBack}
              onNext={handleNext}
              onJumpToSection={(index) => setCurrentStep(index + 1)}
              reportGenerationEnabled={reportGenerationEnabled}
              updateNotes={updateNotes}
            />
          ) : (
            <ReviewStep
              draft={draft}
              assessment={assessment}
              analysis={analysis}
              status={status}
              saveState={saveState}
              savedReportId={savedReportId}
              chartData={chartData}
              reportGenerationEnabled={reportGenerationEnabled}
              onBack={handleBack}
              onReset={clearDraft}
            />
          )}
        </main>
      </div>
      <LeaveAssessmentDialog prompt={leavePrompt} onCancel={() => setLeavePrompt(null)} onConfirm={confirmLeaveAssessment} />
    </div>
  );
}

function LeaveAssessmentDialog({ prompt, onCancel, onConfirm }) {
  if (!prompt) return null;

  const isGenerating = prompt.type === "generating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_32px_120px_rgba(15,23,42,0.28)]">
        <div className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
          Assessment in progress
        </div>
        <h2 className="font-heading mt-5 text-2xl font-semibold tracking-tight text-slate-950">
          {isGenerating ? "Your report is still being generated." : "Do you want to leave this assessment?"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isGenerating
            ? "Please wait until report generation is completed. If you leave now, this assessment progress may be lost."
            : "Leaving now will close and clear the current assessment. Your progress will not be saved as a draft."}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="rounded-full" onClick={onCancel}>
            No, stay here
          </Button>
          <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={onConfirm}>
            Yes, leave assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

function validateProfilePreview(draft) {
  return Boolean(
      draft.profile.organizationName.trim() &&
      draft.profile.sector &&
      draft.profile.sizeBand &&
      draft.profile.respondentRole &&
      draft.notes.priority
  );
}

function normalizeDraftResponses(responses) {
  if (!responses || typeof responses !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(responses).map(([questionId, response]) => [questionId, getResponseRecord(response)])
  );
}

function ProfileStep({ draft, updateProfile, updateNotes, canContinue, errors, onNext }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Organization profile</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">Set the right context before we score anything.</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              This profile helps tailor recommendations, benchmarks, and roadmap language to the selected sector and operating context.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-900">
            Auto-save is ON in this browser.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Organization name" required>
            <Input
              aria-invalid={Boolean(errors.organizationName)}
              value={draft.profile.organizationName}
              onChange={(event) => updateProfile("organizationName", event.target.value)}
              placeholder="Example: I2E Consulting"
            />
            <FieldError message={errors.organizationName} />
          </Field>

          <Field label="Sector" required>
            <Select
              aria-invalid={Boolean(errors.sector)}
              value={draft.profile.sector}
              onChange={(event) => updateProfile("sector", event.target.value)}
              options={sectorOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Select sector"
            />
            <FieldError message={errors.sector} />
          </Field>

          <Field label="Organization size" required>
            <Select
              aria-invalid={Boolean(errors.sizeBand)}
              value={draft.profile.sizeBand}
              onChange={(event) => updateProfile("sizeBand", event.target.value)}
              options={sizeBands.map((item) => ({ value: item, label: item }))}
              placeholder="Select size band"
            />
            <FieldError message={errors.sizeBand} />
          </Field>

          <Field label="Annual budget / revenue band">
            <Select
              aria-invalid={Boolean(errors.annualBudgetBand)}
              value={draft.profile.annualBudgetBand}
              onChange={(event) => updateProfile("annualBudgetBand", event.target.value)}
              options={annualBudgetBands.map((item) => ({ value: item, label: item }))}
              placeholder="Select budget band"
            />
            <FieldError message={errors.annualBudgetBand} />
          </Field>

          <Field label="Primary respondent role" required>
            <Select
              aria-invalid={Boolean(errors.respondentRole)}
              value={draft.profile.respondentRole}
              onChange={(event) => updateProfile("respondentRole", event.target.value)}
              options={respondentRoles.map((item) => ({ value: item, label: item }))}
              placeholder="Select role"
            />
            <FieldError message={errors.respondentRole} />
          </Field>

          <Field label="Operating geography">
            <Input
              aria-invalid={Boolean(errors.geography)}
              value={draft.profile.geography}
              onChange={(event) => updateProfile("geography", event.target.value)}
              placeholder="Example: India, Southeast Asia, or Global"
            />
            <FieldError message={errors.geography} />
          </Field>

          <Field label="Primary transformation priority" required>
            <Select
              aria-invalid={Boolean(errors.priority)}
              value={draft.notes.priority}
              onChange={(event) => updateNotes("priority", event.target.value)}
              options={priorityOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Choose the main priority"
            />
            <FieldError message={errors.priority} />
          </Field>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Mission or business context">
            <Textarea
              aria-invalid={Boolean(errors.mission)}
              value={draft.profile.mission}
              onChange={(event) => updateProfile("mission", event.target.value)}
              placeholder="Describe the mission, value proposition, or strategic context that AI should support."
            />
            <FieldError message={errors.mission} />
          </Field>

          <Field label="Which tools are you currently using?">
            <Textarea
              aria-invalid={Boolean(errors.currentTools)}
              value={draft.profile.currentTools}
              onChange={(event) => updateProfile("currentTools", event.target.value)}
              placeholder="Example: Microsoft 365, Google Workspace, Salesforce, Veeva, Power BI, Tableau, Snowflake, ChatGPT, internal tools..."
            />
            <FieldError message={errors.currentTools} />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Roadmap timeframe" required>
              <Select
                aria-invalid={Boolean(errors.timeline)}
                value={draft.notes.timeline}
                onChange={(event) => updateNotes("timeline", event.target.value)}
                options={timelineOptions.map((item) => ({ value: item, label: item }))}
              />
              <p className="text-xs leading-5 text-slate-500">How far ahead should the roadmap and recommendations look?</p>
              <FieldError message={errors.timeline} />
            </Field>

          <Field label="Known risks or sensitivities">
            <Input
              aria-invalid={Boolean(errors.knownRisks)}
              value={draft.notes.knownRisks}
              onChange={(event) => updateNotes("knownRisks", event.target.value)}
              placeholder="Privacy, donor trust, regulatory exposure, workforce concerns..."
            />
            <FieldError message={errors.knownRisks} />
          </Field>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Only the key context fields are required before the assessment begins.</p>
          <Button disabled={!canContinue} size="lg" className="h-11 rounded-full px-6" onClick={onNext}>
            Continue to assessment
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionStep({ section, draft, updateResponse, onBack, onNext, canContinue, sectionError, questionErrors, currentStep, totalSteps }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Section {currentStep} of {totalSteps - 1}
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">{section.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">{section.description}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            Select the current maturity for each statement. Questions that support future-state planning will also show a target maturity option.
          </div>
        </div>

        <div className="space-y-5">
          {section.questions.map((question) => {
            const response = getResponseRecord(draft.responses[question.id]);
            const questionScoreLabels = getQuestionScoreLabels(question);

            return (
              <Card
                key={question.id}
                className={`border bg-white shadow-sm ${questionErrors[question.id] ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200/80"}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-slate-950">{question.prompt}</CardTitle>
                  <CardDescription className="leading-6 text-slate-600">
                    {question.helperText ? `${question.helperText} ` : ""}
                    {question.why ? `Why this matters: ${question.why}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">Current maturity</div>
                    <div className="grid grid-cols-5 gap-3">
                    {questionScoreLabels.map((label, index) => {
                      const value = index + 1;
                      const active = response.mode === "score" && response.score === value;

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => updateResponse(question.id, { mode: "score", score: value, targetScore: response.targetScore })}
                          className={`rounded-2xl border px-3 py-4 text-left transition ${
                            active
                              ? "border-cyan-500 bg-cyan-50 text-cyan-950 shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/60"
                          }`}
                        >
                          <div className="text-lg font-semibold">{value}</div>
                          <div className="mt-1 text-xs leading-5">{label}</div>
                        </button>
                      );
                    })}
                    </div>
                  </div>

                  {response.mode === "score" && question.requiresTarget !== false ? (
                    <div>
                      <div className="mb-3 text-sm font-semibold text-slate-900">Target maturity</div>
                      <div className="grid grid-cols-5 gap-3">
                        {questionScoreLabels.map((label, index) => {
                          const value = index + 1;
                          const active = response.targetScore === value;

                          return (
                            <button
                              key={`target-${label}`}
                              type="button"
                              onClick={() => updateResponse(question.id, { targetScore: value })}
                              className={`rounded-2xl border px-3 py-4 text-left transition ${
                                active
                                  ? "border-slate-900 bg-slate-950 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                              }`}
                            >
                              <div className="text-lg font-semibold">{value}</div>
                              <div className="mt-1 text-xs leading-5">{label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-3 md:grid-cols-2">
                    {nonScoreOptions.map((option) => {
                      const active = response.mode === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateResponse(question.id, { mode: option.value, score: null, targetScore: null })}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-amber-400 bg-amber-50 text-amber-950 shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/60"
                          }`}
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500">{option.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  <Field label="Comment">
                    <Textarea
                      value={response.comment}
                      onChange={(event) => updateResponse(question.id, { comment: event.target.value })}
                      placeholder="Add context, examples, blockers, or any notes for this question."
                    />
                  </Field>

                  <FieldError message={questionErrors[question.id]} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sectionError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{sectionError}</div>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={onBack}>
            Back
          </Button>
          <Button disabled={!canContinue} size="lg" className="h-11 rounded-full px-6" onClick={onNext}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function SubmissionReviewStep({ draft, assessment, onBack, onNext, onJumpToSection, reportGenerationEnabled, updateNotes }) {
  const firstIncompleteSection = assessment.scoredSections.find((section) => section.answered + section.skipped + section.notAnswered < section.totalQuestions);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Submission review</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">Review completion before generating the report.</h1>
            <p className="text-base leading-7 text-slate-600">
              Check attempted, skipped, and unanswered responses across each pillar. You can revisit any section before creating the final report.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            {reportGenerationEnabled ? "The report will be generated after this review step." : "The scorecard report will be saved after this review step."}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Attempted" value={assessment.answeredQuestions} />
          <Metric label="Skipped" value={assessment.skippedQuestions} />
          <Metric label="Not answered" value={assessment.notAnsweredQuestions} />
          <Metric label="Pending" value={assessment.pendingQuestions} compact />
        </div>

        <div className="mt-8 grid gap-4">
          {assessment.scoredSections.map((section, index) => {
            const completed = section.answered + section.skipped + section.notAnswered;
            const pending = Math.max(section.totalQuestions - completed, 0);

            return (
              <Card key={section.id} className="border border-slate-200/80 bg-white shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-slate-950">{section.title}</div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>Attempted: {section.answered}</span>
                      <span>Skipped: {section.skipped}</span>
                      <span>Not answered: {section.notAnswered}</span>
                      <span>Pending: {pending}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => onJumpToSection(index)}>
                    Review section
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 border border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Additional context for the report</CardTitle>
            <CardDescription>These inputs are optional and can be added now instead of during the initial profile step.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Biggest current challenges">
              <Textarea
                value={draft.notes.challenges}
                onChange={(event) => updateNotes("challenges", event.target.value)}
                placeholder="List the operational, customer, stakeholder, or program delivery problems you most want to improve."
              />
            </Field>
            <Field label="How would success be measured?">
              <Textarea
                value={draft.notes.successMeasures}
                onChange={(event) => updateNotes("successMeasures", event.target.value)}
                placeholder="Examples: hours saved, response time, beneficiary reach, donor reporting quality, margin, or retention."
              />
            </Field>
          </CardContent>
        </Card>

        {firstIncompleteSection ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            There are still unanswered questions in {firstIncompleteSection.title}. You can still generate the report, but reviewing incomplete sections first will improve the output.
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={onBack}>
            Back
          </Button>
          <div className="flex flex-wrap gap-3">
            {firstIncompleteSection ? (
              <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={() => onJumpToSection(assessment.scoredSections.indexOf(firstIncompleteSection))}>
                Review incomplete section
              </Button>
            ) : null}
            <Button size="lg" className="h-11 rounded-full px-6" onClick={onNext}>
              {reportGenerationEnabled ? "Generate report" : "Save report"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewStep({
  draft,
  assessment,
  analysis,
  status,
  saveState,
  savedReportId,
  chartData,
  reportGenerationEnabled,
  onBack,
  onReset,
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Executive report</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">
              {draft.profile.organizationName || "Organization"} is at the {assessment.stage} stage.
            </h1>
            <p className="text-base leading-7 text-slate-600">
              This report combines the assessment scorecard with tailored recommendations for the selected sector and target maturity gaps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={onBack}>
              Back
            </Button>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {saveState === "saving"
                ? reportGenerationEnabled
                  ? "Generating AI report and saving..."
                  : "Saving weighted assessment report..."
                : saveState === "saved"
                  ? reportGenerationEnabled
                    ? "AI report saved automatically"
                    : "Scorecard report saved automatically"
                  : saveState === "error"
                    ? "Automatic save failed"
                    : "Preparing report..."}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Overall score" value={`${assessment.finalScore}/5`} />
          <Metric label="Target score" value={assessment.targetScore ? `${assessment.targetScore}/5` : "n/a"} />
          <Metric label="Stage" value={assessment.stage} />
          <Metric label="Confidence" value={`${Math.round(assessment.confidence * 100)}%`} />
        </div>

        {savedReportId ? (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            Report generated and saved. It is now available in the admin reports area for consultant review and delivery.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-6">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Section scores</CardTitle>
                <CardDescription>Weighted across strategy, data, technology, adoption, people, governance, operations, and impact.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.scoredSections.map((section) => (
                  <div key={section.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{section.title}</span>
                      <span className="text-slate-500">
                        Current {section.score}/5 {section.targetScore ? `• Target ${section.targetScore}/5` : ""}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#0ea5e9,#0f172a)]" style={{ width: `${(section.score / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Priority actions</CardTitle>
                <CardDescription>Highest-leverage changes based on the lowest-scoring capabilities.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {assessment.recommendations.map((item) => (
                  <div key={item.sectionId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Priority {item.rank}</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recommended starter use cases</CardTitle>
                <CardDescription>Matched to the selected sector and operating context from the profile.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {assessment.recommendedUseCases.map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Capability map</CardTitle>
                <CardDescription>A quick visual of where readiness is strong and where it lags.</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <CustomRadar data={chartData} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Assessment context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <ContextRow label="Organization">{draft.profile.organizationName || "Not provided"}</ContextRow>
                <ContextRow label="Sector">{draft.profile.sector || "Not provided"}</ContextRow>
                <ContextRow label="Size">{draft.profile.sizeBand || "Not provided"}</ContextRow>
                <ContextRow label="Current tools">{draft.profile.currentTools || "Not provided"}</ContextRow>
                <ContextRow label="Priority">{draft.notes.priority || "Not provided"}</ContextRow>
                <ContextRow label="Roadmap timeframe">{draft.notes.timeline || "Not provided"}</ContextRow>
              </CardContent>
            </Card>
          </div>
        </div>

        {analysis ? (
          <div className="mt-8 space-y-6">
            <Card className="border-0 bg-[linear-gradient(180deg,rgba(15,23,42,1),rgba(30,41,59,1))] text-white shadow-2xl ring-0">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{analysis.summary.headline}</CardTitle>
                <CardDescription className="text-white/70">
                  AI-generated executive summary shaped by the score profile and organization context.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <InsightCard title="Current state" content={analysis.summary.current_state} />
                <InsightCard title="Key risk" content={analysis.summary.key_risk} />
                <InsightCard title="Recommended focus" content={analysis.summary.recommended_focus} />
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <InfoListCard title="Top readiness gaps" items={analysis.gaps} tone="rose" titleKey="area" bodyKey="description" />
              <InfoListCard title="Recommended opportunities" items={analysis.opportunities} tone="emerald" titleKey="opportunity" bodyKey="description" />
            </div>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Transformation roadmap</CardTitle>
                <CardDescription>Structured into near-term delivery, mid-term scaling, and long-term operating model improvements.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <RoadmapColumn title="0-3 months" items={analysis.roadmap.short_term} />
                <RoadmapColumn title="3-6 months" items={analysis.roadmap.mid_term} />
                <RoadmapColumn title="6-12 months" items={analysis.roadmap.long_term} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <Card className="border border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Recommended tooling stack</CardTitle>
                  <CardDescription>Example tool categories to guide evaluation, not a strict vendor mandate.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-3">
                  <ToolColumn title="Data" items={analysis.tools.data} />
                  <ToolColumn title="AI" items={analysis.tools.ai} />
                  <ToolColumn title="Cloud" items={analysis.tools.cloud} />
                </CardContent>
              </Card>

              <Card className="border border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Investment guidance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 font-medium text-cyan-950">
                    {analysis.budget.level}
                  </div>
                  <p className="leading-6">{analysis.budget.rationale}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center">
            <div className="text-lg font-semibold text-slate-950">
              {saveState === "error" ? "We hit a problem saving the report." : "We’re generating the tailored report now."}
            </div>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {saveState === "error"
                ? "Please go back to the previous step and try again. Once the save succeeds, the report will appear in saved reports automatically."
                : reportGenerationEnabled
                  ? "The AI layer is building the executive summary, roadmap language, risk framing, and tooling guidance, then storing everything in the database automatically."
                  : "AI report generation is currently disabled by the admin, so this assessment will be saved with the weighted scorecard and structured responses only."}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" className="rounded-full px-2 text-slate-500 hover:text-slate-900" onClick={onReset}>
            Reset draft
          </Button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children, required = false }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function Select({ options, placeholder = "Select an option", ...props }) {
  return (
    <select
      className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-sm text-rose-600">{message}</p>;
}

function Metric({ label, value, compact = false }) {
  return (
    <div className="min-h-28 min-w-0 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-3 text-pretty font-semibold leading-snug text-slate-950 ${compact ? "text-sm" : "text-base"}`}>{value}</div>
    </div>
  );
}

function ContextRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-slate-900">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function InsightCard({ title, content }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{title}</div>
      <p className="mt-3 text-sm leading-6 text-white/85">{content}</p>
    </div>
  );
}

function InfoListCard({ title, items, tone, titleKey, bodyKey }) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : "border-emerald-200 bg-emerald-50 text-emerald-950";

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, index) => (
          <div key={`${item[titleKey]}-${index}`} className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
            <div className="font-semibold">{item[titleKey]}</div>
            <p className="mt-2 text-sm leading-6 opacity-90">{item[bodyKey]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoadmapColumn({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolColumn({ title, items }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={`${title}-${item}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
