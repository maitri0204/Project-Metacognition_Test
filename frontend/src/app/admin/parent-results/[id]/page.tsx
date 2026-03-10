"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminParentTestAPI } from "@/lib/api";
import { ParentTestResult, Question, Answer, User } from "@/types";

const SECTION_INFO: Record<
  number,
  { name: string; shortName: string; color: string; maxScore: number }
> = {
  1: { name: "Awareness",  shortName: "Awareness",  color: "#3b82f6", maxScore: 50 },
  2: { name: "Planning",   shortName: "Planning",   color: "#8b5cf6", maxScore: 50 },
  3: { name: "Monitoring", shortName: "Monitoring", color: "#10b981", maxScore: 50 },
  4: { name: "Regulation", shortName: "Regulation", color: "#f97316", maxScore: 40 },
  5: { name: "Reflection", shortName: "Reflection", color: "#ec4899", maxScore: 10 },
};

function QuadrantGraph({ knowledgePct, regulationPct }: { knowledgePct: number; regulationPct: number }) {
  const PAD_L = 72, PAD_B = 64, PAD_R = 24, PAD_T = 24;
  const W = 480, H = 480;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const toSvgX = (pct: number) => PAD_L + (pct / 100) * plotW;
  const toSvgY = (pct: number) => PAD_T + plotH - (pct / 100) * plotH;
  const midX = toSvgX(50), midY = toSvgY(50);
  const px = toSvgX(knowledgePct), py = toSvgY(regulationPct);
  const kp = knowledgePct, rp = regulationPct;

  let hlColor: string, quadrantLabel: string;
  if (kp >= 50 && rp >= 50) { hlColor = "rgba(34,197,94,0.25)"; quadrantLabel = "Expert Learner"; }
  else if (kp < 50 && rp >= 50) { hlColor = "rgba(59,130,246,0.25)"; quadrantLabel = "Reflective but Unstructured Learner"; }
  else if (kp < 50 && rp < 50) { hlColor = "rgba(239,68,68,0.25)"; quadrantLabel = "Unaware Learner"; }
  else { hlColor = "rgba(234,179,8,0.25)"; quadrantLabel = "Strategic Learner"; }

  const hlX = PAD_L;
  const hlY = py;
  const hlW = px - PAD_L;
  const hlH = (PAD_T + plotH) - py;
  const hlBorder = hlColor.replace("0.25", "0.6");
  const qLabels = [
    { x: PAD_L + plotW * 0.75, y: PAD_T + plotH * 0.15, text: "Expert Learner", color: "#16a34a" },
    { x: PAD_L + plotW * 0.25, y: PAD_T + plotH * 0.15, text: "Reflective", color: "#2563eb" },
    { x: PAD_L + plotW * 0.25, y: PAD_T + plotH * 0.88, text: "Unaware", color: "#dc2626" },
    { x: PAD_L + plotW * 0.75, y: PAD_T + plotH * 0.88, text: "Strategic", color: "#ca8a04" },
  ];
  const gridPcts = [25, 50, 75];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md">
        <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} fill="#f9fafb" rx={4} />
        {gridPcts.map((pct) => (<g key={pct}><line x1={toSvgX(pct)} y1={PAD_T} x2={toSvgX(pct)} y2={PAD_T+plotH} stroke="#e5e7eb" strokeWidth={pct===50?1.5:1} strokeDasharray={pct===50?"0":"4,3"}/><line x1={PAD_L} y1={toSvgY(pct)} x2={PAD_L+plotW} y2={toSvgY(pct)} stroke="#e5e7eb" strokeWidth={pct===50?1.5:1} strokeDasharray={pct===50?"0":"4,3"}/></g>))}
        {hlW > 0 && hlH > 0 && (<><rect x={hlX} y={hlY} width={hlW} height={hlH} fill={hlColor} rx={2}/><rect x={hlX} y={hlY} width={hlW} height={hlH} fill="none" stroke={hlBorder} strokeWidth={1.5} rx={2}/></>)}
        {qLabels.map((ql, i) => (<text key={i} x={ql.x} y={ql.y} fill={ql.color} fontSize={12} fontWeight={600} textAnchor="middle" opacity={0.6}>{ql.text}</text>))}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T+plotH} stroke="#6b7280" strokeWidth={2}/><line x1={PAD_L} y1={PAD_T+plotH} x2={PAD_L+plotW} y2={PAD_T+plotH} stroke="#6b7280" strokeWidth={2}/>
        {[0,25,50,75,100].map((pct)=>(<g key={pct}><text x={toSvgX(pct)} y={PAD_T+plotH+18} fill="#6b7280" fontSize={11} textAnchor="middle">{pct}</text><text x={PAD_L-10} y={toSvgY(pct)+4} fill="#6b7280" fontSize={11} textAnchor="end">{pct}</text></g>))}
        <text x={PAD_L+plotW/2} y={H-6} fill="#374151" fontSize={13} fontWeight={700} textAnchor="middle">Knowledge (Awareness) %</text>
        <text x={14} y={PAD_T+plotH/2} fill="#374151" fontSize={13} fontWeight={700} textAnchor="middle" transform={`rotate(-90, 14, ${PAD_T+plotH/2})`}>Regulation (Planning + Monitoring + Regulation + Reflection) %</text>
        <circle cx={px} cy={py} r={8} fill="white" stroke="#7c3aed" strokeWidth={3}/><circle cx={px} cy={py} r={4} fill="#7c3aed"/>
        <rect x={px-42} y={py-36} width={84} height={24} fill="#6d28d9" rx={6}/><text x={px} y={py-20} fill="white" fontSize={11} fontWeight={700} textAnchor="middle">({Math.round(kp)}%, {Math.round(rp)}%)</text>
      </svg>
      <p className="mt-2 text-sm font-semibold text-gray-700">Quadrant: <span className={kp>=50&&rp>=50?"text-green-700":kp<50&&rp>=50?"text-blue-700":kp<50&&rp<50?"text-red-700":"text-yellow-700"}>{quadrantLabel}</span></p>
    </div>
  );
}

export default function AdminParentResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ParentTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAnswerTab, setActiveAnswerTab] = useState<number>(1);

  useEffect(() => {
    if (!id) return;
    adminParentTestAPI
      .getResult(id)
      .then((res) => setResult(res.data.result))
      .catch(() => toast.error("Failed to load result"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Result not found.</p>
        <button onClick={() => router.push("/admin/dashboard")} className="mt-4 text-purple-600 underline">Back to Dashboard</button>
      </div>
    );
  }

  const ds = result.domainScores;
  const knowledgePct = Math.round((ds.domain1 / 50) * 100);
  const regulationPct = Math.round(((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / 150) * 100);
  const p = result.parentInfo;
  const s = result.student as User;

  const sectionGroups: Record<number, { question: Question; selectedOption: string; score: number }[]> = {};
  result.answers.forEach((a: Answer) => {
    const q = a.questionId as Question;
    if (!q || typeof q !== "object" || !q._id || !q.domainNumber) return;
    if (!sectionGroups[q.domainNumber]) sectionGroups[q.domainNumber] = [];
    sectionGroups[q.domainNumber].push({ question: q, selectedOption: a.selectedOption, score: a.score });
  });
  Object.values(sectionGroups).forEach((arr) => arr.sort((a, b) => a.question.questionNumber - b.question.questionNumber));

  const sectionScoreArr = [
    { num: 1, score: ds.domain1, max: SECTION_INFO[1].maxScore },
    { num: 2, score: ds.domain2, max: SECTION_INFO[2].maxScore },
    { num: 3, score: ds.domain3, max: SECTION_INFO[3].maxScore },
    { num: 4, score: ds.domain4, max: SECTION_INFO[4].maxScore },
    { num: 5, score: ds.domain5, max: SECTION_INFO[5].maxScore },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-purple-600 hover:underline text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parent Assessment Result</h1>
            <p className="text-gray-500 mt-1">
              Student: <span className="font-medium text-gray-700">{s?.firstName} {s?.middleName ? `${s.middleName} ` : ""}{s?.lastName}</span>
              {" "}({s?.email})
            </p>
            <p className="text-gray-500 text-sm">
              Submitted on{" "}
              {new Date(result.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}{" "}
              at {new Date(result.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-purple-600">{result.totalScore}</p>
            <p className="text-sm text-gray-500">out of 200</p>
          </div>
        </div>
      </div>

      {/* Parent Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Parent / Guardian Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</p><p className="text-sm font-medium text-gray-900 mt-0.5">{p.firstName} {p.middleName ? `${p.middleName} ` : ""}{p.lastName}</p></div>
          <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Relation</p><p className="text-sm font-medium text-gray-900 mt-0.5">{p.relation}</p></div>
          <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p><p className="text-sm font-medium text-gray-900 mt-0.5">{p.email}</p></div>
          <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mobile</p><p className="text-sm font-medium text-gray-900 mt-0.5">{p.mobile}</p></div>
        </div>
      </div>

      {/* Section Scores */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Section Scores</h2>
        <div className="space-y-4">
          {sectionScoreArr.map(({ num, score, max }) => {
            const info = SECTION_INFO[num];
            const pct = Math.round((score / max) * 100);
            return (
              <div key={num}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">Section {num}: {info.name}</span>
                  <span className="text-sm font-bold text-gray-900">{score}/{max} ({pct}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quadrant */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Metacognition Quadrant Analysis</h2>
        <p className="text-sm text-gray-500 mb-6">X-axis: Knowledge (Section 1) | Y-axis: Regulation (Sections 2-5)</p>
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <QuadrantGraph knowledgePct={knowledgePct} regulationPct={regulationPct} />
          <div className="space-y-3">
            {[
              { label: "Expert Learner", desc: "High Knowledge + High Regulation", color: "bg-green-100 border-green-300 text-green-800" },
              { label: "Reflective but Unstructured Learner", desc: "Low Knowledge + High Regulation", color: "bg-blue-100 border-blue-300 text-blue-800" },
              { label: "Strategic Learner", desc: "High Knowledge + Low Regulation", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
              { label: "Unaware Learner", desc: "Low Knowledge + Low Regulation", color: "bg-red-100 border-red-300 text-red-800" },
            ].map((q) => (
              <div key={q.label} className={`rounded-xl border px-4 py-3 ${q.color}`}><p className="font-semibold text-sm">{q.label}</p><p className="text-xs opacity-80 mt-0.5">{q.desc}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Section-wise Q&A */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-0"><h2 className="text-lg font-bold text-gray-900 mb-4">Answers - Section Wise</h2></div>
        {Object.keys(sectionGroups).length === 0 ? (
          <p className="text-gray-500 text-sm p-6">Answer details are not available.</p>
        ) : (
          <>
            <div className="border-b border-gray-200 bg-white">
              <nav className="flex overflow-x-auto">
                {[1,2,3,4,5].map((sn) => {
                  const info = SECTION_INFO[sn];
                  const isActive = activeAnswerTab === sn;
                  return (
                    <button key={sn} onClick={() => setActiveAnswerTab(sn)}
                      className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${isActive?"text-gray-900":"text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                      {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full" style={{ backgroundColor: info.color }}/>}
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: isActive ? info.color : info.color+"99" }}>S{sn}</span>
                      <span className={isActive?"font-semibold":""}>{info.shortName}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            {(() => {
              const sn = activeAnswerTab;
              const info = SECTION_INFO[sn];
              const items = sectionGroups[sn];
              const sectionScore = ds[`domain${sn}` as keyof typeof ds];
              const sPct = Math.round((sectionScore / info.maxScore) * 100);
              if (!items || items.length === 0) return <div className="p-6"><p className="text-gray-400 text-sm text-center py-8">No answers for this section.</p></div>;
              return (
                <div className="p-6">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-xl mb-6" style={{ backgroundColor: info.color+"15", border: `2px solid ${info.color}30` }}>
                    <div className="flex-1"><p className="font-bold text-gray-900">Section {sn}: {info.name}</p></div>
                    <div className="text-right"><p className="font-bold" style={{ color: info.color }}>{sectionScore}/{info.maxScore}</p><p className="text-xs text-gray-500">{sPct}%</p></div>
                  </div>
                  <div className="space-y-4">
                    {items.map(({ question: q, selectedOption }) => (
                      <div key={q._id} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                        <p className="font-medium text-gray-900 mb-3"><span className="font-bold mr-1" style={{ color: info.color }}>Q{q.questionNumber}.</span>{q.questionText}</p>
                        <div className="flex flex-wrap gap-2">
                          {(q.options || []).map((opt) => {
                            const isSelected = opt.label === selectedOption;
                            return (
                              <div key={opt.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${isSelected?"border-purple-600 bg-purple-600 text-white":"border-gray-200 bg-white text-gray-400"}`}>
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isSelected?"border-white bg-white text-purple-600":"border-gray-300 text-gray-400"}`}>{opt.label}</span>
                                {opt.text}
                                {isSelected && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
