import { Response } from "express";
import Question from "../models/Question";
import { AuthRequest } from "../middleware/auth";

// GET /api/questions — admin only
export const getQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await Question.find().sort({ questionNumber: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error("getQuestions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/questions — admin only
export const addQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Auto-assign the next questionNumber
    const last = await Question.findOne().sort({ questionNumber: -1 }).select("questionNumber");
    const nextNumber = last ? last.questionNumber + 1 : 1;

    const question = new Question({
      ...req.body,
      questionNumber: nextNumber,
      options: [
        { label: "A", text: "Never",     score: 1 },
        { label: "B", text: "Rarely",    score: 2 },
        { label: "C", text: "Sometimes", score: 3 },
        { label: "D", text: "Often",     score: 4 },
        { label: "E", text: "Always",    score: 5 },
      ],
    });
    await question.save();
    res.status(201).json({ message: "Question added successfully", question });
  } catch (error) {
    console.error("addQuestion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/questions/:id — admin only
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }
    res.status(200).json({ message: "Question updated successfully", question });
  } catch (error) {
    console.error("updateQuestion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/questions/:id — admin only
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("deleteQuestion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
