// ─── Roles ───
export enum USER_ROLE {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}

// ─── User ───
export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: USER_ROLE;
  isVerified: boolean;
  isActive?: boolean;
}

// ─── Question ───
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

export interface Question {
  _id: string;
  questionText: string;
  part: QuestionPart;
  category: QuestionCategory;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
