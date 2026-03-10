"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminTestAPI, adminParentTestAPI } from "@/lib/api";
import { TestResult, ParentTestResult, User } from "@/types";

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [studentTests, setStudentTests] = useState<TestResult[]>([]);
  const [parentTests, setParentTests] = useState<ParentTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"student" | "parent">("student");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      adminTestAPI.getStudentResults(id),
      adminParentTestAPI.getStudentParentResults(id),
    ])
      .then(([sRes, pRes]) => {
        setStudentTests(sRes.data.results || []);
        setParentTests(pRes.data.results || []);
      })
      .catch(() => toast.error("Failed to load student data"))
      .finally(() => setLoading(false));
  }, [id]);

  const student: User | null =
    studentTests.length > 0
      ? (studentTests[0].student as User)
      : parentTests.length > 0
      ? (parentTests[0].student as User)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Student Info */}
      {student && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.middleName ? `${student.middleName} ` : ""}{student.lastName}
          </h1>
          <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {student.email}
            </span>
            {student.mobile && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {student.mobile}
              </span>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
              {studentTests.length} Student Test{studentTests.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
              </svg>
              {parentTests.length} Parent Test{parentTests.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Tabs: Student Tests / Parent Tests */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex-1 px-6 py-3.5 text-sm font-semibold transition relative ${
                activeTab === "student" ? "text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {activeTab === "student" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-t-full" />
              )}
              Student Test Records ({studentTests.length})
            </button>
            <button
              onClick={() => setActiveTab("parent")}
              className={`flex-1 px-6 py-3.5 text-sm font-semibold transition relative ${
                activeTab === "parent" ? "text-purple-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {activeTab === "parent" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-purple-600 rounded-t-full" />
              )}
              Parent Test Records ({parentTests.length})
            </button>
          </nav>
        </div>

        {/* Student Tests tab */}
        {activeTab === "student" && (
          <div className="p-6">
            {studentTests.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No student test submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {studentTests.map((result, idx) => {
                  const ds = result.domainScores;
                  const kPct = Math.round((ds.domain1 / 50) * 100);
                  const rPct = Math.round(((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / 150) * 100);

                  const profile =
                    kPct >= 50 && rPct >= 50
                      ? { label: "Expert Learner", color: "bg-green-100 text-green-700 border-green-200" }
                      : kPct < 50 && rPct >= 50
                      ? { label: "Reflective", color: "bg-blue-100 text-blue-700 border-blue-200" }
                      : kPct < 50 && rPct < 50
                      ? { label: "Unaware", color: "bg-red-100 text-red-700 border-red-200" }
                      : { label: "Strategic", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };

                  return (
                    <div key={result._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Test #{studentTests.length - idx}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(result.submittedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/admin/results/${result._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          View Score
                        </Link>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{result.totalScore}</p>
                          <p className="text-xs text-gray-400">Score /200</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-700">{kPct}%</p>
                          <p className="text-xs text-blue-500">Knowledge</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <p className="text-lg font-bold text-purple-700">{rPct}%</p>
                          <p className="text-xs text-purple-500">Regulation</p>
                        </div>
                        <div className={`text-center p-2 rounded-lg border ${profile.color}`}>
                          <p className="text-sm font-bold">{profile.label}</p>
                          <p className="text-xs opacity-60">Quadrant</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Parent Tests tab */}
        {activeTab === "parent" && (
          <div className="p-6">
            {parentTests.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No parent test submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {parentTests.map((result, idx) => {
                  const ds = result.domainScores;
                  const kPct = Math.round((ds.domain1 / 50) * 100);
                  const rPct = Math.round(((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / 150) * 100);
                  const p = result.parentInfo;

                  const profile =
                    kPct >= 50 && rPct >= 50
                      ? { label: "Expert Learner", color: "bg-green-100 text-green-700 border-green-200" }
                      : kPct < 50 && rPct >= 50
                      ? { label: "Reflective", color: "bg-blue-100 text-blue-700 border-blue-200" }
                      : kPct < 50 && rPct < 50
                      ? { label: "Unaware", color: "bg-red-100 text-red-700 border-red-200" }
                      : { label: "Strategic", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };

                  return (
                    <div key={result._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.firstName} {p.middleName ? `${p.middleName} ` : ""}{p.lastName}
                            <span className="ml-2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              {p.relation}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {p.email} · {p.mobile}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(result.submittedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/admin/parent-results/${result._id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                        >
                          View Score
                        </Link>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{result.totalScore}</p>
                          <p className="text-xs text-gray-400">Score /200</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-700">{kPct}%</p>
                          <p className="text-xs text-blue-500">Knowledge</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <p className="text-lg font-bold text-purple-700">{rPct}%</p>
                          <p className="text-xs text-purple-500">Regulation</p>
                        </div>
                        <div className={`text-center p-2 rounded-lg border ${profile.color}`}>
                          <p className="text-sm font-bold">{profile.label}</p>
                          <p className="text-xs opacity-60">Quadrant</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
