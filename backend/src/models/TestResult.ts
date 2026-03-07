import mongoose, { Document, Schema } from "mongoose";

export interface ICategoryScore {
  category: string;
  part: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ITestAnswer {
  questionId: mongoose.Types.ObjectId;
  questionText: string;
  category: string;
  part: string;
  score: number; // 1-5
}

export interface ITestResult extends Document {
  student: mongoose.Types.ObjectId;
  attemptNumber: number;
  answers: ITestAnswer[];
  categoryScores: ICategoryScore[];
  knowledgeScore: number;
  knowledgeMaxScore: number;
  knowledgePercentage: number;
  regulationScore: number;
  regulationMaxScore: number;
  regulationPercentage: number;
  totalScore: number;
  totalMaxScore: number;
  quadrant: string;
  quadrantLabel: string;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const categoryScoreSchema = new Schema<ICategoryScore>(
  {
    category: { type: String, required: true },
    part: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const testAnswerSchema = new Schema<ITestAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    questionText: { type: String, required: true },
    category: { type: String, required: true },
    part: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const testResultSchema = new Schema<ITestResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attemptNumber: { type: Number, required: true, default: 1 },
    answers: [testAnswerSchema],
    categoryScores: [categoryScoreSchema],
    knowledgeScore: { type: Number, required: true },
    knowledgeMaxScore: { type: Number, default: 85 },
    knowledgePercentage: { type: Number, required: true },
    regulationScore: { type: Number, required: true },
    regulationMaxScore: { type: Number, default: 175 },
    regulationPercentage: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    totalMaxScore: { type: Number, default: 260 },
    quadrant: { type: String, required: true },
    quadrantLabel: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ITestResult>("TestResult", testResultSchema);
