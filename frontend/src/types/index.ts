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

// ─── Test Result ───
export interface CategoryScore {
  category: string;
  part: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TestResult {
  _id: string;
  student: string | { _id: string; firstName: string; lastName: string; email: string };
  attemptNumber: number;
  categoryScores: CategoryScore[];
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
  completedAt: string;
  createdAt?: string;
}

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
