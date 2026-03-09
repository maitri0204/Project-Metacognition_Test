"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import { TestResult, User } from "@/types";

const DOMAIN_INFO: Record<number, { name: string; color: string }> = {
  1: { name: "Awareness",  color: "#3b82f6" },
  2: { name: "Planning",   color: "#8b5cf6" },
  3: { name: "Monitoring", color: "#10b981" },
  4: { name: "Regulation", color: "#f97316" },
  5: { name: "Reflection", color: "#ec4899" },
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { /* noop */ }
    }

    testAPI
      .getMyResults()
      .then((res) => setResults(res.data.results || []))
      .catch(() => toast.error("Failed to load your results"))
      .finally(() => setLoading(false));
  }, []);

  const latestResult: TestResult | null = results[0] ?? null;

  const latestKPct = latestResult ? Math.round((latestResult.domainScores.domain1 / 50) * 100) : 0;
  const latestRPct = latestResult
    ? Math.round(((latestResult.domainScores.domain2 + latestResult.domainScores.domain3 + latestResult.domainScores.domain4 + latestResult.domainScores.domain5) / 150) * 100)
    : 0;

  const quadrantLabel =
    !latestResult
      ? null
      : latestKPct >= 50 && latestRPct >= 50
      ? { label: "Expert Learner", color: "text-green-700 bg-green-50" }
      : latestKPct < 50 && latestRPct >= 50
      ? { label: "Reflective but Unstructured Learner", color: "text-blue-700 bg-blue-50" }
      : latestKPct < 50 && latestRPct < 50
      ? { label: "Unaware Learner", color: "text-red-700 bg-red-50" }
      : { label: "Strategic Learner", color: "text-yellow-700 bg-yellow-50" };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName ?? "Student"}! 👋
        </h1>
        <p className="mt-1 text-blue-100">
          {results.length === 0
            ? "You haven't taken the metacognition assessment yet."
            : `You've completed ${results.length} test${results.length > 1 ? "s" : ""} so far.`}
        </p>
        <button
          onClick={() => router.push("/student/test")}
          className="mt-4 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-sm"
        >
          {results.length === 0 ? "Take Test Now →" : "Take Test Again →"}
        </button>
      </div>

      {/* Latest result snapshot */}
      {latestResult && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Latest Result</h2>
            <Link
              href={`/student/results/${latestResult._id}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{latestResult.totalScore}</p>
              <p className="text-xs text-gray-500 mt-1">Total Score</p>
              <p className="text-xs text-gray-400">out of 200</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-700">{latestKPct}%</p>
              <p className="text-xs text-blue-600 mt-1">Knowledge</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-700">{latestRPct}%</p>
              <p className="text-xs text-purple-600 mt-1">Regulation</p>
            </div>
            {quadrantLabel && (
              <div className={`text-center p-4 rounded-xl ${quadrantLabel.color}`}>
                <p className="text-sm font-bold leading-tight">{quadrantLabel.label}</p>
                <p className="text-xs mt-1 opacity-70">Your Profile</p>
              </div>
            )}
          </div>

          {/* Domain bar mini chart */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((dn) => {
              const score = latestResult.domainScores[`domain${dn}` as keyof typeof latestResult.domainScores];
              const maxScores: Record<number, number> = { 1: 50, 2: 50, 3: 50, 4: 40, 5: 10 };
              const pct = Math.round((score / maxScores[dn]) * 100);
              return (
                <div key={dn} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">
                    D{dn}: {DOMAIN_INFO[dn].name}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: DOMAIN_INFO[dn].color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No tests taken yet */}
      {!loading && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Start Your Assessment</h3>
          <p className="text-gray-500 text-sm mb-4">
            Take the 40-question metacognition assessment to discover your learning profile.
          </p>
          <button
            onClick={() => router.push("/student/test")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Take Test Now
          </button>
        </div>
      )}

      {/* Past results list */}
      {results.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Past Results</h2>
            <Link href="/student/results" className="text-sm text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {results.slice(1, 4).map((result, idx) => (
              <Link
                key={result._id}
                href={`/student/results/${result._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-xs">
                    #{results.length - 1 - idx}
                  </div>
                  <p className="text-sm text-gray-700">
                    {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900">{result.totalScore}/200</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
