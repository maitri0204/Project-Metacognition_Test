import mongoose, { Document, Schema } from "mongoose";

export interface IOption {
  label: string;   // A, B, C, D, E
  text: string;    // Never, Rarely, Sometimes, Often, Always
  score: number;   // 1, 2, 3, 4, 5
}

export interface IQuestion extends Document {
  questionNumber: number;
  domain: string;
  domainNumber: number;
  parameter: string;
  parameterNumber: number;
  questionText: string;
  options: IOption[];
  testType: "student" | "parent";
}

const optionSchema = new Schema<IOption>(
  {
    label: { type: String, required: true },
    text: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    questionNumber: { type: Number, required: true },
    domain: { type: String, required: true },
    domainNumber: { type: Number, required: true },
    parameter: { type: String, required: true },
    parameterNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: { type: [optionSchema], required: true },
    testType: { type: String, enum: ["student", "parent"], default: "student" },
  },
  { timestamps: true }
);

questionSchema.index({ testType: 1, questionNumber: 1 }, { unique: true });

export default mongoose.model<IQuestion>("Question", questionSchema);
