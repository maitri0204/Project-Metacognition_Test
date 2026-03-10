import { Response } from "express";
import mongoose from "mongoose";
import Question from "../models/Question";
import ParentTestResult from "../models/ParentTestResult";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";

// GET /api/parent-test/questions — student (gets parent-type questions)
export const getParentTestQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await Question.find({ testType: "parent" }).sort({ questionNumber: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error("getParentTestQuestions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/parent-test/submit — student submits parent's test
export const submitParentTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user._id;
    const { parentInfo, answers } = req.body as {
      parentInfo: {
        firstName: string;
        middleName?: string;
        lastName: string;
        mobile: string;
        email: string;
        relation: string;
      };
      answers: { questionId: string; selectedOption: string; score: number }[];
    };

    if (!parentInfo || !parentInfo.firstName || !parentInfo.lastName || !parentInfo.mobile || !parentInfo.email || !parentInfo.relation) {
      res.status(400).json({ message: "Parent information is required" });
      return;
    }

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

    const result = new ParentTestResult({
      student: studentId,
      parentInfo: {
        firstName: parentInfo.firstName.trim(),
        middleName: parentInfo.middleName?.trim() || "",
        lastName: parentInfo.lastName.trim(),
        mobile: parentInfo.mobile.trim(),
        email: parentInfo.email.toLowerCase().trim(),
        relation: parentInfo.relation.trim(),
      },
      answers: processedAnswers,
      domainScores,
      totalScore,
      submittedAt: new Date(),
    });

    await result.save();

    res.status(200).json({
      message: "Parent test submitted successfully",
      resultId: result._id,
    });
  } catch (error) {
    console.error("submitParentTest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/parent-test/my-results — student gets their parent test results
export const getMyParentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await ParentTestResult.find({ student: req.user._id }).sort({
      submittedAt: -1,
    });
    res.status(200).json({ results });
  } catch (error) {
    console.error("getMyParentResults error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/parent-test/results/:id — student (own) or admin (any)
export const getParentResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await ParentTestResult.findById(req.params.id)
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
    console.error("getParentResult error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/parent-test/admin/results — admin: all parent test results
export const getAllParentResults = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await ParentTestResult.find()
      .populate("student", "firstName middleName lastName email mobile city state country createdAt")
      .sort({ submittedAt: -1 });

    res.status(200).json({ results });
  } catch (error) {
    console.error("getAllParentResults error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/parent-test/student/:studentId — admin: get parent results for a specific student
export const getParentResultsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let studentId = req.params.studentId as string;

    // If param is not a valid ObjectId, treat it as an email and resolve the actual _id
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const user = await User.findOne({ email: studentId });
      if (!user) {
        res.status(404).json({ message: "Student not found" });
        return;
      }
      studentId = user._id.toString();
    }

    const results = await ParentTestResult.find({ student: studentId })
      .populate("student", "firstName middleName lastName email mobile city state country")
      .sort({ submittedAt: -1 });
    res.status(200).json({ results });
  } catch (error) {
    console.error("getParentResultsByStudent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
