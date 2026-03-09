"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import { Question } from "@/types";

interface AnswerMap {
  [questionId: string]: { selectedOption: string; score: number };
}

const LS_KEY = "metacog_test_answers";

const DOMAIN_COLOR: Record<number, string> = {
  1: "#3b82f6",
  2: "#8b5cf6",
  3: "#10b981",
  4: "#f97316",
  5: "#ec4899",
};

const GUIDELINES = [
  "This test contains 40 questions across 5 domains of metacognition.",
  "There are no right or wrong answers — respond based on how you actually think and learn.",
  "Each question has 5 options ranging from Never to Always.",
  "Your answers are saved automatically as you go - do not refresh or close the tab.",
  "The test will enter full-screen mode to help you stay focused.",
  "Use the Question Navigator on the right to jump to any question at any time.",
  "Submit only after answering all 40 questions.",
];

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? (JSON.parse(saved) as AnswerMap) : {};
    } catch {
      return {};
    }
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visited, setVisited]       = useState<Set<number>>(new Set([0]));
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark as visited whenever question changes
  useEffect(() => {
    setVisited((prev) => new Set([...prev, currentIdx]));
  }, [currentIdx]);

  // Auto-save answers
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  // Fetch questions
  useEffect(() => {
    testAPI
      .getQuestions()
      .then((res) => setQuestions(res.data.questions || []))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ────────────────────────────────────────────
  const sorted       = [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
  const total        = sorted.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered  = answeredCount === total && total > 0;
  const currentQ     = sorted[currentIdx] ?? null;

  // Domain groups for the navigator
  type DomainGroup = { domainNumber: number; name: string; indices: number[] };
  const domainGroups: DomainGroup[] = [];
  const seenD: Record<number, number> = {};
  sorted.forEach((q, idx) => {
    if (seenD[q.domainNumber] === undefined) {
      seenD[q.domainNumber] = domainGroups.length;
      domainGroups.push({ domainNumber: q.domainNumber, name: q.domain, indices: [] });
    }
    domainGroups[seenD[q.domainNumber]].indices.push(idx);
  });

  const partLabel = currentQ
    ? currentQ.domainNumber === 1 ? "Part I: Knowledge" : "Part II: Regulation"
    : "";

  // ── Handlers ───────────────────────────────────────────────
  const handleSelect = (option: { label: string; score: number }) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ._id]: { selectedOption: option.label, score: option.score } }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) { toast.error("Please answer all questions before submitting"); return; }
    setSubmitting(true);
    try {
      const payload = sorted.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id].selectedOption,
        score: answers[q._id].score,
      }));
      const res = await testAPI.submit({ answers: payload });
      toast.success("Test submitted successfully!");
      try { localStorage.removeItem(LS_KEY); } catch {}
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      router.push(`/student/results/${res.data.resultId}`);
    } catch {
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    // fullscreen is triggered in useEffect below once the test div is mounted
  };

  // Request fullscreen as soon as test UI mounts
  useEffect(() => {
    if (!testStarted) return;
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => { /* blocked by browser */ });
    }
  }, [testStarted]);

  // ── Guidelines screen ───────────────────────────────────────
  if (!testStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Thinking & Expression Skills Test</h1>
            <p className="text-blue-100 mt-1.5 text-sm">Read the guidelines carefully before you begin</p>
          </div>

          <div className="p-8">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">40</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Questions</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">5</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Domains</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">~15</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Minutes</p>
              </div>
            </div>

            {/* Guidelines list */}
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Instructions</h2>
            <div className="space-y-2.5 mb-8">
              {GUIDELINES.map((g, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{g}</p>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Loading questions…
                </>
              ) : (
                <>
                  Start Test
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test UI (fullscreen container) ──────────────────────────
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto"
    >
      <div className="p-6 space-y-4 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Metacognition Assessment</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Answer all {total} questions honestly — there are no right or wrong answers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">{answeredCount}/{total}</span>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              allAnswered && !submitting
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </div>

      {/* Question area + navigator */}
      {currentQ && (
        <div className="flex gap-4 items-start">

          {/* ── Left: question card ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Breadcrumb */}
            <p className="text-sm text-gray-500 px-1">
              <span className="font-medium text-gray-700">{partLabel}</span>
              {" · Question "}{currentIdx + 1} of {total}
            </p>

            {/* Question */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6">
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: DOMAIN_COLOR[currentQ.domainNumber] }}
                >
                  {currentQ.questionNumber}
                </span>
                <p className="text-gray-900 font-medium text-base leading-relaxed pt-2">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ._id]?.selectedOption === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect({ label: opt.label, score: opt.score })}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {/* Radio */}
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </span>
                      {/* Score bubble */}
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opt.score}
                      </span>
                      {/* Label */}
                      <span className={`font-medium text-sm ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next */}
            <div className="flex justify-between pt-1 px-1">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              {currentIdx < total - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                    allAnswered && !submitting
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Submitting…" : "Submit Test ✓"}
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Navigator ── */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Question Navigator
              </p>

              <div className="space-y-4">
                {domainGroups.map((dg) => (
                  <div key={dg.domainNumber}>
                    {/* Domain heading — same font family as question, larger than chips */}
                    <p
                      className="text-sm font-bold mb-2"
                      style={{ color: DOMAIN_COLOR[dg.domainNumber] }}
                    >
                      {dg.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dg.indices.map((qIdx) => {
                        const q         = sorted[qIdx];
                        const isAnswered = !!answers[q._id];
                        const isCurrent  = qIdx === currentIdx;
                        const isVisited  = visited.has(qIdx);
                        return (
                          <button
                            key={q._id}
                            onClick={() => setCurrentIdx(qIdx)}
                            title={`Q${q.questionNumber}`}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                              isCurrent
                                ? "text-white shadow-sm"
                                : isAnswered
                                ? "text-white hover:opacity-90"
                                : isVisited
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                            style={
                              isCurrent
                                ? { backgroundColor: DOMAIN_COLOR[dg.domainNumber], outline: `2px solid ${DOMAIN_COLOR[dg.domainNumber]}`, outlineOffset: "2px" }
                                : isAnswered
                                ? { backgroundColor: "#16a34a" }
                                : {}
                            }
                          >
                            {q.questionNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-md flex-shrink-0 bg-green-600" />
                  Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-md flex-shrink-0 bg-red-100 border border-red-300" />
                  Not answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-5 h-5 rounded-md flex-shrink-0 bg-gray-100 border border-gray-200" />
                  Not visited
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      </div>
    </div>
  );
}
