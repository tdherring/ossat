export interface Assessment {
  id: string;
  variant: string;
  score: number;
  submitted: boolean;
  questionSet: { id: string }[];
}

export interface QuizProcess {
  name: string;
  size?: number;
  arrival_time?: number;
  burst_time?: number;
  priority?: number | null;
}

export interface QuizBlock {
  name: string;
  size: number;
}

export interface QuizQuestionData {
  id: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  processes: string;
  blocks: string;
  assessment: { submitted: boolean; variant: string; score: number };
  answer: { answers: string };
}

export function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}
