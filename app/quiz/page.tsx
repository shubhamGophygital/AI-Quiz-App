"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useEvaluateQuiz } from "@/hooks/useEvaluateQuiz";
import {
  EvaluateResponse,
  GeneratedQuizResponse,
  Question,
  QuizFormPayload,
  TimeAsPerDifficulty,
} from "@/types/quiz";
import { timeForQuiz } from "@/constants/quiz";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "default";
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [showModal, setShowModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateResponse>({
    score: 0,
    success: false,
  });

  const {
    mutate: evaluateQuiz,
    isPending: isEvaluating,
    isSuccess: isEvaluationSuccess,
  } = useEvaluateQuiz();
  const {
    mutate: generateQuiz,
    isPending,
    isError,
    error,
  } = useMutation<GeneratedQuizResponse, Error, QuizFormPayload>({
    mutationFn: async (formData: QuizFormPayload) => {
      const res = await axios.post("/api/quiz", formData);
      return res.data;
    },
    onSuccess: (data: GeneratedQuizResponse) => setQuestions(data?.questions),
  });

  const formik = useFormik({
    initialValues: { answers: [] },
    onSubmit: (values) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      evaluateQuiz(
        {
          userId: session?.user?.email,
          topic,
          questions,
          answers: values.answers,
        },
        {
          onSuccess: (data) => {
            console.log("Evaluation result:", data);
            setEvaluationResult(data);
            // router.push("/dashboard");
          },
          onError: (error) => {
            console.error("Evaluation failed", error);
          },
        }
      );
    },
  });

  const hasRun = useRef<boolean>(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const encoded = searchParams.get("data");
    if (!encoded) return;
    try {
      const decodedString = decodeURIComponent(atob(encoded));
      const quizData: QuizFormPayload = JSON.parse(decodedString);
      console.log("quizData", quizData);
      generateQuiz(quizData);
      const difficulty = quizData.difficulty as keyof TimeAsPerDifficulty;
      setTimeLeft(timeForQuiz[difficulty] * quizData?.count);
    } catch (e) {
      console.error("Invalid encoded data", e);
    }
  }, []);

  // Timer logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current); // 🛑 stop timer
      setShowModal(true);
      formik.handleSubmit(); // ✅ auto-submit
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    // ✅ Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, questions?.length]);

  const formatTime = (s: number): string =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (isPending) {
    return <p>Generating Quiz for {topic}....</p>;
  }

  if (isError) {
    return <p className="text-red-500">{error?.message}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quiz on {topic}</h1>
      <p className="mb-2">
        Time Remaining:{" "}
        <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
      </p>
      {JSON.stringify(evaluationResult, null, 2)}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="border p-4 rounded">
            <p>
              <b>
                {i + 1}. {q.question}
              </b>
            </p>
            {q?.type === "mcq" ? (
              <>
                {q?.options?.map((opt, j) => (
                  <label key={j} className="block">
                    <input
                      type="radio"
                      name={`answers[${i}]`}
                      value={opt?.split(":")?.[0]}
                      onChange={formik.handleChange}
                      checked={
                        formik.values.answers[i] === opt?.split(":")?.[0]
                      }
                      className="mr-2"
                    />
                    {opt?.split(":")?.[1]}
                  </label>
                ))}
                {isEvaluationSuccess && <p>Answer : {q?.answer}</p>}
              </>
            ) : (
              <input
                type="text"
                name={`answers[${i}]`}
                onChange={formik.handleChange}
                value={formik.values.answers[i]}
                className="border px-2 py-1 mt-2 w-full"
              />
            )}
          </div>
        ))}
        <Button type="submit" disabled={isEvaluating} variant={"default"}>
          Submit Quiz
        </Button>
      </form>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Time's Up!</DialogTitle>
            <DialogDescription>
              Your answers have been auto-submitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
