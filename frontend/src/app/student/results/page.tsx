"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import type { TestResult } from "@/types";

const QUADRANT_STYLES = {
  I:   { label: "Expert Learner",               bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  II:  { label: "Reflective but Unstructured",  bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  III: { label: "Unaware Learner",              bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  IV:  { label: "Strategic Learner",            bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
} as const;

export default function MyResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await testAPI.getMyResults();
        setResults(res.data.results || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="spinner" />
        <p className="text-sm text-gray-500">Loading your results…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-500 mt-1">
            {results.length === 0
              ? "No test attempts yet"
              : `${results.length} attempt${results.length > 1 ? "s" : ""} completed`}
          </p>
        </div>
        <Link
          href="/student/test"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Take New Test
        </Link>
      </div>

      {results.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attempts Yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Take the metacognition assessment to discover your learner profile.
          </p>
          <Link
            href="/student/test"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Your First Test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => {
            const qStyle  = QUADRANT_STYLES[r.quadrant as keyof typeof QUADRANT_STYLES];
            const kPct    = Math.round(r.knowledgePercentage);
            const rPct    = Math.round(r.regulationPercentage);
            const totPct  = Math.round((r.totalScore / r.totalMaxScore) * 100);
            const date    = new Date(r.completedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <Link
                key={r._id}
                href={`/student/results/${r._id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Attempt badge */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[13px] text-white/60 leading-none">Attempt</span>
                      <span className="text-white font-bold text-lg leading-none">#{r.attemptNumber}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{date}</p>
                      <div className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full ${qStyle.bg} w-fit`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${qStyle.dot}`} />
                        <span className={`text-[13px] font-semibold ${qStyle.text}`}>
                          Q{r.quadrant} · {qStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[
                      { label: "Total",      pct: totPct, score: `${r.totalScore}/${r.totalMaxScore}`,         color: "#6b7280" },
                      { label: "Knowledge",  pct: kPct,   score: `${r.knowledgeScore}/${r.knowledgeMaxScore}`, color: "#3b82f6" },
                      { label: "Regulation", pct: rPct,   score: `${r.regulationScore}/${r.regulationMaxScore}`, color: "#10b981" },
                    ].map(({ label, pct, score, color }) => (
                      <div key={label}>
                        <div className="flex items-end justify-between mb-1">
                          <span className="text-[13px] font-semibold text-gray-500">{label}</span>
                          <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                        <p className="text-[13px] text-gray-400 mt-0.5">{score}</p>
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
