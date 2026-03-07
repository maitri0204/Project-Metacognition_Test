"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { questionAPI } from "@/lib/api";
import type { Question } from "@/types";

// ─── Structure config ───────────────────────────────────────────────────────

const PART_CONFIG = [
  {
    part: "Knowledge" as const,
    roman: "I",
    totalLimit: 17,
    scoreMax: 85,
    isKnowledge: true,
    categories: [
      { name: "Declarative", limit: 8, description: "Knowledge about one's own cognitive strengths and weaknesses" },
      { name: "Procedural", limit: 4, description: "Knowledge about how to implement learning procedures and strategies" },
      { name: "Conditional", limit: 5, description: "Knowledge about when and why to apply particular learning strategies" },
    ],
  },
  {
    part: "Regulation" as const,
    roman: "II",
    totalLimit: 35,
    scoreMax: 175,
    isKnowledge: false,
    categories: [
      { name: "Planning", limit: 7, description: "Goal setting and resource allocation before beginning a task" },
      { name: "Information Management", limit: 10, description: "Strategies used online to process information more efficiently" },
      { name: "Monitoring", limit: 7, description: "Assessment of one's learning and strategy use during the task" },
      { name: "Debugging", limit: 5, description: "Strategies used to correct comprehension and performance errors" },
      { name: "Evaluation", limit: 6, description: "Analysis of performance and strategy effectiveness after the task" },
    ],
  },
];

const ALL_CATEGORIES = PART_CONFIG.flatMap((p) => p.categories.map((c) => c.name));

const SCORE_OPTIONS = [
  { label: "Never", score: 1 },
  { label: "Rarely", score: 2 },
  { label: "Sometimes", score: 3 },
  { label: "Often", score: 4 },
  { label: "Always", score: 5 },
];

// ─── Page component ──────────────────────────────────────────────────────────

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [addingCat, setAddingCat] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const newTextRef = useRef<HTMLTextAreaElement>(null);
  const editTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionAPI.getAll();
      setQuestions(res.data.questions || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const byCategory = (cat: string) =>
    questions.filter((q) => q.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);

  const byPart = (part: string) => questions.filter((q) => q.part === part).length;

  const toggleExpand = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const startAdding = (cat: string) => {
    setAddingCat(cat);
    setNewText("");
    setEditingId(null);
    setExpanded((prev) => new Set([...prev, cat]));
    setTimeout(() => newTextRef.current?.focus(), 80);
  };

  const cancelAdding = () => { setAddingCat(null); setNewText(""); };

  const handleAdd = async (category: string) => {
    if (!newText.trim()) { toast.error("Please enter a question"); return; }
    setSaving(true);
    try {
      await questionAPI.add({ questionText: newText.trim(), category });
      toast.success("Question added!");
      setNewText("");
      setAddingCat(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (q: Question) => {
    setEditingId(q._id);
    setEditText(q.questionText);
    setAddingCat(null);
    setTimeout(() => editTextRef.current?.focus(), 80);
  };

  const cancelEditing = () => { setEditingId(null); setEditText(""); };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) { toast.error("Question cannot be empty"); return; }
    setSaving(true);
    try {
      await questionAPI.update(id, { questionText: editText.trim() });
      toast.success("Question updated!");
      setEditingId(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      await questionAPI.remove(id);
      toast.success("Question deleted");
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const total = questions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-1">
            Manage the 52 metacognition assessment questions across Knowledge and Regulation parts
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold flex-shrink-0 ${
            total === 52
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {total === 52 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
            </svg>
          )}
          {total} / 52 questions
        </div>
      </div>

      {/* ── Stats cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Total</p>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-gray-400 mb-0.5 text-sm">/ 52</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div className="bg-gray-700 h-2 rounded-full transition-all" style={{ width: `${(total / 52) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Max score: 260 pts</p>
        </div>
        {/* Knowledge */}
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-2">Knowledge</p>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-3xl font-bold text-blue-700">{byPart("Knowledge")}</span>
            <span className="text-blue-300 mb-0.5 text-sm">/ 17</span>
          </div>
          <div className="bg-blue-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(byPart("Knowledge") / 17) * 100}%` }} />
          </div>
          <p className="text-xs text-blue-400 mt-1.5">Declarative · Procedural · Conditional</p>
        </div>
        {/* Regulation */}
        <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
          <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-2">Regulation</p>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-3xl font-bold text-emerald-700">{byPart("Regulation")}</span>
            <span className="text-emerald-300 mb-0.5 text-sm">/ 35</span>
          </div>
          <div className="bg-emerald-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(byPart("Regulation") / 35) * 100}%` }} />
          </div>
          <p className="text-xs text-emerald-400 mt-1.5">Planning · Mgmt · Monitoring · Debug · Eval</p>
        </div>
      </div>

      {/* ── Scoring legend ──────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-amber-700 font-semibold text-sm">Scoring Scale:</span>
        {SCORE_OPTIONS.map(({ label, score }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="bg-amber-200 text-amber-800 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {score}
            </span>
            <span className="text-gray-700 text-sm">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-500 hidden sm:block">
          Max per question: <strong>5</strong> · Total max: <strong>260 pts</strong> · Each option is self-reported (no correct answer)
        </span>
      </div>

      {/* ── Parts & Categories ──────────────────────────── */}
      <div className="space-y-12">
        {PART_CONFIG.map((part) => {
          const partCount = byPart(part.part);
          const partFull = partCount === part.totalLimit;
          const blue = part.isKnowledge;

          return (
            <div key={part.part}>
              {/* Part header */}
              <div className={`flex items-center justify-between pb-3 mb-5 border-b-2 ${blue ? "border-blue-200" : "border-emerald-200"}`}>
                <div>
                  <h2 className={`text-xl font-bold ${blue ? "text-blue-700" : "text-emerald-700"}`}>
                    Part {part.roman}: {part.part}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {part.categories.length} categories · Max {part.scoreMax} pts
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                    partFull
                      ? blue ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                      : blue ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {partCount} / {part.totalLimit}
                </span>
              </div>

              {/* Category cards */}
              <div className="space-y-4">
                {part.categories.map((cat) => {
                  const catQs = byCategory(cat.name);
                  const count = catQs.length;
                  const isFull = count >= cat.limit;
                  const isExpanded = expanded.has(cat.name);
                  const isAdding = addingCat === cat.name;
                  const pct = Math.round((count / cat.limit) * 100);

                  return (
                    <div
                      key={cat.name}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${blue ? "border-blue-100" : "border-emerald-100"}`}
                    >
                      {/* Category header */}
                      <button
                        onClick={() => toggleExpand(cat.name)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              isFull
                                ? blue ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                                : blue ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isFull ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              count
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cat.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{cat.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          <div className="hidden sm:block text-right">
                            <p className={`text-sm font-semibold ${isFull ? (blue ? "text-blue-600" : "text-emerald-600") : "text-gray-700"}`}>
                              {count} / {cat.limit}
                            </p>
                            <p className="text-xs text-gray-400">{pct}%</p>
                          </div>
                          <div className="w-16 bg-gray-100 rounded-full h-2 hidden sm:block">
                            <div
                              className={`h-2 rounded-full transition-all ${blue ? "bg-blue-500" : "bg-emerald-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div className={`border-t px-5 py-5 ${blue ? "border-blue-50" : "border-emerald-50"}`}>
                          {/* Questions list */}
                          {catQs.length === 0 && !isAdding ? (
                            <p className="text-sm text-gray-400 italic text-center py-6">
                              No questions yet. Click &ldquo;+ Add Question&rdquo; below to start.
                            </p>
                          ) : (
                            <ol className="space-y-1.5 mb-4">
                              {catQs.map((q, idx) => (
                                <li key={q._id} className="group">
                                  {editingId === q._id ? (
                                    /* ── Edit mode ── */
                                    <div className={`p-3 rounded-xl border ${blue ? "bg-blue-50 border-blue-100" : "bg-emerald-50 border-emerald-100"}`}>
                                      <div className="flex gap-3 items-start">
                                        <span className={`mt-2.5 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${blue ? "bg-blue-200 text-blue-700" : "bg-emerald-200 text-emerald-700"}`}>
                                          {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                          <textarea
                                            ref={editTextRef}
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" && e.ctrlKey) handleUpdate(q._id);
                                              if (e.key === "Escape") cancelEditing();
                                            }}
                                          />
                                          <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to save · Escape to cancel</p>
                                          <div className="flex gap-2 mt-2">
                                            <button
                                              onClick={() => handleUpdate(q._id)}
                                              disabled={saving}
                                              className={`px-4 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${blue ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                                            >
                                              {saving ? "Saving…" : "Save Changes"}
                                            </button>
                                            <button onClick={cancelEditing} className="px-4 py-1.5 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* ── View mode ── */
                                    <div className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                      <span className={`mt-0.5 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${blue ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                                        {idx + 1}
                                      </span>
                                      <p className="flex-1 text-sm text-gray-700 leading-relaxed">{q.questionText}</p>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                          onClick={() => startEditing(q)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit question"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(q._id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Delete question"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ol>
                          )}

                          {/* Add form */}
                          {isAdding && (
                            <div className={`mt-2 p-4 rounded-xl border ${blue ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"}`}>
                              <p className={`text-xs font-semibold mb-2 ${blue ? "text-blue-700" : "text-emerald-700"}`}>
                                Question #{count + 1} of {cat.limit}
                              </p>
                              <textarea
                                ref={newTextRef}
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                rows={3}
                                placeholder="Enter question text…"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.ctrlKey) handleAdd(cat.name);
                                  if (e.key === "Escape") cancelAdding();
                                }}
                              />
                              <p className="text-xs text-gray-400 mt-1 mb-3">Ctrl+Enter to save · Escape to cancel</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAdd(cat.name)}
                                  disabled={saving}
                                  className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${blue ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                                >
                                  {saving ? "Adding…" : "Add Question"}
                                </button>
                                <button onClick={cancelAdding} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Add button / full message */}
                          {!isAdding && !isFull && (
                            <button
                              onClick={() => startAdding(cat.name)}
                              className={`mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-dashed transition-colors ${blue ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Question
                              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${blue ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                                {cat.limit - count} remaining
                              </span>
                            </button>
                          )}

                          {!isAdding && isFull && (
                            <p className={`mt-3 text-xs font-semibold flex items-center gap-1.5 ${blue ? "text-blue-600" : "text-emerald-600"}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              All {cat.limit} questions added
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
