import { Response } from "express";
import Question from "../models/Question";
import TestResult from "../models/TestResult";
import { AuthRequest } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";

// GET /api/test/questions — student
export const getTestQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await Question.find().sort({ questionNumber: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error("getTestQuestions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/test/submit — student
export const submitTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user._id;
    const { answers } = req.body as {
      answers: { questionId: string; selectedOption: string; score: number }[];
    };

    if (!answers || answers.length === 0) {
      res.status(400).json({ message: "No answers provided" });
      return;
    }

    // Load questions to get domainNumber for scoring
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const domainScores = { domain1: 0, domain2: 0, domain3: 0, domain4: 0, domain5: 0 };

    const processedAnswers = answers.map((a) => {
      const q = qMap.get(a.questionId);
      if (q) {
        const key = `domain${q.domainNumber}` as keyof typeof domainScores;
        domainScores[key] += a.score;
      }
      return {
        questionId: a.questionId,
        questionNumber: q ? q.questionNumber : 0,
        selectedOption: a.selectedOption,
        score: a.score,
      };
    });

    const totalScore = Object.values(domainScores).reduce((acc, v) => acc + v, 0);

    const result = new TestResult({
      student: studentId,
      answers: processedAnswers,
      domainScores,
      totalScore,
      submittedAt: new Date(),
    });

    await result.save();

    res.status(200).json({
      message: "Test submitted successfully",
      resultId: result._id,
    });
  } catch (error) {
    console.error("submitTest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/test/results/:id — student (own) or admin (any)
export const getResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await TestResult.findById(req.params.id)
      .populate("student", "firstName middleName lastName email mobile city state country")
      .populate({
        path: "answers.questionId",
        model: "Question",
      });

    if (!result) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    // Students can only view their own results
    if (
      req.user.role === USER_ROLE.STUDENT &&
      result.student._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error("getResult error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/test/my-results — student
export const getMyResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await TestResult.find({ student: req.user._id }).sort({
      submittedAt: -1,
    });
    res.status(200).json({ results });
  } catch (error) {
    console.error("getMyResults error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/test/admin/results — admin only
export const getAllResults = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await TestResult.find()
      .populate("student", "firstName middleName lastName email mobile city state country createdAt")
      .sort({ submittedAt: -1 });

    // Count unique students who have taken the test
    const uniqueStudentIds = new Set(
      results.map((r) => {
        const s = r.student as any;
        return s?._id?.toString();
      })
    );

    res.status(200).json({ results, totalStudents: uniqueStudentIds.size });
  } catch (error) {
    console.error("getAllResults error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
