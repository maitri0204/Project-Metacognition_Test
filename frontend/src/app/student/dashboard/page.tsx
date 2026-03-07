"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { testAPI } from "@/lib/api";
import type { TestResult } from "@/types";

const QUADRANT_STYLES = {
  I:   { label: "Expert Learner",              bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  II:  { label: "Reflective but Unstructured", bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  III: { label: "Unaware Learner",             bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  IV:  { label: "Strategic Learner",           bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
} as const;

export default function StudentDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await testAPI.getMyResults();
        setResults(res.data.results || []);
      } catch {
        // silently ignore
      } finally {
        setLoadingResults(false);
      }
    })();
  }, []);

  const latestResult = results[0] ?? null;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.totalScore / r.totalMaxScore) * 100, 0) / results.length)
    : null;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Metacognition Test</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Test available */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessment</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">1</p>
              <p className="text-xs text-blue-600 font-medium mt-1">52 questions</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Tests */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{loadingResults ? "—" : results.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loadingResults ? "—" : avgScore !== null ? `${avgScore}%` : "—"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Take Test CTA ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Metacognition Assessment</h2>
          <p className="text-blue-100 text-sm mt-1">52 questions · 8 categories · ~15 minutes</p>
        </div>
        <Link
          href="/student/test"
          className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm self-start sm:self-auto flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {results.length > 0 ? "Take Test Again" : "Start Test Now"}
        </Link>
      </div>

      {/* ── Latest result / empty state ───────────────────────────────────────── */}
      {loadingResults ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
          <div className="spinner" />
        </div>
      ) : latestResult ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Latest Result</h2>
            <Link href="/student/results" className="text-sm font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <Link
            href={`/student/results/${latestResult._id}`}
            className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all p-5"
          >
            {(() => {
              const qStyle  = QUADRANT_STYLES[latestResult.quadrant as keyof typeof QUADRANT_STYLES];
              const kPct    = Math.round(latestResult.knowledgePercentage);
              const rPct    = Math.round(latestResult.regulationPercentage);
              const totPct  = Math.round((latestResult.totalScore / latestResult.totalMaxScore) * 100);
              const date    = new Date(latestResult.completedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[13px] text-white/60 leading-none">Attempt</span>
                      <span className="text-white font-bold text-lg leading-none">#{latestResult.attemptNumber}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{date}</p>
                      <div className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full ${qStyle.bg} w-fit`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${qStyle.dot}`} />
                        <span className={`text-[13px] font-semibold ${qStyle.text}`}>Q{latestResult.quadrant} · {qStyle.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[
                      { label: "Total",      pct: totPct, score: `${latestResult.totalScore}/${latestResult.totalMaxScore}`,           color: "#374151" },
                      { label: "Knowledge",  pct: kPct,   score: `${latestResult.knowledgeScore}/${latestResult.knowledgeMaxScore}`,   color: "#3b82f6" },
                      { label: "Regulation", pct: rPct,   score: `${latestResult.regulationScore}/${latestResult.regulationMaxScore}`, color: "#10b981" },
                    ].map(({ label, pct, score, color }) => (
                      <div key={label}>
                        <div className="flex items-end justify-between mb-1">
                          <span className="text-[13px] font-semibold text-gray-500">{label}</span>
                          <span className="text-sm font-bold tabular-nums" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <p className="text-[13px] text-gray-400 mt-0.5">{score}</p>
                      </div>
                    ))}
                  </div>
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })()}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Complete the assessment to see your metacognition profile here.
          </p>
          <Link
            href="/student/test"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Take Your First Test
          </Link>
        </div>
      )}
    </div>
  );
}

