import { Request, Response } from "express";
import Question from "../models/Question";

// Category → Part mapping
const CATEGORY_TO_PART: Record<string, string> = {
  Declarative: "Knowledge",
  Procedural: "Knowledge",
  Conditional: "Knowledge",
  Planning: "Regulation",
  "Information Management": "Regulation",
  Monitoring: "Regulation",
  Debugging: "Regulation",
  Evaluation: "Regulation",
};

// Max questions allowed per category
const CATEGORY_LIMITS: Record<string, number> = {
  Declarative: 8,
  Procedural: 4,
  Conditional: 5,
  Planning: 7,
  "Information Management": 10,
  Monitoring: 7,
  Debugging: 5,
  Evaluation: 6,
};

// GET /api/questions
export const getQuestions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const questions = await Question.find().sort({ part: 1, category: 1, orderIndex: 1 });
    res.status(200).json({ questions });
  } catch (error: any) {
    console.error("Get questions error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/questions
export const addQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionText, category } = req.body;

    if (!questionText?.trim() || !category) {
      res.status(400).json({ message: "Question text and category are required." });
      return;
    }

    if (!CATEGORY_LIMITS[category]) {
      res.status(400).json({ message: `Invalid category: "${category}".` });
      return;
    }

    const currentCount = await Question.countDocuments({ category });
    if (currentCount >= CATEGORY_LIMITS[category]) {
      res.status(400).json({
        message: `"${category}" already has the maximum of ${CATEGORY_LIMITS[category]} questions.`,
      });
      return;
    }

    const question = new Question({
      questionText: questionText.trim(),
      part: CATEGORY_TO_PART[category],
      category,
      orderIndex: currentCount + 1,
      isActive: true,
    });

    await question.save();
    console.log(`📝 Question added: [${category}] "${questionText.trim()}"`);

    res.status(201).json({ message: "Question added successfully.", question });
  } catch (error: any) {
    console.error("Add question error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/questions/:id
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { questionText } = req.body;

    if (!questionText?.trim()) {
      res.status(400).json({ message: "Question text is required." });
      return;
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { questionText: questionText.trim() },
      { new: true }
    );

    if (!question) {
      res.status(404).json({ message: "Question not found." });
      return;
    }

    res.status(200).json({ message: "Question updated successfully.", question });
  } catch (error: any) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/questions/:id
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      res.status(404).json({ message: "Question not found." });
      return;
    }

    // Re-number remaining questions in same category
    const remaining = await Question.find({ category: question.category }).sort({ orderIndex: 1 });
    await Promise.all(
      remaining.map((q, idx) =>
        Question.findByIdAndUpdate(q._id, { orderIndex: idx + 1 })
      )
    );

    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error: any) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
