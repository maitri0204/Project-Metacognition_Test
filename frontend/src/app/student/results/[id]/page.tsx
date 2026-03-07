"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import type { TestResult } from "@/types";

// ─── Quadrant config ──────────────────────────────────────────────────────────

const QUADRANT_CONFIG = {
  I:   { label: "Expert Learner",                  color: "#10b981", bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", fill: "#d1fae5", desc: "High metacognitive knowledge and strong self-regulation skills." },
  II:  { label: "Reflective but Unstructured",     color: "#f59e0b", bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-700",   fill: "#fef3c7", desc: "Strong regulation skills but limited metacognitive knowledge." },
  III: { label: "Unaware Learner",                 color: "#ef4444", bg: "bg-red-50",      border: "border-red-200",     text: "text-red-700",     fill: "#fee2e2", desc: "Limited awareness of both metacognitive knowledge and regulation." },
  IV:  { label: "Strategic but Unaware Learner",   color: "#3b82f6", bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700",    fill: "#dbeafe", desc: "Good metacognitive knowledge but lower self-regulation strategies." },
} as const;

const PART_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Knowledge: { bar: "#3b82f6", text: "text-blue-700",    bg: "bg-blue-50" },
  Regulation:{ bar: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50" },
};

// ─── Radar / spider chart ─────────────────────────────────────────────────────

const RADAR_SHORT: Record<string, string> = {
  "Information Management": "Info Mgmt",
};

function RadarChart({
  categoryScores,
}: {
  categoryScores: Array<{ category: string; percentage: number; part: string }>;
}) {
  const CX = 240, CY = 240, R = 130, LABEL_R = 162;
  const n = categoryScores.length;
  if (n === 0) return null;

  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pos = (i: number, radius: number) => ({
    x: CX + radius * Math.cos(angleFor(i)),
    y: CY + radius * Math.sin(angleFor(i)),
  });

  const gridPath = (pct: number) =>
    categoryScores
      .map((_, i) => {
        const { x, y } = pos(i, (R * pct) / 100);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  const scorePath =
    categoryScores
      .map((cs, i) => {
        const { x, y } = pos(i, (R * cs.percentage) / 100);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full max-w-md mx-auto"
      style={{ fontFamily: "inherit" }}
    >
      {/* Grid polygons */}
      {[25, 50, 75, 100].map((pct) => (
        <path
          key={pct}
          d={gridPath(pct)}
          fill="none"
          stroke={pct === 100 ? "#cbd5e1" : "#e5e7eb"}
          strokeWidth={pct === 100 ? 1.5 : 1}
          strokeDasharray={pct < 100 ? "3,3" : undefined}
        />
      ))}

      {/* % labels along the top axis */}
      {[25, 50, 75].map((pct) => (
        <text
          key={pct}
          x={CX + 5}
          y={CY - (R * pct) / 100 - 3}
          fontSize={12}
          fill="#374151"
          textAnchor="start"
        >
          {pct}%
        </text>
      ))}

      {/* Axis lines */}
      {categoryScores.map((_, i) => {
        const end = pos(i, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        );
      })}

      {/* Score polygon */}
      <path
        d={scorePath}
        fill="rgba(99,102,241,0.18)"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Data points — coloured by part */}
      {categoryScores.map((cs, i) => {
        const { x, y } = pos(i, (R * cs.percentage) / 100);
        const dotColor = cs.part === "Knowledge" ? "#3b82f6" : "#10b981";
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill={dotColor}
            stroke="white"
            strokeWidth={2}
          />
        );
      })}

      {/* Labels */}
      {categoryScores.map((cs, i) => {
        const { x, y } = pos(i, LABEL_R);
        const name = RADAR_SHORT[cs.category] ?? cs.category;
        const textColor = cs.part === "Knowledge" ? "#2563eb" : "#059669";
        const anchor: "start" | "end" | "middle" =
          x > CX + 10 ? "start" : x < CX - 10 ? "end" : "middle";
        const isBottom = y > CY + 20;
        const nameY = isBottom ? y + 4  : y - 8;
        const pctY  = isBottom ? y + 18 : y + 6;
        return (
          <g key={i}>
            <text
              x={x}
              y={nameY}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={13}
              fill={textColor}
              fontWeight="700"
            >
              {name}
            </text>
            <text
              x={x}
              y={pctY}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={12}
              fill="#374151"
            >
              {Math.round(cs.percentage)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Quadrant plot ────────────────────────────────────────────────────────

function QuadrantPlot({ kPct, rPct }: { kPct: number; rPct: number }) {
  // Plot area: 300×300 inside a 400×400 SVG with 50px margins
  const MARGIN = 50;
  const SIZE   = 300;
  const TOTAL  = SIZE + MARGIN * 2; // 400

  const toSvgX = (pct: number) => MARGIN + (pct / 100) * SIZE;
  const toSvgY = (pct: number) => MARGIN + SIZE - (pct / 100) * SIZE; // Y inverted

  const midX = toSvgX(50); // 200
  const midY = toSvgY(50); // 200

  const px = toSvgX(kPct);
  const py = toSvgY(rPct);

  const quadrants = [
    // [x, y, w, h, fill, quadrant]
    { x: midX,  y: MARGIN, w: MARGIN + SIZE - midX,  h: midY - MARGIN,    fill: "#d1fae5", q: "I",   label: "Expert Learner",    lx: midX + (MARGIN + SIZE - midX) / 2,  ly: MARGIN + (midY - MARGIN) / 2 },
    { x: MARGIN, y: MARGIN, w: midX - MARGIN,          h: midY - MARGIN,    fill: "#fef3c7", q: "II",  label: "Reflective\nUnstructured", lx: MARGIN + (midX - MARGIN) / 2,         ly: MARGIN + (midY - MARGIN) / 2 },
    { x: MARGIN, y: midY,  w: midX - MARGIN,          h: MARGIN + SIZE - midY, fill: "#fee2e2", q: "III", label: "Unaware\nLearner",   lx: MARGIN + (midX - MARGIN) / 2,         ly: midY + (MARGIN + SIZE - midY) / 2 },
    { x: midX,  y: midY,  w: MARGIN + SIZE - midX,  h: MARGIN + SIZE - midY, fill: "#dbeafe", q: "IV",  label: "Strategic\nLearner", lx: midX + (MARGIN + SIZE - midX) / 2,  ly: midY + (MARGIN + SIZE - midY) / 2 },
  ];

  return (
    <svg
      viewBox={`0 0 ${TOTAL} ${TOTAL}`}
      className="w-full max-w-xs sm:max-w-sm mx-auto"
      style={{ fontFamily: "inherit" }}
    >
      {/* Quadrant backgrounds */}
      {quadrants.map(({ x, y, w, h, fill, q }) => (
        <rect key={q} x={x} y={y} width={w} height={h} fill={fill} opacity={0.85} />
      ))}

      {/* Quadrant border lines */}
      <line x1={midX} y1={MARGIN} x2={midX} y2={MARGIN + SIZE} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5,4" />
      <line x1={MARGIN} y1={midY} x2={MARGIN + SIZE} y2={midY} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5,4" />

      {/* Plot border */}
      <rect x={MARGIN} y={MARGIN} width={SIZE} height={SIZE} fill="none" stroke="#cbd5e1" strokeWidth={1.5} rx={2} />

      {/* Quadrant labels */}
      {quadrants.map(({ q, label, lx, ly }) => (
        <text key={q} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#374151" fontWeight="600" opacity={0.7}>
          {label.split("\n").map((line, i) => (
            <tspan key={i} x={lx} dy={i === 0 ? (label.includes("\n") ? "-0.6em" : "0") : "1.4em"}>
              {line}
            </tspan>
          ))}
        </text>
      ))}

      {/* Axis tick labels */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <text x={toSvgX(v)} y={MARGIN + SIZE + 16} textAnchor="middle" fontSize={12} fill="#374151">{v}</text>
          <text x={MARGIN - 8}  y={toSvgY(v)}         textAnchor="end"    fontSize={12} fill="#374151" dominantBaseline="middle">{v}</text>
          <line x1={toSvgX(v)} y1={MARGIN + SIZE}     x2={toSvgX(v)} y2={MARGIN + SIZE + 4}     stroke="#94a3b8" strokeWidth={1} />
          <line x1={MARGIN}    y1={toSvgY(v)}         x2={MARGIN - 4}    y2={toSvgY(v)}          stroke="#94a3b8" strokeWidth={1} />
        </g>
      ))}

      {/* Axis labels */}
      <text x={MARGIN + SIZE / 2} y={TOTAL - 4} textAnchor="middle" fontSize={13} fill="#374151" fontWeight="700">
        Knowledge %
      </text>
      <text
        x={14}
        y={MARGIN + SIZE / 2}
        textAnchor="middle"
        fontSize={13}
        fill="#374151"
        fontWeight="700"
        transform={`rotate(-90, 14, ${MARGIN + SIZE / 2})`}
      >
        Regulation %
      </text>

      {/* Student point glow */}
      <circle cx={px} cy={py} r={12} fill="#7c3aed" opacity={0.15} />
      <circle cx={px} cy={py} r={8}  fill="#7c3aed" opacity={0.3} />

      {/* Student point */}
      <circle cx={px} cy={py} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2} />

      {/* Coordinate label */}
      <rect
        x={px + 10} y={py - 20}
        width={72} height={22}
        rx={4} fill="white" stroke="#e2e8f0" strokeWidth={1}
        opacity={px > TOTAL - 90 ? 0 : 1}
      />
      <text
        x={px + 46} y={py - 5}
        textAnchor="middle" fontSize={12} fill="#374151" fontWeight="600"
        opacity={px > TOTAL - 90 ? 0 : 1}
      >
        K:{Math.round(kPct)}% R:{Math.round(rPct)}%
      </text>
      {/* Fallback label on left */}
      <rect
        x={px - 82} y={py - 20}
        width={72} height={22}
        rx={4} fill="white" stroke="#e2e8f0" strokeWidth={1}
        opacity={px > TOTAL - 90 ? 1 : 0}
      />
      <text
        x={px - 46} y={py - 5}
        textAnchor="middle" fontSize={12} fill="#374151" fontWeight="600"
        opacity={px > TOTAL - 90 ? 1 : 0}
      >
        K:{Math.round(kPct)}% R:{Math.round(rPct)}%
      </text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [result,  setResult]  = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await testAPI.getResult(id);
        setResult(res.data.result);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load result");
        router.push("/student/results");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="spinner" />
        <p className="text-sm text-gray-500">Loading results…</p>
      </div>
    );
  }

  if (!result) return null;

  const qConfig   = QUADRANT_CONFIG[result.quadrant as keyof typeof QUADRANT_CONFIG];
  const kPct      = Math.round(result.knowledgePercentage);
  const rPct      = Math.round(result.regulationPercentage);
  const totalPct  = Math.round((result.totalScore / result.totalMaxScore) * 100);
  const date      = new Date(result.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
          <p className="text-gray-500 mt-1 text-sm">Attempt #{result.attemptNumber} · {date}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/student/results"
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            All Results
          </Link>
          <Link
            href="/student/test"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Take Again
          </Link>
        </div>
      </div>

      {/* ── Score summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Score",    value: `${result.totalScore}/${result.totalMaxScore}`,         sub: `${totalPct}%`,  bg: "bg-gray-900",    text: "text-white" },
          { label: "Knowledge",      value: `${result.knowledgeScore}/${result.knowledgeMaxScore}`, sub: `${kPct}%`,      bg: "bg-blue-600",    text: "text-white" },
          { label: "Regulation",     value: `${result.regulationScore}/${result.regulationMaxScore}`, sub: `${rPct}%`,   bg: "bg-emerald-600", text: "text-white" },
          { label: "Quadrant",       value: `Q${result.quadrant}`,                                  sub: qConfig.label, bg: qConfig.bg,       text: qConfig.text, border: qConfig.border },
        ].map(({ label, value, sub, bg, text, border }) => (
          <div key={label} className={`rounded-2xl p-5 ${bg} ${border ? `border ${border}` : ""}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${text} opacity-70`}>{label}</p>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${text} opacity-70`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quadrant result banner ───────────────────────────────────────────── */}
      <div className={`rounded-2xl border ${qConfig.border} ${qConfig.bg} p-5 mb-6 flex items-start gap-4`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: qConfig.color + "22" }}>
          <span className="text-2xl font-black" style={{ color: qConfig.color }}>Q{result.quadrant}</span>
        </div>
        <div>
          <p className={`text-base font-bold ${qConfig.text}`}>{qConfig.label}</p>
          <p className="text-sm text-gray-600 mt-0.5">{qConfig.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ── Category scores bar chart ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {result.categoryScores.map((cs) => {
              const pct    = Math.round(cs.percentage);
              const colors = PART_COLORS[cs.part] || PART_COLORS.Knowledge;
              return (
                <div key={cs.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-bold uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {cs.part === "Knowledge" ? "K" : "R"}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{cs.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {cs.score}/{cs.maxScore}
                      <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: colors.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Quadrant scatter plot ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-1">Metacognition Profile</h2>
          <p className="text-xs text-gray-400 mb-4">
            Your position on the knowledge–regulation axes
          </p>
          <QuadrantPlot kPct={kPct} rPct={rPct} />

          {/* Quadrant legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(Object.entries(QUADRANT_CONFIG) as [string, typeof QUADRANT_CONFIG[keyof typeof QUADRANT_CONFIG]][]).map(([q, cfg]) => (
              <div
                key={q}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${
                  result.quadrant === q ? `${cfg.border} border-2 ${cfg.bg}` : "bg-gray-50"
                }`}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <div>
                  <p className={`text-[13px] font-bold ${result.quadrant === q ? cfg.text : "text-gray-500"}`}>Q{q}</p>
                  <p className={`text-[12px] leading-tight ${result.quadrant === q ? cfg.text : "text-gray-400"}`}>{cfg.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Knowledge vs Regulation summary ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Skill Radar</h2>
        <p className="text-xs text-gray-400 mb-2">
          Visual comparison across all 8 metacognition dimensions
        </p>
        <RadarChart categoryScores={result.categoryScores} />
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">Knowledge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500">Regulation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-[2.5px] rounded bg-indigo-500" />
            <span className="text-xs text-gray-500">Score</span>
          </div>
        </div>
      </div>

      {/* ── Part summary ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Part Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Part I: Knowledge",  score: result.knowledgeScore,  max: result.knowledgeMaxScore,  pct: kPct, color: "#3b82f6", lightColor: "#dbeafe", categories: ["Declarative", "Procedural", "Conditional"] },
            { label: "Part II: Regulation", score: result.regulationScore, max: result.regulationMaxScore, pct: rPct, color: "#10b981", lightColor: "#d1fae5", categories: ["Planning", "Information Management", "Monitoring", "Debugging", "Evaluation"] },
          ].map(({ label, score, max, pct, color, lightColor, categories }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: lightColor }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                {label}
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                <span className="text-sm text-gray-500 mb-1">/ {max} pts</span>
                <span className="ml-auto text-lg font-bold" style={{ color }}>{pct}%</span>
              </div>
              <div className="bg-white bg-opacity-60 rounded-full h-2 mb-3">
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <p className="text-xs text-gray-500">
                Categories: {categories.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer actions ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/student/dashboard"
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/student/test"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          Take Test Again
        </Link>
      </div>
    </div>
  );
}
