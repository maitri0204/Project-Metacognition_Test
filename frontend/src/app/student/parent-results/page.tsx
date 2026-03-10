"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { parentTestAPI } from "@/lib/api";
import { ParentTestResult, User } from "@/types";

export default function ParentResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ParentTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentTestAPI
      .getMyResults()
      .then((res) => setResults(res.data.results || []))
      .catch(() => toast.error("Failed to load parent results"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Parent Results Yet</h2>
        <p className="text-gray-500 mb-6">No parent/guardian has completed an assessment for you yet.</p>
        <button
          onClick={() => router.push("/student/parent-test")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Start Parent Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Parent Results</h1>
        <p className="text-gray-500 mt-1">{results.length} parent assessment{results.length > 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-4">
        {results.map((result, idx) => {
          const ds = result.domainScores;
          const knowledgePct = Math.round((ds.domain1 / 50) * 100);
          const regulationPct = Math.round(((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / 150) * 100);
          const p = result.parentInfo;

          const quadrant =
            knowledgePct >= 50 && regulationPct >= 50
              ? { label: "Expert Learner", color: "text-green-700 bg-green-50 border-green-200" }
              : knowledgePct < 50 && regulationPct >= 50
              ? { label: "Reflective but Unstructured Learner", color: "text-blue-700 bg-blue-50 border-blue-200" }
              : knowledgePct < 50 && regulationPct < 50
              ? { label: "Unaware Learner", color: "text-red-700 bg-red-50 border-red-200" }
              : { label: "Strategic Learner", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };

          return (
            <div
              key={result._id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm">
                    #{results.length - idx}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {p.firstName} {p.middleName ? `${p.middleName} ` : ""}{p.lastName}
                      <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{p.relation}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(result.submittedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/student/parent-results/${result._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{result.totalScore}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Score</p>
                  <p className="text-xs text-gray-400">out of 200</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{knowledgePct}%</p>
                  <p className="text-xs text-blue-600 mt-0.5">Knowledge</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{regulationPct}%</p>
                  <p className="text-xs text-blue-600 mt-0.5">Regulation</p>
                </div>
                <div className={`text-center p-3 rounded-xl border ${quadrant.color}`}>
                  <p className="text-sm font-bold">{quadrant.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">Quadrant</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
