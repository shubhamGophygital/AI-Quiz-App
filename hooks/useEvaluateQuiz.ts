import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type Question = {
  question: string;
  type: "mcq" | "typed";
  options?: string[];
  answer: string;
};

type EvaluatePayload = {
  userId?: string | null | undefined;
  topic: string;
  questions: Question[];
  answers: string[];
};

type EvaluateResponse = {
  score: number;
  success: boolean;
};

export const useEvaluateQuiz = () => {
  return useMutation<EvaluateResponse, Error, EvaluatePayload>({
    mutationFn: async (payload: EvaluatePayload) => {
      const res = await axios.post("/api/evaluate", payload);
      return res.data;
    },
  });
};
