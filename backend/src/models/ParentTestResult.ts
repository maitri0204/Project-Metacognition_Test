import mongoose, { Document, Schema } from "mongoose";

export interface IParentInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobile: string;
  email: string;
  relation: string; // e.g. "Father", "Mother", "Guardian"
}

export interface IParentAnswer {
  questionId: mongoose.Types.ObjectId;
  questionNumber: number;
  selectedOption: string; // A, B, C, D, or E
  score: number;          // 1–5
}

export interface IParentDomainScores {
  domain1: number;
  domain2: number;
  domain3: number;
  domain4: number;
  domain5: number;
}

export interface IParentTestResult extends Document {
  student: mongoose.Types.ObjectId;
  parentInfo: IParentInfo;
  answers: IParentAnswer[];
  domainScores: IParentDomainScores;
  totalScore: number;
  submittedAt: Date;
}

const parentInfoSchema = new Schema<IParentInfo>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    relation: { type: String, required: true },
  },
  { _id: false }
);

const parentAnswerSchema = new Schema<IParentAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    questionNumber: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const parentTestResultSchema = new Schema<IParentTestResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentInfo: { type: parentInfoSchema, required: true },
    answers: { type: [parentAnswerSchema], required: true },
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

export default mongoose.model<IParentTestResult>("ParentTestResult", parentTestResultSchema);
