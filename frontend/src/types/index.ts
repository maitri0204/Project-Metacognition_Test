export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  isVerified: boolean;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface Option {
  label: string;  // A, B, C, D, E
  text: string;   // Never, Rarely, Sometimes, Often, Always
  score: number;  // 1–5
}

export interface Question {
  _id: string;
  questionNumber: number;
  domain: string;
  domainNumber: number;
  parameter: string;
  parameterNumber: number;
  questionText: string;
  options: Option[];
}

export interface Answer {
  questionId: string | Question;
  questionNumber: number;
  selectedOption: string; // A, B, C, D, E
  score: number;
}

export interface DomainScores {
  domain1: number;
  domain2: number;
  domain3: number;
  domain4: number;
  domain5: number;
}

export interface TestResult {
  _id: string;
  student: User | string;
  answers: Answer[];
  domainScores: DomainScores;
  totalScore: number;
  submittedAt: string;
  createdAt?: string;
}
