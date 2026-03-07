"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { questionAPI } from "@/lib/api";
import type { Question } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const PART_CONFIG = [
  {
    part: "Knowledge" as const,
    roman: "I",
    studentTotal: 17,
    scoreMax: 85,
    color: {
      border: "border-blue-200",      headerBg: "bg-blue-600",
      lightBg: "bg-blue-50",          text: "text-blue-700",
      badgeBg: "bg-blue-100",         bar: "bg-blue-500",
      btnBorder: "border-blue-200",   btnHover: "hover:bg-blue-50",
      btnText: "text-blue-600",       sectionBorder: "border-blue-100",
      editBg: "bg-blue-50 border-blue-100",
      editBadge: "bg-blue-200 text-blue-700",
      saveBg: "bg-blue-600 hover:bg-blue-700",
    },
    categories: [
      { name: "Declarative",  studentLimit: 8,  description: "Knowledge about one's own cognitive strengths and weaknesses" },
      { name: "Procedural",   studentLimit: 4,  description: "Knowledge about how to implement learning procedures and strategies" },
      { name: "Conditional",  studentLimit: 5,  description: "Knowledge about when and why to apply particular learning strategies" },
    ],
  },
  {
    part: "Regulation" as const,
    roman: "II",
    studentTotal: 35,
    scoreMax: 175,
    color: {
      border: "border-emerald-200",   headerBg: "bg-emerald-600",
      lightBg: "bg-emerald-50",       text: "text-emerald-700",
      badgeBg: "bg-emerald-100",      bar: "bg-emerald-500",
      btnBorder: "border-emerald-200", btnHover: "hover:bg-emerald-50",
      btnText: "text-emerald-600",    sectionBorder: "border-emerald-100",
      editBg: "bg-emerald-50 border-emerald-100",
      editBadge: "bg-emerald-200 text-emerald-700",
      saveBg: "bg-emerald-600 hover:bg-emerald-700",
    },
    categories: [
      { name: "Planning",               studentLimit: 7,  description: "Goal setting and resource allocation before beginning a task" },
      { name: "Information Management", studentLimit: 10, description: "Strategies used online to process information more efficiently" },
      { name: "Monitoring",             studentLimit: 7,  description: "Assessment of one's learning and strategy use during the task" },
      { name: "Debugging",              studentLimit: 5,  description: "Strategies used to correct comprehension and performance errors" },
      { name: "Evaluation",             studentLimit: 6,  description: "Analysis of performance and strategy effectiveness after the task" },
    ],
  },
] as const;

const SCORE_OPTIONS = [
  { label: "Never", score: 1 },
  { label: "Rarely", score: 2 },
  { label: "Sometimes", score: 3 },
  { label: "Often", score: 4 },
  { label: "Always", score: 5 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
  const [questions,     setQuestions]     = useState<Question[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedPart,  setSelectedPart]  = useState<"Knowledge" | "Regulation">("Knowledge");
  const [openCats,      setOpenCats]      = useState<Set<string>>(new Set());
  const [addingCat,     setAddingCat]     = useState<string | null>(null);
  const [newText,    setNewText]    = useState("");
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const newTextRef  = useRef<HTMLTextAreaElement>(null);
  const editTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchQuestions(); }, []);

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

  const toggleCat = (cat: string) =>
    setOpenCats((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const startAdding = (cat: string) => {
    setAddingCat(cat);
    setNewText("");
    setEditingId(null);
    setOpenCats((prev) => new Set([...prev, cat]));
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

  const totalBank = questions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Build your question bank freely — students are shown a fixed random selection each attempt
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-700 flex-shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {totalBank} in bank &nbsp;·&nbsp; 52 shown to students
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Bank</p>
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-3xl font-bold text-gray-900">{totalBank}</span>
            <span className="text-gray-400 mb-0.5 text-sm">questions</span>
          </div>
          <p className="text-xs text-gray-400">Students see: <strong className="text-gray-600">52</strong> (randomly shuffled per attempt)</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-2">Knowledge Bank</p>
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-3xl font-bold text-blue-700">{byPart("Knowledge")}</span>
            <span className="text-blue-300 mb-0.5 text-sm">in bank</span>
          </div>
          <p className="text-xs text-blue-400">Students see: <strong className="text-blue-600">17</strong> · Declarative · Procedural · Conditional</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
          <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-2">Regulation Bank</p>
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-3xl font-bold text-emerald-700">{byPart("Regulation")}</span>
            <span className="text-emerald-300 mb-0.5 text-sm">in bank</span>
          </div>
          <p className="text-xs text-emerald-400">Students see: <strong className="text-emerald-600">35</strong> · 5 regulation categories</p>
        </div>
      </div>

      {/* ── Scoring legend ───────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-amber-700 font-semibold text-sm">Scoring Scale:</span>
        {SCORE_OPTIONS.map(({ label, score }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="bg-amber-200 text-amber-800 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{score}</span>
            <span className="text-gray-700 text-sm">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-500 hidden sm:block">
          1–5 per question · self-reported · no correct answers
        </span>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-12">
          {PART_CONFIG.map((part) => {
            const isActive = selectedPart === part.part;
            const c = part.color;
            return (
              <button
                key={part.part}
                onClick={() => setSelectedPart(part.part as "Knowledge" | "Regulation")}
                className={`pb-4 px-1 font-semibold text-sm transition-colors relative ${
                  isActive
                    ? `${c.text}`
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Part {part.roman}: {part.part}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${c.bar} rounded-full`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content for selected part ───────────────────────────────────────── */}
      {PART_CONFIG.map((part) => {
        if (selectedPart !== part.part) return null;
        const c = part.color;
        const bankCount = byPart(part.part);

        return (
          <div key={part.part}>
            {/* Part header info */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-lg font-bold ${c.text}`}>Part {part.roman}: {part.part}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {part.categories.length} sub-types · students see {part.studentTotal} questions · max {part.scoreMax} pts
                </p>
              </div>
              <div className={`text-right ${c.badgeBg} px-4 py-2 rounded-lg`}>
                <p className={`text-lg font-bold ${c.text}`}>{bankCount}</p>
                <p className="text-xs text-gray-600">in bank</p>
              </div>
            </div>

            {/* Category cards ─────────────────────────────────────────────── */}
            <div className="space-y-3">
              {part.categories.map((cat) => {
                const catQs     = byCategory(cat.name);
                const count     = catQs.length;
                const catIsOpen = openCats.has(cat.name);
                const isAdding  = addingCat === cat.name;
                const overQuota = count > cat.studentLimit;
                const barPct    = Math.min(100, Math.round((count / cat.studentLimit) * 100));

                return (
                  <div key={cat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Sub-type header */}
                    <button
                      onClick={() => toggleCat(cat.name)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${count >= cat.studentLimit ? `${c.headerBg} text-white` : `${c.badgeBg} ${c.text}`}`}>
                          {count}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs leading-snug">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <span className={`text-xs font-semibold ${c.text}`}>
                              {overQuota
                                ? <>{count} <span className="text-gray-400 font-normal">({cat.studentLimit} shown)</span></>
                                : <>{count}&thinsp;/&thinsp;{cat.studentLimit}</>}
                            </span>
                          </div>
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${barPct}%` }} />
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${catIsOpen ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Sub-type body */}
                    {catIsOpen && (
                      <div className={`border-t px-4 py-4 ${c.sectionBorder}`}>

                        {/* Bank info bar */}
                        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-4 px-3 py-2 rounded-lg ${c.badgeBg}`}>
                          <span className={`font-semibold ${c.text}`}>Bank: {count}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">
                            Students see: <strong>{Math.min(count, cat.studentLimit)}</strong> randomly
                          </span>
                          {overQuota && (
                            <>
                              <span className="text-gray-400">·</span>
                              <span className="text-amber-600 font-medium">
                                {count - cat.studentLimit} extra (adds variety ✓)
                              </span>
                            </>
                          )}
                          {count < cat.studentLimit && (
                            <>
                              <span className="text-gray-400">·</span>
                              <span className="text-orange-500 font-medium">
                                Need {cat.studentLimit - count} more for full quota
                              </span>
                            </>
                          )}
                        </div>

                        {/* Questions list */}
                        {catQs.length === 0 && !isAdding ? (
                          <p className="text-sm text-gray-400 italic text-center py-6">
                            No questions yet — click &ldquo;Add Question to Bank&rdquo; below to start.
                          </p>
                        ) : (
                          <ol className="space-y-1.5 mb-3">
                            {catQs.map((q, idx) => (
                              <li key={q._id} className="group">
                                {editingId === q._id ? (
                                  <div className={`p-3 rounded-xl border ${c.editBg}`}>
                                    <div className="flex gap-3 items-start">
                                      <span className={`mt-2.5 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${c.editBadge}`}>
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
                                          <button onClick={() => handleUpdate(q._id)} disabled={saving} className={`px-4 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${c.saveBg}`}>
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
                                  <div className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <span className={`mt-0.5 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${c.badgeBg} ${c.text}`}>
                                      {idx + 1}
                                    </span>
                                    <p className="flex-1 text-sm text-gray-700 leading-relaxed">{q.questionText}</p>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                      <button onClick={() => startEditing(q)} className={`p-1.5 text-gray-400 hover:${c.text} ${c.btnHover} rounded-lg transition-colors`} title="Edit">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button onClick={() => handleDelete(q._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                          <div className={`mt-1 p-4 rounded-xl border ${c.editBg}`}>
                            <p className={`text-xs font-semibold mb-2 ${c.text}`}>
                              Adding to bank — will be question #{count + 1}
                              {count >= cat.studentLimit && (
                                <span className="ml-1.5 text-amber-600 font-normal">(students see {cat.studentLimit} randomly)</span>
                              )}
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
                              <button onClick={() => handleAdd(cat.name)} disabled={saving} className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${c.saveBg}`}>
                                {saving ? "Adding…" : "Add to Bank"}
                              </button>
                              <button onClick={cancelAdding} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Add button — always visible, no cap */}
                        {!isAdding && (
                          <button
                            onClick={() => startAdding(cat.name)}
                            className={`mt-2 flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-dashed transition-colors ${c.btnText} ${c.btnBorder} ${c.btnHover}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Question to Bank
                          </button>
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
  );
}
