"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronDown, FilePlus2, FolderPlus, Pencil, Settings2, Trash2 } from "lucide-react";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultScoreLabels } from "@/data/assessmentFramework";

function parseAnswers(report) {
  return typeof report.answers === "string" ? JSON.parse(report.answers) : report.answers;
}

function normalizeScoreLabelDraft(labels) {
  return {
    1: labels?.[1] || labels?.["1"] || defaultScoreLabels[1],
    2: labels?.[2] || labels?.["2"] || defaultScoreLabels[2],
    3: labels?.[3] || labels?.["3"] || defaultScoreLabels[3],
    4: labels?.[4] || labels?.["4"] || defaultScoreLabels[4],
    5: labels?.[5] || labels?.["5"] || defaultScoreLabels[5],
  };
}

export default function AdminDashboard({ initialSections, overview, adminEmail, initialSettings }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [status, setStatus] = useState("");
  const [settings, setSettings] = useState(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    description: "",
    weight: 1,
  });
  const [draftQuestions, setDraftQuestions] = useState({});
  const [newSectionErrors, setNewSectionErrors] = useState({});

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    const refreshSession = async () => {
      await fetch("/api/admin/auth/refresh", {
        method: "POST",
      });
    };

    refreshSession();

    const intervalId = window.setInterval(refreshSession, 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const setMessage = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 3000);
  };

  const updateSettings = async (nextValue) => {
    setSavingSettings(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportGenerationEnabled: nextValue,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to update settings.");
      }

      setSettings(json.settings);
      setMessage(`AI report generation ${nextValue ? "enabled" : "disabled"}.`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const validateNewSection = () => {
    const errors = {};

    if (!newSection.title.trim()) {
      errors.title = "Section title is required.";
    }

    if (!newSection.description.trim()) {
      errors.description = "Section description is required.";
    }

    if (!newSection.weight || Number(newSection.weight) <= 0) {
      errors.weight = "Weight must be greater than 0.";
    }

    setNewSectionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createSection = async () => {
    if (!validateNewSection()) return;
    const response = await fetch("/api/admin/assessment/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSection),
    });

    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error || "Failed to create section.");
      return;
    }

    setSections((current) => [...current, { ...json.section, questions: [] }]);
    setNewSection({ title: "", description: "", weight: 1 });
    setNewSectionErrors({});
    setMessage("Section created.");
    router.refresh();
  };

  const updateSection = async (sectionId, patch) => {
    const existing = sections.find((section) => section.id === sectionId || section.dbId === sectionId);
    const targetId = existing?.dbId || sectionId;

    const response = await fetch(`/api/admin/assessment/sections/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error || "Failed to update section.");
      return;
    }

    setSections((current) =>
      current.map((section) =>
        (section.dbId || section.id) === targetId
          ? {
              ...section,
              ...json.section,
              id: section.id,
              dbId: json.section.id,
            }
          : section
      )
    );
    setMessage("Section updated.");
    router.refresh();
  };

  const deleteSection = async (sectionId) => {
    const response = await fetch(`/api/admin/assessment/sections/${sectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Failed to delete section.");
      return;
    }

    setSections((current) => current.filter((section) => (section.dbId || section.id) !== sectionId));
    setMessage("Section deleted.");
    router.refresh();
  };

  const createQuestion = async (sectionId) => {
    const payload = draftQuestions[sectionId];

    if (!payload?.prompt?.trim()) {
      setMessage("Question prompt is required.");
      return;
    }

    const response = await fetch("/api/admin/assessment/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionId,
        ...payload,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error || "Failed to create question.");
      return;
    }

    setSections((current) =>
      current.map((section) =>
        (section.dbId || section.id) === sectionId
          ? {
              ...section,
              questions: [...section.questions, json.question].sort((a, b) => a.sortOrder - b.sortOrder),
            }
          : section
      )
    );
    setDraftQuestions((current) => ({ ...current, [sectionId]: { prompt: "", whyItMatters: "", weight: 1, scoreLabels: defaultScoreLabels } }));
    setMessage("Question created.");
    router.refresh();
  };

  const updateQuestion = async (questionId, patch) => {
    const response = await fetch(`/api/admin/assessment/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error || "Failed to update question.");
      return;
    }

    setSections((current) =>
      current.map((section) => ({
        ...section,
        questions: section.questions.map((question) =>
          (question.dbId || question.id) === questionId
            ? {
                ...question,
                ...json.question,
                id: question.id,
                dbId: json.question.id,
              }
            : question
        ),
      }))
    );
    setMessage("Question updated.");
    router.refresh();
  };

  const deleteQuestion = async (questionId) => {
    const response = await fetch(`/api/admin/assessment/questions/${questionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Failed to delete question.");
      return;
    }

    setSections((current) =>
      current.map((section) => ({
        ...section,
        questions: section.questions.filter((question) => (question.dbId || question.id) !== questionId),
      }))
    );
    setMessage("Question deleted.");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandBadge subtitle="Assessment administration" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Admin module</p>
            <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-slate-950">I2E Consulting control center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Manage the live assessment framework, review reporting activity, and keep the I2E Consulting question library aligned with how you want the product to behave.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {adminEmail}
            </div>
            <AdminLogoutButton />
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/survey">Open live assessment</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/reports">View reports</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/audit-logs">Audit logs</Link>
            </Button>
          </div>
        </div>

        {status ? (
          <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">{status}</div>
        ) : null}

        {overview.frameworkUnavailable ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            The admin page is using the default in-code framework because the running Prisma client does not yet expose the new assessment models.
            A dev server restart will usually switch this page back to the live database-backed framework.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={Settings2} label="Active sections" value={overview.sectionCount} />
          <MetricCard icon={FilePlus2} label="Active questions" value={overview.questionCount} />
          <MetricCard icon={BarChart3} label="Saved reports" value={overview.surveyCount} />
          <MetricCard icon={Pencil} label="Average score" value={overview.averageScore || "0.00"} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Assessment settings</CardTitle>
                <CardDescription>Control AI report generation during assessment creation. Score weightage is managed below through section and question weights.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">AI report generation</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        When enabled, the assessment automatically generates the AI advisory report. When disabled, consultants will only save the weighted scorecard and structured assessment data.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => updateSettings(!settings?.reportGenerationEnabled)}
                      className={`relative inline-flex h-11 w-24 items-center rounded-full transition ${
                        settings?.reportGenerationEnabled ? "bg-slate-950" : "bg-slate-300"
                      } ${savingSettings ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <span
                        className={`inline-block size-9 transform rounded-full bg-white shadow transition ${
                          settings?.reportGenerationEnabled ? "translate-x-[3.25rem]" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    {settings?.reportGenerationEnabled ? "Enabled during assessment creation" : "Disabled during assessment creation"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Create section</CardTitle>
                <CardDescription>Add a new assessment dimension that will appear in the live survey.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Section title">
                  <Input
                    aria-invalid={Boolean(newSectionErrors.title)}
                    value={newSection.title}
                    onChange={(event) => {
                      setNewSection((current) => ({ ...current, title: event.target.value }));
                      setNewSectionErrors((current) => ({ ...current, title: "" }));
                    }}
                  />
                  <FieldError message={newSectionErrors.title} />
                </Field>
                <Field label="Description">
                  <Textarea
                    aria-invalid={Boolean(newSectionErrors.description)}
                    value={newSection.description}
                    onChange={(event) => {
                      setNewSection((current) => ({ ...current, description: event.target.value }));
                      setNewSectionErrors((current) => ({ ...current, description: "" }));
                    }}
                  />
                  <FieldError message={newSectionErrors.description} />
                </Field>
                <Field label="Weight">
                  <Input
                    type="number"
                    step="0.05"
                    aria-invalid={Boolean(newSectionErrors.weight)}
                    value={newSection.weight}
                    onChange={(event) => {
                      setNewSection((current) => ({ ...current, weight: event.target.value }));
                      setNewSectionErrors((current) => ({ ...current, weight: "" }));
                    }}
                  />
                  <FieldError message={newSectionErrors.weight} />
                </Field>
                <Button className="w-full rounded-full" onClick={createSection}>
                  <FolderPlus className="size-4" />
                  Add section
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent report activity</CardTitle>
                <CardDescription>Quick view of the latest saved assessments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.recentSurveys.map((report) => {
                  const answers = parseAnswers(report);
                  const profile = answers?.profile || {};

                  return (
                    <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="font-medium text-slate-950">{profile.organizationName || "Untitled report"}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {report.maturityLevel} • {report.finalScore.toFixed(2)} • {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <SectionEditor
                key={section.dbId || section.id}
                section={section}
                draftQuestion={draftQuestions[section.dbId || section.id] || { prompt: "", whyItMatters: "", weight: 1, scoreLabels: defaultScoreLabels }}
                setDraftQuestion={(patch) =>
                  setDraftQuestions((current) => ({
                    ...current,
                    [section.dbId || section.id]: {
                      ...(current[section.dbId || section.id] || { prompt: "", whyItMatters: "", weight: 1, scoreLabels: defaultScoreLabels }),
                      ...patch,
                    },
                  }))
                }
                onSaveSection={updateSection}
                onDeleteSection={deleteSection}
                onCreateQuestion={createQuestion}
                onSaveQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionEditor({
  section,
  draftQuestion,
  setDraftQuestion,
  onSaveSection,
  onDeleteSection,
  onCreateQuestion,
  onSaveQuestion,
  onDeleteQuestion,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});
  const [draft, setDraft] = useState({
    title: section.title,
    description: section.description,
    weight: section.weight,
    sortOrder: section.sortOrder,
    isActive: section.isActive,
  });

  const validateSection = () => {
    const nextErrors = {};

    if (!draft.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!draft.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!draft.weight || Number(draft.weight) <= 0) {
      nextErrors.weight = "Weight must be greater than 0.";
    }

    if (!draft.sortOrder || Number(draft.sortOrder) <= 0) {
      nextErrors.sortOrder = "Sort order must be greater than 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateNewQuestion = () => {
    const nextErrors = {};

    if (!draftQuestion.prompt?.trim()) {
      nextErrors.prompt = "Question prompt is required.";
    }

    if (!draftQuestion.whyItMatters?.trim()) {
      nextErrors.whyItMatters = "Why it matters is required.";
    }

    if (!draftQuestion.weight || Number(draftQuestion.weight) <= 0) {
      nextErrors.weight = "Weight must be greater than 0.";
    }

    const scoreLabels = normalizeScoreLabelDraft(draftQuestion.scoreLabels);
    for (const value of [1, 2, 3, 4, 5]) {
      if (!scoreLabels[value]?.trim()) {
        nextErrors[`scoreLabel${value}`] = `Label for score ${value} is required.`;
      }
    }

    setQuestionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen((current) => !current)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-1 rounded-full border border-slate-200 bg-slate-50 p-1 transition ${isOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="size-4 text-slate-600" />
            </div>
            <div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.questions.length} questions in this section</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            className="rounded-full text-rose-600 hover:text-rose-700"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteSection(section.dbId || section.id);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </CardHeader>
      {isOpen ? (
        <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              aria-invalid={Boolean(errors.title)}
              value={draft.title}
              onChange={(event) => {
                setDraft((current) => ({ ...current, title: event.target.value }));
                setErrors((current) => ({ ...current, title: "" }));
              }}
            />
            <FieldError message={errors.title} />
          </Field>
          <Field label="Sort order">
            <Input
              type="number"
              aria-invalid={Boolean(errors.sortOrder)}
              value={draft.sortOrder}
              onChange={(event) => {
                setDraft((current) => ({ ...current, sortOrder: event.target.value }));
                setErrors((current) => ({ ...current, sortOrder: "" }));
              }}
            />
            <FieldError message={errors.sortOrder} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea
              aria-invalid={Boolean(errors.description)}
              value={draft.description}
              onChange={(event) => {
                setDraft((current) => ({ ...current, description: event.target.value }));
                setErrors((current) => ({ ...current, description: "" }));
              }}
            />
            <FieldError message={errors.description} />
          </Field>
          <Field label="Weight">
            <Input
              type="number"
              step="0.05"
              aria-invalid={Boolean(errors.weight)}
              value={draft.weight}
              onChange={(event) => {
                setDraft((current) => ({ ...current, weight: event.target.value }));
                setErrors((current) => ({ ...current, weight: "" }));
              }}
            />
            <FieldError message={errors.weight} />
          </Field>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active in live survey
          </label>
        </div>

          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => {
                if (!validateSection()) return;
                onSaveSection(section.dbId || section.id, draft);
              }}
            >
              Save section
          </Button>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Questions</h3>
          </div>

          {section.questions.map((question) => (
            <QuestionEditor
              key={question.dbId || question.id}
              question={question}
              onSave={onSaveQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
            <div className="mb-4 text-sm font-semibold text-slate-900">Add question</div>
            <div className="grid gap-4">
              <Field label="Prompt">
                <Textarea
                  aria-invalid={Boolean(questionErrors.prompt)}
                  value={draftQuestion.prompt}
                  onChange={(event) => {
                    setDraftQuestion({ prompt: event.target.value });
                    setQuestionErrors((current) => ({ ...current, prompt: "" }));
                  }}
                />
                <FieldError message={questionErrors.prompt} />
              </Field>
              <Field label="Why it matters">
                <Textarea
                  aria-invalid={Boolean(questionErrors.whyItMatters)}
                  value={draftQuestion.whyItMatters}
                  onChange={(event) => {
                    setDraftQuestion({ whyItMatters: event.target.value });
                    setQuestionErrors((current) => ({ ...current, whyItMatters: "" }));
                  }}
                />
                <FieldError message={questionErrors.whyItMatters} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Weight">
                  <Input
                    type="number"
                    step="0.05"
                    aria-invalid={Boolean(questionErrors.weight)}
                    value={draftQuestion.weight}
                    onChange={(event) => {
                      setDraftQuestion({ weight: event.target.value });
                      setQuestionErrors((current) => ({ ...current, weight: "" }));
                    }}
                  />
                  <FieldError message={questionErrors.weight} />
                </Field>
                <Field label="Helper text">
                  <Input value={draftQuestion.helperText || ""} onChange={(event) => setDraftQuestion({ helperText: event.target.value })} />
                </Field>
              </div>
              <ScoreLabelFields
                labels={normalizeScoreLabelDraft(draftQuestion.scoreLabels)}
                errors={questionErrors}
                onChange={(value, label) => {
                  setDraftQuestion({
                    scoreLabels: {
                      ...normalizeScoreLabelDraft(draftQuestion.scoreLabels),
                      [value]: label,
                    },
                  });
                  setQuestionErrors((current) => ({ ...current, [`scoreLabel${value}`]: "" }));
                }}
              />
              <Button
                className="rounded-full"
                onClick={() => {
                  if (!validateNewQuestion()) return;
                  onCreateQuestion(section.dbId || section.id);
                }}
              >
                Add question
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      ) : null}
    </Card>
  );
}

function QuestionEditor({ question, onSave, onDelete }) {
  const [errors, setErrors] = useState({});
  const [draft, setDraft] = useState({
    prompt: question.prompt,
    helperText: question.helperText || "",
    whyItMatters: question.whyItMatters || question.why || "",
    weight: question.weight,
    sortOrder: question.sortOrder,
    isActive: question.isActive ?? true,
    scoreLabels: normalizeScoreLabelDraft(question.scoreLabels),
  });

  const validateQuestion = () => {
    const nextErrors = {};

    if (!draft.prompt.trim()) {
      nextErrors.prompt = "Prompt is required.";
    }

    if (!draft.whyItMatters.trim()) {
      nextErrors.whyItMatters = "Why it matters is required.";
    }

    if (!draft.weight || Number(draft.weight) <= 0) {
      nextErrors.weight = "Weight must be greater than 0.";
    }

    if (!draft.sortOrder || Number(draft.sortOrder) <= 0) {
      nextErrors.sortOrder = "Sort order must be greater than 0.";
    }

    for (const value of [1, 2, 3, 4, 5]) {
      if (!draft.scoreLabels[value]?.trim()) {
        nextErrors[`scoreLabel${value}`] = `Label for score ${value} is required.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="grid gap-4">
        <Field label="Prompt">
          <Textarea
            aria-invalid={Boolean(errors.prompt)}
            value={draft.prompt}
            onChange={(event) => {
              setDraft((current) => ({ ...current, prompt: event.target.value }));
              setErrors((current) => ({ ...current, prompt: "" }));
            }}
          />
          <FieldError message={errors.prompt} />
        </Field>
        <Field label="Why it matters">
          <Textarea
            aria-invalid={Boolean(errors.whyItMatters)}
            value={draft.whyItMatters}
            onChange={(event) => {
              setDraft((current) => ({ ...current, whyItMatters: event.target.value }));
              setErrors((current) => ({ ...current, whyItMatters: "" }));
            }}
          />
          <FieldError message={errors.whyItMatters} />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Helper text">
            <Input value={draft.helperText} onChange={(event) => setDraft((current) => ({ ...current, helperText: event.target.value }))} />
          </Field>
          <Field label="Weight">
            <Input
              type="number"
              step="0.05"
              aria-invalid={Boolean(errors.weight)}
              value={draft.weight}
              onChange={(event) => {
                setDraft((current) => ({ ...current, weight: event.target.value }));
                setErrors((current) => ({ ...current, weight: "" }));
              }}
            />
            <FieldError message={errors.weight} />
          </Field>
          <Field label="Sort order">
            <Input
              type="number"
              aria-invalid={Boolean(errors.sortOrder)}
              value={draft.sortOrder}
              onChange={(event) => {
                setDraft((current) => ({ ...current, sortOrder: event.target.value }));
                setErrors((current) => ({ ...current, sortOrder: "" }));
              }}
            />
            <FieldError message={errors.sortOrder} />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Active in live survey
        </label>
        <ScoreLabelFields
          labels={draft.scoreLabels}
          errors={errors}
          onChange={(value, label) => {
            setDraft((current) => ({
              ...current,
              scoreLabels: {
                ...current.scoreLabels,
                [value]: label,
              },
            }));
            setErrors((current) => ({ ...current, [`scoreLabel${value}`]: "" }));
          }}
        />
        <div className="flex flex-wrap justify-between gap-3">
          <Button variant="ghost" className="rounded-full text-rose-600 hover:text-rose-700" onClick={() => onDelete(question.dbId || question.id)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              if (!validateQuestion()) return;
              onSave(question.dbId || question.id, draft);
            }}
          >
            Save question
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScoreLabelFields({ labels, errors, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="text-sm font-semibold text-slate-950">Answer labels for scores 1-5</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Defaults are applied automatically, but each question can use its own maturity wording.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((value) => (
          <Field key={value} label={`${value}`}>
            <Input
              aria-invalid={Boolean(errors?.[`scoreLabel${value}`])}
              value={labels[value]}
              onChange={(event) => onChange(value, event.target.value)}
            />
            <FieldError message={errors?.[`scoreLabel${value}`]} />
          </Field>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-800 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-sm text-rose-600">{message}</p>;
}
