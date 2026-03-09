"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { questionAPI } from "@/lib/api";
import { Question } from "@/types";

// ── Domain metadata ─────────────────────────────────────────
const DOMAINS = [
  { num: 1, name: "Awareness",  color: "#3b82f6" },
  { num: 2, name: "Planning",   color: "#8b5cf6" },
  { num: 3, name: "Monitoring", color: "#10b981" },
  { num: 4, name: "Regulation", color: "#f97316" },
  { num: 5, name: "Reflection", color: "#ec4899" },
] as const;

type DomainNum = 1 | 2 | 3 | 4 | 5;

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<DomainNum>(1);

  // Edit state
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editText, setEditText]         = useState("");
  const [saving, setSaving]             = useState(false);

  // Add state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addParamNum, setAddParamNum]   = useState<number | "">("");
  const [addText, setAddText]           = useState("");
  const [adding, setAdding]             = useState(false);

  const fetchQuestions = () => {
    setLoading(true);
    questionAPI
      .getAll()
      .then((res) => setQuestions(res.data.questions || []))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, []);

  // ── Derive data for the active tab ──────────────────────────
  const activeDomain    = DOMAINS.find((d) => d.num === activeTab)!;
  const domainQuestions = questions.filter((q) => q.domainNumber === activeTab);

  // Group by parameter (sorted by parameterNumber)
  const paramMap: Record<number, { name: string; questions: Question[] }> = {};
  domainQuestions.forEach((q) => {
    if (!paramMap[q.parameterNumber])
      paramMap[q.parameterNumber] = { name: q.parameter, questions: [] };
    paramMap[q.parameterNumber].questions.push(q);
  });
  const paramList = Object.entries(paramMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, val]) => ({ num: Number(num), ...val }));

  // ── Edit handlers ────────────────────────────────────────────
  const handleEditOpen = (q: Question) => {
    setEditQuestion(q);
    setEditText(q.questionText);
  };

  const handleEditSave = async () => {
    if (!editQuestion) return;
    setSaving(true);
    try {
      await questionAPI.update(editQuestion._id, { questionText: editText });
      toast.success("Question updated");
      setEditQuestion(null);
      fetchQuestions();
    } catch {
      toast.error("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    try {
      await questionAPI.remove(id);
      toast.success("Question deleted");
      fetchQuestions();
    } catch {
      toast.error("Failed to delete question");
    }
  };

  // ── Add handler ──────────────────────────────────────────────
  const openAddModal = () => {
    setAddText("");
    setAddParamNum(paramList.length > 0 ? paramList[0].num : "");
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addText.trim() || addParamNum === "") {
      toast.error("Please fill in all fields");
      return;
    }
    const param = paramMap[addParamNum as number];
    if (!param) { toast.error("Invalid parameter"); return; }

    setAdding(true);
    try {
      await questionAPI.add({
        questionText:    addText.trim(),
        domain:          activeDomain.name,
        domainNumber:    activeTab,
        parameter:       param.name,
        parameterNumber: addParamNum as number,
      });
      toast.success("Question added successfully");
      setShowAddModal(false);
      setAddText("");
      setAddParamNum("");
      fetchQuestions();
    } catch {
      toast.error("Failed to add question");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <p className="text-gray-500 mt-1">{questions.length} questions across 5 domains</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">

          {/* TOP: Horizontal Domain Tabs */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <nav className="flex overflow-x-auto">
              {DOMAINS.map((domain) => {
                const count    = questions.filter((q) => q.domainNumber === domain.num).length;
                const isActive = activeTab === domain.num;
                return (
                  <button
                    key={domain.num}
                    onClick={() => setActiveTab(domain.num as DomainNum)}
                    className={`relative flex-1 min-w-[140px] flex flex-col items-center gap-1 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                      isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {/* Bottom active underline */}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full"
                        style={{ backgroundColor: domain.color }}
                      />
                    )}
                    <span className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: isActive ? domain.color : domain.color + "99" }}
                      >
                        D{domain.num}
                      </span>
                      <span className={isActive ? "font-semibold" : ""}>
                        {domain.name.replace("Metacognitive ", "")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* BELOW TABS: Panel header + questions */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{activeDomain.name}</h2>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition hover:opacity-90"
                style={{ backgroundColor: activeDomain.color }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            {/* Questions grouped by parameter */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {paramList.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-16">No questions in this domain yet.</p>
              )}
              {paramList.map((param) => (
                <div key={param.num}>
                  <p
                    className="text-sm font-bold uppercase tracking-widest mb-3 pb-2 border-b"
                    style={{ color: activeDomain.color, borderColor: activeDomain.color + "28" }}
                  >
                    {param.name}
                  </p>
                  <div className="space-y-2">
                    {param.questions.map((q) => (
                      <div
                        key={q._id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition group"
                      >
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold mt-0.5"
                          style={{ backgroundColor: activeDomain.color }}
                        >
                          {q.questionNumber}
                        </span>
                        <p className="flex-1 text-sm text-gray-800 leading-relaxed pt-0.5">{q.questionText}</p>
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEditOpen(q)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Question</h3>
            <p className="text-sm text-gray-500 mb-4">Q{editQuestion.questionNumber} &middot; {editQuestion.parameter}</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Question text…"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditQuestion(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: activeDomain.color }}
              >
                D{activeTab}
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Question</h3>
                <p className="text-sm text-gray-500">{activeDomain.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parameter</label>
                {paramList.length > 0 ? (
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={addParamNum}
                    onChange={(e) => setAddParamNum(Number(e.target.value))}
                  >
                    {paramList.map((p) => (
                      <option key={p.num} value={p.num}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-red-500 italic p-3 bg-red-50 rounded-xl border border-red-200">
                    No existing parameters found in this domain.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Text</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[110px]"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="Enter the question text…"
                />
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">
                Options are auto-set to: <strong>A</strong> = Never &middot; <strong>B</strong> = Rarely &middot; <strong>C</strong> = Sometimes &middot; <strong>D</strong> = Often &middot; <strong>E</strong> = Always
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !addText.trim() || addParamNum === "" || paramList.length === 0}
                className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: activeDomain.color }}
              >
                {adding ? "Adding…" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
