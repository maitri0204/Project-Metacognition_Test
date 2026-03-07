import { Response } from "express";
import Question from "../models/Question";
import TestResult from "../models/TestResult";
import { AuthRequest } from "../middleware/auth";

// How many questions per category the student sees
const STUDENT_LIMITS: Record<string, number> = {
  Declarative: 8,
  Procedural: 4,
  Conditional: 5,
  Planning: 7,
  "Information Management": 10,
  Monitoring: 7,
  Debugging: 5,
  Evaluation: 6,
};

const CATEGORY_ORDER = [
  "Declarative",
  "Procedural",
  "Conditional",
  "Planning",
  "Information Management",
  "Monitoring",
  "Debugging",
  "Evaluation",
];

const KNOWLEDGE_MAX = 85;  // 17 questions × 5
const REGULATION_MAX = 175; // 35 questions × 5
const TOTAL_MAX = 260;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/test/questions  — student only
export const getTestQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testQuestions: any[] = [];

    for (const category of CATEGORY_ORDER) {
      const limit = STUDENT_LIMITS[category];
      // Take the first N by orderIndex, then shuffle within the category
      const catQs = await Question.find({ category, isActive: true })
        .sort({ orderIndex: 1 })
        .limit(limit)
        .select("_id questionText part category orderIndex");

      testQuestions.push(...shuffle(catQs));
    }

    res.status(200).json({ questions: testQuestions, totalQuestions: testQuestions.length });
  } catch (error: any) {
    console.error("Get test questions error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/test/submit  — student only
export const submitTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body as { answers: { questionId: string; score: number }[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ message: "Answers are required." });
      return;
    }

    for (const a of answers) {
      if (!a.questionId || typeof a.score !== "number" || a.score < 1 || a.score > 5) {
        res.status(400).json({ message: "Each answer must have a questionId and score (1–5)." });
        return;
      }
    }

    // Fetch the questions to get metadata
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // Accumulate scores per category
    const catMap: Record<string, { score: number; part: string }> = {};
    const fullAnswers = answers
      .map((a) => {
        const q = qMap.get(a.questionId);
        if (!q) return null;
        if (!catMap[q.category]) catMap[q.category] = { score: 0, part: q.part };
        catMap[q.category].score += a.score;
        return {
          questionId: q._id,
          questionText: q.questionText,
          category: q.category,
          part: q.part,
          score: a.score,
        };
      })
      .filter(Boolean);

    // Build ordered category scores
    const categoryScores = CATEGORY_ORDER.filter((cat) => catMap[cat]).map((cat) => {
      const maxScore = STUDENT_LIMITS[cat] * 5;
      return {
        category: cat,
        part: catMap[cat].part,
        score: catMap[cat].score,
        maxScore,
        percentage: Math.round((catMap[cat].score / maxScore) * 100),
      };
    });

    const knowledgeScore = categoryScores
      .filter((c) => c.part === "Knowledge")
      .reduce((s, c) => s + c.score, 0);
    const regulationScore = categoryScores
      .filter((c) => c.part === "Regulation")
      .reduce((s, c) => s + c.score, 0);

    const knowledgePercentage = Math.round((knowledgeScore / KNOWLEDGE_MAX) * 100);
    const regulationPercentage = Math.round((regulationScore / REGULATION_MAX) * 100);

    // Cartesian quadrant (50/50 divide)
    let quadrant: string;
    let quadrantLabel: string;
    if (knowledgePercentage >= 50 && regulationPercentage >= 50) {
      quadrant = "I";   quadrantLabel = "Expert Learner";
    } else if (knowledgePercentage < 50 && regulationPercentage >= 50) {
      quadrant = "II";  quadrantLabel = "Reflective but Unstructured Learner";
    } else if (knowledgePercentage < 50 && regulationPercentage < 50) {
      quadrant = "III"; quadrantLabel = "Unaware Learner";
    } else {
      quadrant = "IV";  quadrantLabel = "Strategic Learner";
    }

    const prevAttempts = await TestResult.countDocuments({ student: req.user._id });

    const result = new TestResult({
      student: req.user._id,
      attemptNumber: prevAttempts + 1,
      answers: fullAnswers,
      categoryScores,
      knowledgeScore,
      knowledgeMaxScore: KNOWLEDGE_MAX,
      knowledgePercentage,
      regulationScore,
      regulationMaxScore: REGULATION_MAX,
      regulationPercentage,
      totalScore: knowledgeScore + regulationScore,
      totalMaxScore: TOTAL_MAX,
      quadrant,
      quadrantLabel,
      completedAt: new Date(),
    });

    await result.save();
    console.log(
      `📊 Test submitted | ${req.user.email} | Score: ${knowledgeScore + regulationScore}/${TOTAL_MAX} | Q${quadrant}: ${quadrantLabel}`
    );

    res.status(201).json({ message: "Test submitted successfully.", result });
  } catch (error: any) {
    console.error("Submit test error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/test/results/:id  — student sees own, admin sees all
export const getResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch WITHOUT populate so result.student is still a raw ObjectId for comparison
    const result = await TestResult.findById(req.params.id);
    if (!result) {
      res.status(404).json({ message: "Result not found." });
      return;
    }
    if (
      req.user.role !== "ADMIN" &&
      result.student.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: "Access denied." });
      return;
    }
    // Populate only after ownership is confirmed
    await result.populate("student", "firstName lastName email");
    res.status(200).json({ result });
  } catch (error: any) {
    console.error("Get result error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/test/my-results  — student only
export const getMyResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await TestResult.find({ student: req.user._id })
      .sort({ completedAt: -1 })
      .select("-answers"); // lighter payload for list
    res.status(200).json({ results });
  } catch (error: any) {
    console.error("Get my results error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
