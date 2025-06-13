export type Question = {
  question: string;
  type: "mcq" | "typed";
  options?: string[];
  answer: string;
};

export type EvaluatePayload = {
  userId?: string | null | undefined;
  topic: string;
  questions: Question[];
  answers: string[];
};

export type EvaluateResponse = {
  score: number;
  success: boolean;
};

export type QuizFormPayload = {
  topic: string;
  count: number;
  difficulty: string;
  type: string;
};

export type GeneratedQuizResponse = { questions: Question[] };

export type TimeAsPerDifficulty = {
  easy: number;
  medium: number;
  hard: number;
};
