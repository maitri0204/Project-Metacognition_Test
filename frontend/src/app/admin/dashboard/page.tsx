"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { questionAPI } from "@/lib/api";

export default function AdminDashboard() {
  const [totalQ, setTotalQ] = useState<number | null>(null);
  const [knowledgeQ, setKnowledgeQ] = useState(0);
  const [regulationQ, setRegulationQ] = useState(0);

  useEffect(() => {
    questionAPI
      .getAll()
      .then((res) => {
        const qs = res.data.questions || [];
        setTotalQ(qs.length);
        setKnowledgeQ(qs.filter((q: { part: string }) => q.part === "Knowledge").length);
        setRegulationQ(qs.filter((q: { part: string }) => q.part === "Regulation").length);
      })
      .catch(() => setTotalQ(0));
  }, []);

  const isReady = totalQ === 52;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Metacognition Test admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Questions Added */}
        <div className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 ${isReady ? "border-emerald-200" : "border-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions Added</p>
              <p className={`text-3xl font-bold mt-1 ${isReady ? "text-emerald-600" : "text-gray-900"}`}>
                {totalQ === null ? "…" : `${totalQ}/52`}
              </p>
              {totalQ !== null && (
                <div className="mt-2 bg-gray-100 rounded-full h-1.5 w-28">
                  <div
                    className={`h-1.5 rounded-full transition-all ${isReady ? "bg-emerald-500" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(((totalQ ?? 0) / 52) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isReady ? "bg-emerald-100" : "bg-amber-100"}`}>
              <svg className={`w-6 h-6 ${isReady ? "text-emerald-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Knowledge */}
        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Knowledge Qs</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{knowledgeQ}/17</p>
              <div className="mt-2 bg-blue-100 rounded-full h-1.5 w-28">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(knowledgeQ / 17) * 100}%` }} />
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Regulation */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regulation Qs</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{regulationQ}/35</p>
              <div className="mt-2 bg-emerald-100 rounded-full h-1.5 w-28">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${(regulationQ / 35) * 100}%` }} />
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isReady ? "All 52 questions are set up!" : `Set up the 52 assessment questions`}
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                {isReady
                  ? "The metacognition test is ready for students. Knowledge: 17 qs (85 pts) · Regulation: 35 qs (175 pts)"
                  : `${52 - (totalQ ?? 0)} question${52 - (totalQ ?? 0) !== 1 ? "s" : ""} remaining across Knowledge and Regulation parts.`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/questions"
            className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isReady ? "Manage Questions" : "Add Questions"}
          </Link>
        </div>
      </div>
    </div>
  );
}
