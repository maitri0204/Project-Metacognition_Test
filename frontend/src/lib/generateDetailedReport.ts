import jsPDF from "jspdf";
import { DomainScores } from "@/types";

interface ReportData {
  studentName: string;
  email: string;
  location?: string;
  submittedAt: string;
  totalScore: number;
  domainScores: DomainScores;
  classGrade?: string;
  schoolName?: string;
  board?: string;
}

// ── Image file naming (v1.2) ──
const IMG_PREFIX = "Report_Thinking & Expression Skills Test1.2_page-";

// Page number → image file suffix
// Pages 2 and 4 are dynamically generated (not in this map)
const PAGE_IMAGE_SUFFIX: Record<number, string> = {
  1: "0001",
  3: "0003",
  5: "0005",
  6: "0006",
  7: "0007",
  8: "0008",
  9: "0009",
  10: "0010",
  11: "00011",
  12: "0012",
  13: "0013",
  14: "0014",
  15: "0015",
  16: "0016",
  17: "0017",
  18: "0018",
  19: "0019",
  20: "0020",
  21: "0021",
  22: "0022",
};

// ── Color constants ──
const PRIMARY_BLUE = [0, 123, 194];
const DARK_BLUE = [0, 72, 132];
const LIGHT_BLUE = [230, 244, 255];
const GRAY_500 = [107, 114, 128];

// ── Quadrant names ──
type QuadrantType = "Self-Regulated Learner" | "Reflective Learner" | "Passive Learner" | "Strategic Learner";

// ── Helpers ──

async function fetchImageAsDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageUrl(pageSuffix: string): string {
  return "/" + encodeURIComponent(`${IMG_PREFIX}${pageSuffix}.jpg`);
}

/** Adds border, top accent bar, and footer bar to a dynamic page */
function addPageChrome(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(0, 123, 194);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setFillColor(0, 123, 194);
  doc.rect(10, 10, w - 20, 3, "F");
  doc.setFillColor(0, 123, 194);
  doc.rect(10, h - 22, w - 20, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("https://test.admitra.io", w / 2, h - 14, { align: "center" });
}

// ────────────────────────────────────────────
//  PAGE 2 — Student Information (Dynamic)
// ────────────────────────────────────────────
function addStudentInfoPage(doc: jsPDF, data: ReportData) {
  doc.addPage();
  addPageChrome(doc);

  const w = doc.internal.pageSize.getWidth();
  let y = 45;

  doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", w / 2, y, { align: "center" });
  y += 6;

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.8);
  doc.line(w / 2 - 35, y, w / 2 + 35, y);
  y += 20;

  const infoFields = [
    { label: "Student Name", value: data.studentName },
    { label: "Class / Grade", value: data.classGrade || "—" },
    { label: "School Name", value: data.schoolName || "—" },
    { label: "Date of Assessment", value: data.submittedAt },
    { label: "Counselor Name", value: "Administered by ADMITra" },
  ];

  const boxX = 30;
  const boxW = w - 60;
  const rowH = 22;
  const totalH = infoFields.length * rowH;

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, totalH, 3, 3, "S");

  infoFields.forEach((field, i) => {
    const rowY = y + i * rowH;

    if (i % 2 === 0) {
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(boxX + 0.5, rowY + (i === 0 ? 0.5 : 0), boxW - 1, rowH - (i === 0 ? 0.5 : 0), "F");
    }

    if (i < infoFields.length - 1) {
      doc.setDrawColor(200, 215, 235);
      doc.setLineWidth(0.2);
      doc.line(boxX, rowY + rowH, boxX + boxW, rowY + rowH);
    }

    doc.setTextColor(GRAY_500[0], GRAY_500[1], GRAY_500[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(field.label, boxX + 10, rowY + 9);

    doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(field.value, boxX + 10, rowY + 17);
  });

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, totalH, 3, 3, "S");
}

// ────────────────────────────────────────────
//  Determine quadrant from domain scores
// ────────────────────────────────────────────
function getQuadrant(ds: DomainScores): {
  label: QuadrantType;
  kPct: number;
  rPct: number;
} {
  const kPct = Math.min(100, Math.max(0, Math.round((ds.domain1 / 50) * 100)));
  const rPct = Math.min(100, Math.max(0,
    Math.round(((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / 150) * 100),
  ));

  let label: QuadrantType;
  if (kPct >= 50 && rPct >= 50) label = "Self-Regulated Learner";
  else if (kPct < 50 && rPct >= 50) label = "Reflective Learner";
  else if (kPct < 50 && rPct < 50) label = "Passive Learner";
  else label = "Strategic Learner";

  return { label, kPct, rPct };
}

// ────────────────────────────────────────────
//  PAGE 4 — Quadrant Chart (Dynamic)
//  Colors match the attached screenshot exactly:
//    top-left = light blue, top-right = light mint/cyan,
//    bottom-left = light pink, bottom-right = light lavender/purple
// ────────────────────────────────────────────
function addQuadrantPage(doc: jsPDF, data: ReportData) {
  doc.addPage();
  addPageChrome(doc);

  const w = doc.internal.pageSize.getWidth();

  const { label: quadrantLabel, kPct, rPct } = getQuadrant(data.domainScores);

  // ── Chart geometry ──
  const chartX = 50;
  const chartY = 30;
  const chartW = 136;
  const chartH = 180;

  const xAt = (pct: number) => chartX + (pct / 100) * chartW;
  const yAt = (pct: number) => chartY + chartH - (pct / 100) * chartH;
  const midX = xAt(50);
  const midY = yAt(50);

  // ── Quadrant fills (match attached image colors) ──
  // Top-left: light blue / periwinkle
  doc.setFillColor(206, 215, 252);
  doc.rect(chartX, chartY, chartW / 2, chartH / 2, "F");
  // Top-right: light mint / cyan-green
  doc.setFillColor(208, 245, 235);
  doc.rect(midX, chartY, chartW / 2, chartH / 2, "F");
  // Bottom-left: light pink / blush
  doc.setFillColor(252, 220, 220);
  doc.rect(chartX, midY, chartW / 2, chartH / 2, "F");
  // Bottom-right: light lavender / purple tint
  doc.setFillColor(228, 210, 240);
  doc.rect(midX, midY, chartW / 2, chartH / 2, "F");

  // ── Highlight region (area under the point within its quadrant) ──
  const dotX = xAt(kPct);
  const dotY = yAt(rPct);
  let hlX: number, hlY: number, hlW: number, hlH: number;
  let hlFill: [number, number, number];
  let hlBorder: [number, number, number];
  if (kPct >= 50 && rPct >= 50) {
    hlX = midX; hlY = dotY; hlW = dotX - midX; hlH = midY - dotY;
    hlFill = [34, 197, 94]; hlBorder = [22, 163, 74];
  } else if (kPct < 50 && rPct >= 50) {
    hlX = chartX; hlY = dotY; hlW = dotX - chartX; hlH = midY - dotY;
    hlFill = [59, 130, 246]; hlBorder = [37, 99, 235];
  } else if (kPct < 50 && rPct < 50) {
    hlX = chartX; hlY = dotY; hlW = dotX - chartX; hlH = (chartY + chartH) - dotY;
    hlFill = [239, 68, 68]; hlBorder = [220, 38, 38];
  } else {
    hlX = midX; hlY = dotY; hlW = dotX - midX; hlH = (chartY + chartH) - dotY;
    hlFill = [234, 179, 8]; hlBorder = [180, 130, 8];
  }
  if (hlW > 0 && hlH > 0) {
    // Light-tinted fill (simulate ~25% opacity by blending toward white)
    const lightFill: [number, number, number] = [
      Math.min(255, hlFill[0] + Math.round((255 - hlFill[0]) * 0.72)),
      Math.min(255, hlFill[1] + Math.round((255 - hlFill[1]) * 0.72)),
      Math.min(255, hlFill[2] + Math.round((255 - hlFill[2]) * 0.72)),
    ];
    doc.setFillColor(lightFill[0], lightFill[1], lightFill[2]);
    doc.rect(hlX, hlY, hlW, hlH, "F");
    // Border
    doc.setDrawColor(hlBorder[0], hlBorder[1], hlBorder[2]);
    doc.setLineWidth(0.8);
    doc.rect(hlX, hlY, hlW, hlH, "S");
  }

  // ── Midlines (quadrant dividers) ──
  doc.setDrawColor(100, 110, 130);
  doc.setLineWidth(0.7);
  doc.line(midX, chartY, midX, chartY + chartH);
  doc.line(chartX, midY, chartX + chartW, midY);

  // ── Outer border ──
  doc.setDrawColor(70, 80, 100);
  doc.setLineWidth(0.8);
  doc.rect(chartX, chartY, chartW, chartH);

  // ── Y-axis line (left edge, drawn bold so it's clearly visible) ──
  doc.setDrawColor(70, 80, 100);
  doc.setLineWidth(1.2);
  doc.line(chartX, chartY, chartX, chartY + chartH);

  // ── X-axis line (bottom edge, drawn bold) ──
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

  // ── Tick marks & axis numbers (larger font) ──
  const ticks = [0, 25, 50, 75, 100];
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 75, 90);
  doc.setDrawColor(70, 80, 100);
  doc.setLineWidth(0.4);

  ticks.forEach((v) => {
    const tx = xAt(v);
    const ty = yAt(v);
    // X-axis tick
    doc.line(tx, chartY + chartH, tx, chartY + chartH + 3);
    doc.text(String(v), tx, chartY + chartH + 8, { align: "center" });
    // Y-axis tick
    doc.line(chartX - 3, ty, chartX, ty);
    doc.text(String(v), chartX - 4.5, ty + 2, { align: "right" });
  });

  // ── Axis labels (larger, bold) ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 50, 65);

  // X-axis label
  doc.text("Knowledge (Awareness) %", chartX + chartW / 2, chartY + chartH + 18, { align: "center" });

  // Y-axis label (rotated 90°, two lines so each is large enough to read)
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 50, 65);

  // Y-axis label — single line, placed at x=30 (midway between page border 12 and tick numbers 45)
  // chartH=180 gives plenty of vertical room for the full text
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 50, 65);
  doc.text(
    "Regulation %", 
    36,
    chartY + chartH / 2,
    { angle: 90, align: "center" },
  );

  // ── Quadrant corner labels (large, bold, colored) ──
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  doc.setTextColor(37, 99, 235);   // blue
  doc.text("Reflective", xAt(25), yAt(78), { align: "center" });

  doc.setTextColor(22, 163, 74);   // green
  doc.text("Self-Regulated", xAt(75), yAt(82), { align: "center" });
  doc.setFontSize(13);
  doc.text("Learner", xAt(75), yAt(76), { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);   // red
  doc.text("Passive", xAt(25), yAt(22), { align: "center" });

  doc.setTextColor(180, 83, 9);    // amber-brown
  doc.text("Strategic", xAt(75), yAt(22), { align: "center" });

  // ── Student dot (dotX, dotY declared earlier for highlight) ──
  // Solid red dot (matches the attached screenshot)
  doc.setFillColor(200, 30, 30);
  doc.circle(dotX, dotY, 3.5, "F");

  // ── Tooltip above the dot ──
  const ttText = `(${kPct}%, ${rPct}%)`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const ttW = doc.getTextWidth(ttText) + 8;
  const ttH = 8;
  let ttX = dotX - ttW / 2;
  const ttY = Math.max(chartY + 1.5, dotY - 15);
  if (ttX < chartX + 1) ttX = chartX + 1;
  if (ttX + ttW > chartX + chartW - 1) ttX = chartX + chartW - 1 - ttW;
  // Shadow
  doc.setFillColor(90, 100, 120);
  doc.roundedRect(ttX + 0.8, ttY + 0.8, ttW, ttH, 2, 2, "F");
  // Fill
  doc.setFillColor(30, 40, 65);
  doc.roundedRect(ttX, ttY, ttW, ttH, 2, 2, "F");
  // Text
  doc.setTextColor(255, 255, 255);
  doc.text(ttText, ttX + ttW / 2, ttY + 5.5, { align: "center" });
  // Connector line
  doc.setDrawColor(30, 40, 65);
  doc.setLineWidth(0.5);
  doc.line(dotX, ttY + ttH, dotX, dotY - 3.5);

  // ── "Quadrant: [label]" below chart ──
  const bottomY = chartY + chartH + 28;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);

  const prefix = "Quadrant: ";
  const fullTextW = doc.getTextWidth(prefix + quadrantLabel);
  const startX = w / 2 - fullTextW / 2;

  doc.text(prefix, startX, bottomY);

  // Color for the quadrant label
  const qColorMap: Record<QuadrantType, [number, number, number]> = {
    "Self-Regulated Learner": [22, 163, 74],
    "Reflective Learner": [37, 99, 235],
    "Passive Learner": [220, 38, 38],
    "Strategic Learner": [180, 83, 9],
  };
  const qc = qColorMap[quadrantLabel];
  doc.setTextColor(qc[0], qc[1], qc[2]);
  doc.text(quadrantLabel, startX + doc.getTextWidth(prefix), bottomY);
}

// ── Add a full-page static image ──
function addImagePage(doc: jsPDF, imgDataUrl: string) {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.addImage(imgDataUrl, "JPEG", 0, 0, w, h);
}

// ────────────────────────────────────────────
//  MAIN EXPORT
// ────────────────────────────────────────────
export async function generateDetailedReport(data: ReportData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Determine which quadrant-specific pages (10-21) to include
  const { label: quadrantLabel } = getQuadrant(data.domainScores);

  // Quadrant → page range mapping:
  //   Passive Learner (Unaware)           → pages 10-12
  //   Reflective Learner                  → pages 13-15
  //   Strategic Learner                   → pages 16-18
  //   Self-Regulated Learner (Expert)     → pages 19-21
  const quadrantPageRange: Record<QuadrantType, [number, number]> = {
    "Passive Learner":         [10, 12],
    "Reflective Learner":      [13, 15],
    "Strategic Learner":       [16, 18],
    "Self-Regulated Learner":  [19, 21],
  };
  const [qStart, qEnd] = quadrantPageRange[quadrantLabel];

  // Build list of all pages we need images for:
  //   Pages 1, 3, 5-9 (common) + quadrant-specific pages + 22 (last)
  const commonPages = [1, 3, 5, 6, 7, 8, 9];
  const quadrantPages: number[] = [];
  for (let p = qStart; p <= qEnd; p++) quadrantPages.push(p);
  const allStaticPages = [...commonPages, ...quadrantPages, 22];

  // Pre-fetch only the images we actually need
  const imageUrls = allStaticPages.map((num) => getImageUrl(PAGE_IMAGE_SUFFIX[num]));
  const imageDataUrls = await Promise.all(imageUrls.map((url) => fetchImageAsDataURL(url)));

  const imageMap = new Map<number, string>();
  allStaticPages.forEach((num, i) => {
    imageMap.set(num, imageDataUrls[i]);
  });

  // ── Page 1 — Cover (static image, first page of doc) ──
  doc.addImage(imageMap.get(1)!, "JPEG", 0, 0, w, h);

  // ── Page 2 — Student Information (dynamic) ──
  addStudentInfoPage(doc, data);

  // ── Page 3 — Static image ──
  addImagePage(doc, imageMap.get(3)!);

  // ── Page 4 — Quadrant Chart (dynamic) ──
  addQuadrantPage(doc, data);

  // ── Pages 5-9 — Common static images ──
  for (let p = 5; p <= 9; p++) {
    const img = imageMap.get(p);
    if (img) addImagePage(doc, img);
  }

  // ── Quadrant-specific pages ──
  for (let p = qStart; p <= qEnd; p++) {
    const img = imageMap.get(p);
    if (img) addImagePage(doc, img);
  }

  // ── Page 22 — Last page (common) ──
  addImagePage(doc, imageMap.get(22)!);

  // Save
  const fileName = `TEST_Detailed_Report_${data.studentName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
