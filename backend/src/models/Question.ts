import mongoose, { Document, Schema } from "mongoose";

export type QuestionPart = "Knowledge" | "Regulation";

export type QuestionCategory =
  | "Declarative"
  | "Procedural"
  | "Conditional"
  | "Planning"
  | "Information Management"
  | "Monitoring"
  | "Debugging"
  | "Evaluation";

export interface IQuestion extends Document {
  questionText: string;
  part: QuestionPart;
  category: QuestionCategory;
  orderIndex: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true, trim: true },
    part: {
      type: String,
      enum: ["Knowledge", "Regulation"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Declarative",
        "Procedural",
        "Conditional",
        "Planning",
        "Information Management",
        "Monitoring",
        "Debugging",
        "Evaluation",
      ],
      required: true,
    },
    orderIndex: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
