"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { parentTestAPI } from "@/lib/api";
import { Question } from "@/types";

interface AnswerMap {
  [questionId: string]: { selectedOption: string; score: number };
}

interface ParentFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  mobileCode: string;
  mobile: string;
  email: string;
  relation: string;
}

const LS_KEY = "metacog_parent_test_answers";
const LS_PARENT_KEY = "metacog_parent_info";

const SECTION_COLOR: Record<number, string> = {
  1: "#3b82f6",
  2: "#8b5cf6",
  3: "#10b981",
  4: "#f97316",
  5: "#ec4899",
};

const GUIDELINES = [
  "This assessment contains 40 questions across 5 sections about your child's metacognitive abilities.",
  "There are no right or wrong answers — respond based on how you observe your child's thinking and learning habits.",
  "Each question has 5 options ranging from Never to Always.",
  "Your answers are saved automatically as you go — do not refresh or close the tab.",
  "The test will enter full-screen mode to help you stay focused.",
  "Use the Question Navigator on the right to jump to any question at any time.",
  "Submit only after answering all 40 questions.",
];

const RELATION_OPTIONS = ["Father", "Mother", "Guardian", "Other"];

export default function ParentTestPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "guidelines" | "test">("register");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? (JSON.parse(saved) as AnswerMap) : {};
    } catch {
      return {};
    }
  });
  const [parentForm, setParentForm] = useState<ParentFormData>(() => {
    try {
      const saved = localStorage.getItem(LS_PARENT_KEY);
      const parsed = saved ? (JSON.parse(saved) as ParentFormData) : null;
      return parsed ?? { firstName: "", middleName: "", lastName: "", mobileCode: "+91", mobile: "", email: "", relation: "" };
    } catch {
      return { firstName: "", middleName: "", lastName: "", mobileCode: "+91", mobile: "", email: "", relation: "" };
    }
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark as visited
  useEffect(() => {
    setVisited((prev) => new Set([...prev, currentIdx]));
  }, [currentIdx]);

  // Auto-save answers
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(answers)); } catch {}
  }, [answers]);

  // Auto-save parent form
  useEffect(() => {
    try { localStorage.setItem(LS_PARENT_KEY, JSON.stringify(parentForm)); } catch {}
  }, [parentForm]);

  // Fetch questions
  useEffect(() => {
    parentTestAPI
      .getQuestions()
      .then((res) => setQuestions(res.data.questions || []))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  }, []);

  // Derived data
  const sorted = [...questions].sort((a, b) => a.questionNumber - b.questionNumber);
  const total = sorted.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total && total > 0;
  const currentQ = sorted[currentIdx] ?? null;

  // Section groups for navigator
  type SectionGroup = { domainNumber: number; name: string; indices: number[] };
  const sectionGroups: SectionGroup[] = [];
  const seenS: Record<number, number> = {};
  sorted.forEach((q, idx) => {
    if (seenS[q.domainNumber] === undefined) {
      seenS[q.domainNumber] = sectionGroups.length;
      sectionGroups.push({ domainNumber: q.domainNumber, name: q.domain, indices: [] });
    }
    sectionGroups[seenS[q.domainNumber]].indices.push(idx);
  });

  // Handlers
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
      const res = await parentTestAPI.submit({
        parentInfo: {
          ...parentForm,
          mobile: `${parentForm.mobileCode}${parentForm.mobile}`,
        },
        answers: payload,
      });
      toast.success("Parent assessment submitted successfully!");
      try {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_PARENT_KEY);
      } catch {}
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      router.push(`/student/parent-results/${res.data.resultId}`);
    } catch {
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const handleStartTest = () => {
    setStep("test");
  };

  // Request fullscreen when test starts
  useEffect(() => {
    if (step !== "test") return;
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, [step]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentForm.firstName.trim() || !parentForm.lastName.trim() || !parentForm.mobile.trim() || !parentForm.email.trim() || !parentForm.relation) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^\d{10}$/.test(parentForm.mobile.trim())) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    setStep("guidelines");
  };

  // ── Registration Form ──
  if (step === "register") {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Parent Assessment</h1>
            <p className="text-blue-100 mt-1.5 text-sm">Please provide parent/guardian details before starting the test</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={parentForm.firstName}
                  onChange={(e) => setParentForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Middle Name</label>
                <input
                  type="text"
                  value={parentForm.middleName}
                  onChange={(e) => setParentForm((p) => ({ ...p, middleName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Middle name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={parentForm.lastName}
                onChange={(e) => setParentForm((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Last name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select
                  value={parentForm.mobileCode}
                  onChange={(e) => setParentForm((p) => ({ ...p, mobileCode: e.target.value }))}
                  className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white flex-shrink-0"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+55">🇧🇷 +55</option>
                </select>
                <input
                  type="tel"
                  value={parentForm.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setParentForm((p) => ({ ...p, mobile: val }));
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="10-digit number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={parentForm.email}
                onChange={(e) => setParentForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Relation to Student <span className="text-red-500">*</span></label>
              <select
                value={parentForm.relation}
                onChange={(e) => setParentForm((p) => ({ ...p, relation: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                required
              >
                <option value="">Select relation</option>
                {RELATION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              Submit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Guidelines Screen ──
  if (step === "guidelines") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Parent Assessment Guidelines</h1>
            <p className="text-blue-100 mt-1.5 text-sm">
              Welcome, {parentForm.firstName}! Read the guidelines carefully before you begin
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">40</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Questions</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">5</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Sections</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">~15</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Minutes</p>
              </div>
            </div>

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

            <div className="flex gap-3">
              <button
                onClick={() => setStep("register")}
                className="px-5 py-3.5 rounded-xl font-bold text-sm text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleStartTest}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Loading questions…
                  </>
                ) : (
                  <>
                    Start Assessment
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Fullscreen Test UI ──
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto select-none"
      onCopy={(e) => e.preventDefault()}
    >
      <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Parent Assessment</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Answer all {total} questions based on your observation of your child
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
              {submitting ? "Submitting…" : "Submit Assessment"}
            </button>
          </div>
        </div>

        {/* Question + Navigator */}
        {currentQ && (
          <div className="flex gap-4 items-start">
            {/* Left: question card */}
            <div className="flex-1 min-w-0 space-y-3">
              <p className="text-sm text-gray-500 px-1">
                <span className="font-medium text-gray-700">{currentQ.domain}</span>
                {" · Question "}{currentIdx + 1} of {total}
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-6">
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: SECTION_COLOR[currentQ.domainNumber] }}
                  >
                    {currentQ.questionNumber}
                  </span>
                  <p className="text-gray-900 font-medium text-base leading-relaxed pt-2">
                    {currentQ.questionText}
                  </p>
                </div>

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
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                        </span>
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {opt.score}
                        </span>
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
                    {submitting ? "Submitting…" : "Submit Assessment ✓"}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Navigator */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Question Navigator
                </p>

                <div className="space-y-4">
                  {sectionGroups.map((sg) => (
                    <div key={sg.domainNumber}>
                      <p
                        className="text-sm font-bold mb-2"
                        style={{ color: SECTION_COLOR[sg.domainNumber] }}
                      >
                        {sg.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.indices.map((qIdx) => {
                          const q = sorted[qIdx];
                          const isAnswered = !!answers[q._id];
                          const isCurrent = qIdx === currentIdx;
                          const isVisited = visited.has(qIdx);
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
                                  ? { backgroundColor: SECTION_COLOR[sg.domainNumber], outline: `2px solid ${SECTION_COLOR[sg.domainNumber]}`, outlineOffset: "2px" }
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
