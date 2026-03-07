"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import type { Question } from "@/types";

// ─── Section configuration (must match backend STUDENT_LIMITS order) ─────────

const SECTIONS = [
  { name: "Declarative",            part: "Knowledge",  count: 8  },
  { name: "Procedural",             part: "Knowledge",  count: 4  },
  { name: "Conditional",            part: "Knowledge",  count: 5  },
  { name: "Planning",               part: "Regulation", count: 7  },
  { name: "Information Management", part: "Regulation", count: 10 },
  { name: "Monitoring",             part: "Regulation", count: 7  },
  { name: "Debugging",              part: "Regulation", count: 5  },
  { name: "Evaluation",             part: "Regulation", count: 6  },
] as const;

const SCORE_OPTIONS = [
  { score: 1, label: "Never",     desc: "I never do this" },
  { score: 2, label: "Rarely",    desc: "I do this less than half the time" },
  { score: 3, label: "Sometimes", desc: "I do this about half the time" },
  { score: 4, label: "Often",     desc: "I do this more than half the time" },
  { score: 5, label: "Always",    desc: "I always do this" },
];

// Pre-compute section start indices
const SECTION_STARTS = SECTIONS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SECTIONS[i - 1].count);
  return acc;
}, []);

function getSectionForIdx(idx: number): number {
  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    if (idx >= SECTION_STARTS[i]) return i;
  }
  return 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestPage() {
  const router = useRouter();

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [answers, setAnswers]       = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await testAPI.getQuestions();
        setQuestions(res.data.questions || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setActiveSection(getSectionForIdx(idx));
  }, []);

  const handleAnswer = (score: number) => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q._id]: score }));
  };

  const handleSubmit = async () => {
    const total    = questions.length;
    const answered = Object.keys(answers).length;

    if (answered < total) {
      const firstMissing = questions.findIndex(q => !answers[q._id]);
      toast.error(`${total - answered} question(s) unanswered. Jumping to first unanswered.`);
      goTo(firstMissing);
      return;
    }

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map(q => ({ questionId: q._id, score: answers[q._id] })),
      };
      const res = await testAPI.submit(payload);
      toast.success("Test submitted successfully!");
      router.push(`/student/results/${res.data.result._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="spinner" />
        <p className="text-sm text-gray-500">Loading test questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">No Questions Available</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          The admin hasn&apos;t added enough questions yet. Please check back later.
        </p>
      </div>
    );
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const currentQ      = questions[currentIdx];
  const currentAnswer = currentQ ? answers[currentQ._id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const allAnswered   = answeredCount === questions.length;
  const progress      = Math.round((answeredCount / questions.length) * 100);

  return (
    <>
      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Submit Test?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              You&apos;ve answered all 52 questions. Once submitted, you cannot change your answers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Review Again
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Metacognition Assessment</h1>
            <p className="text-sm text-gray-700 mt-0.5">Answer all 52 questions honestly — there are no right or wrong answers</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-28 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${allAnswered ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-sm font-semibold tabular-nums ${allAnswered ? "text-emerald-600" : "text-gray-600"}`}>
                {answeredCount}/{questions.length}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                allAnswered && !submitting
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting…" : allAnswered ? "✓ Submit Test" : "Submit Test"}
            </button>
          </div>
        </div>

        {/* ── Section tabs ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 px-3 py-2.5 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {SECTIONS.map((s, si) => {
              const start   = SECTION_STARTS[si];
              const end     = start + s.count;
              const secAns  = questions.slice(start, end).filter(q => answers[q._id]).length;
              const isActive = activeSection === si;
              const isKnow  = s.part === "Knowledge";
              const secFull = secAns === s.count;

              return (
                <button
                  key={s.name}
                  onClick={() => goTo(SECTION_STARTS[si])}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? isKnow
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-emerald-600 text-white shadow-sm"
                      : secFull
                      ? isKnow
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {secFull && !isActive && (
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {s.name}
                  <span className={`text-sm ${isActive ? "opacity-75" : "opacity-60"}`}>
                    {secAns}/{s.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main area ────────────────────────────────────────────────────── */}
        <div className="flex gap-4 items-start">
          {/* Question + options */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <p className="text-sm text-gray-700 mb-3">
              Part {SECTIONS[activeSection].part === "Knowledge" ? "I" : "II"}: {SECTIONS[activeSection].part}
              {" → "}
              {SECTIONS[activeSection].name}
              {" · "}
              Question {currentIdx + 1} of {questions.length}
            </p>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
              <div className="flex items-start gap-4">
                <span
                  className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl font-bold flex-shrink-0 ${
                    currentAnswer
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {currentIdx + 1}
                </span>
                <p className="text-gray-900 text-base leading-relaxed pt-2">
                  {currentQ?.questionText}
                </p>
              </div>
            </div>

            {/* Score options */}
            <div className="space-y-2">
              {SCORE_OPTIONS.map(({ score, label, desc }) => {
                const selected = currentAnswer === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left group ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Radio circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected ? "border-blue-500 bg-blue-500" : "border-gray-300 group-hover:border-blue-300"
                      }`}
                    >
                      {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    {/* Score badge */}
                    <span
                      className={`text-xs font-bold w-5 text-center flex-shrink-0 ${
                        selected ? "text-blue-700" : "text-gray-400"
                      }`}
                    >
                      {score}
                    </span>
                    {/* Labels */}
                    <div>
                      <p className={`text-sm font-semibold ${selected ? "text-blue-800" : "text-gray-800"}`}>
                        {label}
                      </p>
                      <p className={`text-xs mt-0.5 ${selected ? "text-blue-500" : "text-gray-700"}`}>
                        {desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="text-sm text-gray-700">{currentIdx + 1} / {questions.length}</span>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => goTo(currentIdx + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    allAnswered
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {allAnswered ? "Finish & Submit" : "Answer All to Submit"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
