import mongoose, { Document, Schema } from "mongoose";

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  questionNumber: number;
  selectedOption: string; // A, B, C, D, or E
  score: number;          // 1–5
}

export interface IDomainScores {
  domain1: number;
  domain2: number;
  domain3: number;
  domain4: number;
  domain5: number;
}

export interface ITestResult extends Document {
  student: mongoose.Types.ObjectId;
  answers: IAnswer[];
  domainScores: IDomainScores;
  totalScore: number;
  submittedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    questionNumber: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const testResultSchema = new Schema<ITestResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [answerSchema], required: true },
    domainScores: {
      domain1: { type: Number, default: 0 },
      domain2: { type: Number, default: 0 },
      domain3: { type: Number, default: 0 },
      domain4: { type: Number, default: 0 },
      domain5: { type: Number, default: 0 },
    },
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ITestResult>("TestResult", testResultSchema);
