import { EvaluatePayload, EvaluateResponse } from "@/types/quiz";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useEvaluateQuiz = () => {
  return useMutation<EvaluateResponse, Error, EvaluatePayload>({
    mutationFn: async (payload: EvaluatePayload) => {
      const res = await axios.post("/api/evaluate", payload);
      return res.data;
    },
  });
};
