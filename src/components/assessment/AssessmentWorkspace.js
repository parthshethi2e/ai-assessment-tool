"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, CircleDashed, Save, Sparkles } from "lucide-react";
import {
  annualBudgetBands,
  assessmentSections,
  organizationTypes,
  priorityOptions,
  respondentRoles,
  scoreLabels,
  sectorOptions,
  sizeBands,
  timelineOptions,
} from "@/data/assessmentFramework";
import { calculateAssessment, normalizeAnalysis } from "@/lib/assessment";
import { analyzeSurveyWithAI } from "@/services/analysisService";
import CustomRadar from "@/components/RadarChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "ai-assessment-professional-draft";

const defaultDraft = {
  profile: {
    organizationName: "",
    organizationType: "for-profit",
    sector: "",
    sizeBand: "",
    annualBudgetBand: "",
    geography: "",
    respondentRole: "",
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

export default function AssessmentWorkspace() {
  const [draft, setDraft] = useState(defaultDraft);
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("idle");
  const [saveState, setSaveState] = useState("idle");
  const [savedReportId, setSavedReportId] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDraft({
          ...defaultDraft,
          ...parsed,
          profile: { ...defaultDraft.profile, ...parsed.profile },
          notes: { ...defaultDraft.notes, ...parsed.notes },
        });
      } catch (error) {
        console.error("Failed to restore draft", error);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const assessment = useMemo(() => calculateAssessment(draft), [draft]);
  const totalSteps = assessmentSections.length + 2;
  const reviewStep = totalSteps - 1;
  const activeSection = currentStep > 0 && currentStep < reviewStep ? assessmentSections[currentStep - 1] : null;
  const progress = Math.round((currentStep / reviewStep) * 100);

  const chartData = assessment.scoredSections.map((section) => ({
    subject: section.title,
    value: section.score,
  }));

  const updateProfile = (field, value) => {
    setDraft((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  };

  const updateNotes = (field, value) => {
    setDraft((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [field]: value,
      },
    }));
  };

  const updateResponse = (questionId, value) => {
    setDraft((current) => ({
      ...current,
      responses: {
        ...current.responses,
        [questionId]: value,
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
  };

  const canContinueFromProfile =
    draft.profile.organizationName &&
    draft.profile.organizationType &&
    draft.profile.sector &&
    draft.profile.sizeBand &&
    draft.profile.respondentRole;

  const canContinueFromSection = !activeSection
    ? true
    : activeSection.questions.every((question) => draft.responses[question.id]);

  const handleNext = () => {
    if (currentStep === 0 && !canContinueFromProfile) return;
    if (activeSection && !canContinueFromSection) return;
    setCurrentStep((step) => Math.min(step + 1, reviewStep));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const generateAnalysis = async () => {
    setStatus("loading");

    try {
      const ai = await analyzeSurveyWithAI({
        profile: draft.profile,
        notes: draft.notes,
        assessment,
      });

      setAnalysis(normalizeAnalysis(ai, draft, assessment));
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setAnalysis(normalizeAnalysis(null, draft, assessment));
      setStatus("ready");
    }
  };

  const saveReport = async () => {
    if (!analysis) {
      return;
    }

    setSaveState("saving");

    try {
      const payload = {
        finalScore: assessment.finalScore,
        maturity: assessment.stage,
        categoryScores: Object.fromEntries(assessment.scoredSections.map((item) => [item.id, item.score])),
        draft,
        assessment,
        ai: analysis,
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
    } catch (error) {
      console.error(error);
      setSaveState("error");
    }
  };

  const saveDraftHint = saveState === "saved" ? "Report saved." : saveState === "error" ? "Save failed." : "Draft autosaves locally.";

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-sm text-muted-foreground">Loading assessment workspace...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="border-0 bg-[linear-gradient(160deg,rgba(14,116,144,0.98),rgba(15,23,42,0.98))] text-white ring-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 text-sm text-white/75">
                <Building2 className="size-4" />
                Professional AI readiness
              </div>
              <CardTitle className="text-2xl font-semibold text-white">Assessment workspace</CardTitle>
              <CardDescription className="text-white/75">
                Designed for both for-profit and non-profit organizations with executive-ready outputs.
              </CardDescription>
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
                {["Profile", ...assessmentSections.map((section) => section.title), "Report"].map((label, index) => {
                  const complete = index < currentStep;
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

          <Card className="border-0 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle>Snapshot</CardTitle>
              <CardDescription>High-level scorecard updates as we complete the assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Readiness score" value={`${assessment.finalScore}/5`} />
                <Metric label="Stage" value={assessment.stage} />
                <Metric label="Confidence" value={`${Math.round(assessment.confidence * 100)}%`} />
                <Metric label="Benchmark" value={assessment.benchmark} />
              </div>
              <p className="text-xs text-muted-foreground">{saveDraftHint}</p>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          {currentStep === 0 ? (
            <ProfileStep
              draft={draft}
              updateProfile={updateProfile}
              updateNotes={updateNotes}
              canContinue={canContinueFromProfile}
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
              currentStep={currentStep}
              totalSteps={reviewStep}
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
              onBack={handleBack}
              onGenerate={() => {
                startTransition(() => {
                  generateAnalysis();
                });
              }}
              onSave={() => {
                startTransition(() => {
                  saveReport();
                });
              }}
              onReset={clearDraft}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileStep({ draft, updateProfile, updateNotes, canContinue, onNext }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Organization profile</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">Set the right context before we score anything.</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              This version is designed for both commercial and mission-driven organizations, so the profile helps tailor recommendations,
              benchmarks, and roadmap language.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-900">
            Save-and-resume is on by default in this browser.
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Organization name">
            <Input
              value={draft.profile.organizationName}
              onChange={(event) => updateProfile("organizationName", event.target.value)}
              placeholder="Example: Horizon Health Network"
            />
          </Field>

          <Field label="Organization type">
            <Select
              value={draft.profile.organizationType}
              onChange={(event) => updateProfile("organizationType", event.target.value)}
              options={organizationTypes.map((item) => ({ value: item.id, label: item.label }))}
            />
          </Field>

          <Field label="Sector">
            <Select
              value={draft.profile.sector}
              onChange={(event) => updateProfile("sector", event.target.value)}
              options={sectorOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Select sector"
            />
          </Field>

          <Field label="Organization size">
            <Select
              value={draft.profile.sizeBand}
              onChange={(event) => updateProfile("sizeBand", event.target.value)}
              options={sizeBands.map((item) => ({ value: item, label: item }))}
              placeholder="Select size band"
            />
          </Field>

          <Field label="Annual budget / revenue band">
            <Select
              value={draft.profile.annualBudgetBand}
              onChange={(event) => updateProfile("annualBudgetBand", event.target.value)}
              options={annualBudgetBands.map((item) => ({ value: item, label: item }))}
              placeholder="Select budget band"
            />
          </Field>

          <Field label="Primary respondent role">
            <Select
              value={draft.profile.respondentRole}
              onChange={(event) => updateProfile("respondentRole", event.target.value)}
              options={respondentRoles.map((item) => ({ value: item, label: item }))}
              placeholder="Select role"
            />
          </Field>

          <Field label="Operating geography">
            <Input
              value={draft.profile.geography}
              onChange={(event) => updateProfile("geography", event.target.value)}
              placeholder="Example: India, Southeast Asia, or Global"
            />
          </Field>

          <Field label="Primary transformation priority">
            <Select
              value={draft.notes.priority}
              onChange={(event) => updateNotes("priority", event.target.value)}
              options={priorityOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Choose the main priority"
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Mission or business context">
            <Textarea
              value={draft.profile.mission}
              onChange={(event) => updateProfile("mission", event.target.value)}
              placeholder="Describe the mission, value proposition, or strategic context that AI should support."
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Planning horizon">
              <Select
                value={draft.notes.timeline}
                onChange={(event) => updateNotes("timeline", event.target.value)}
                options={timelineOptions.map((item) => ({ value: item, label: item }))}
              />
            </Field>

            <Field label="Known risks or sensitivities">
              <Input
                value={draft.notes.knownRisks}
                onChange={(event) => updateNotes("knownRisks", event.target.value)}
                placeholder="Privacy, donor trust, regulatory exposure, workforce concerns..."
              />
            </Field>
          </div>

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
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Required fields: organization name, type, sector, size, and respondent role.</p>
          <Button disabled={!canContinue} size="lg" className="h-11 rounded-full px-6" onClick={onNext}>
            Start assessment
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionStep({ section, draft, updateResponse, onBack, onNext, canContinue, currentStep, totalSteps }) {
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
            Score each statement from 1 to 5 based on what is true today, not what is planned.
          </div>
        </div>

        <div className="space-y-5">
          {section.questions.map((question) => (
            <Card key={question.id} className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">{question.prompt}</CardTitle>
                <CardDescription className="leading-6 text-slate-600">
                  Why this matters: {question.why}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  {scoreLabels.map((label, index) => {
                    const value = index + 1;
                    const active = draft.responses[question.id] === value;

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateResponse(question.id, value)}
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
              </CardContent>
            </Card>
          ))}
        </div>

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

function ReviewStep({
  draft,
  assessment,
  analysis,
  status,
  saveState,
  savedReportId,
  chartData,
  onBack,
  onGenerate,
  onSave,
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
              This report combines the assessment scorecard with tailored recommendations for {draft.profile.organizationType} organizations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg" className="h-11 rounded-full px-6" onClick={onBack}>
              Back
            </Button>
            <Button size="lg" className="h-11 rounded-full px-6" onClick={onGenerate} disabled={status === "loading"}>
              <Sparkles className="size-4" />
              {status === "loading" ? "Generating analysis..." : analysis ? "Refresh AI analysis" : "Generate AI analysis"}
            </Button>
            <Button size="lg" variant="secondary" className="h-11 rounded-full px-6" onClick={onSave} disabled={!analysis || saveState === "saving"}>
              <Save className="size-4" />
              {saveState === "saving" ? "Saving..." : "Save report"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Overall score" value={`${assessment.finalScore}/5`} />
          <Metric label="Stage" value={assessment.stage} />
          <Metric label="Benchmark" value={assessment.benchmark} />
          <Metric label="Confidence" value={`${Math.round(assessment.confidence * 100)}%`} />
        </div>

        {savedReportId ? (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            Report saved. View it in <Link href="/reports" className="font-semibold underline">saved reports</Link> or open{" "}
            <Link href={`/reports/${savedReportId}`} className="font-semibold underline">this report</Link>.
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
                      <span className="text-slate-500">{section.score}/5</span>
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
                <CardDescription>Matched to the organization type and sector selected in the profile.</CardDescription>
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
                <ContextRow label="Type">{draft.profile.organizationType}</ContextRow>
                <ContextRow label="Sector">{draft.profile.sector || "Not provided"}</ContextRow>
                <ContextRow label="Size">{draft.profile.sizeBand || "Not provided"}</ContextRow>
                <ContextRow label="Priority">{draft.notes.priority || "Not provided"}</ContextRow>
                <ContextRow label="Timeline">{draft.notes.timeline || "Not provided"}</ContextRow>
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
              <InfoListCard title="Primary gaps" items={analysis.gaps} tone="rose" titleKey="area" bodyKey="description" />
              <InfoListCard title="Opportunities" items={analysis.opportunities} tone="emerald" titleKey="opportunity" bodyKey="description" />
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
            <div className="text-lg font-semibold text-slate-950">Generate the tailored report when you’re ready.</div>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              We already have the readiness score and local recommendations. The AI layer adds a more polished executive summary, roadmap language,
              risk framing, and tooling guidance.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" className="rounded-full px-2 text-slate-500 hover:text-slate-900" onClick={onReset}>
            Reset draft
          </Button>
          {savedReportId ? (
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link href={`/reports/${savedReportId}`}>Open saved report</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
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

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
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
