"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dialog } from "@/components/ui/dialog"; // shadcn modal
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useEvaluateQuiz } from "@/hooks/useEvaluateQuiz";

type Question = {
  question: string;
  type: "mcq" | "typed";
  options?: string[];
  answer: string;
};

type QuizFormData = {
  topic: string;
  count: number;
  difficulty: string;
  type: string;
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);

  const [timeLeft, setTimeLeft] = useState(
    60 * Number(parseInt(searchParams.get("count") || "1"))
  );
  const [showModal, setShowModal] = useState(false);

  const { mutate: evaluateQuiz, isPending: isEvaluating } = useEvaluateQuiz();

  const { mutate: generateQuiz, isPending: isLoading } = useMutation<
    any,
    Error,
    QuizFormData
  >({
    mutationFn: async (formData: QuizFormData) => {
      const res = await axios.post("/api/quiz", formData);
      return res.data;
    },
    onSuccess: (data: { questions: Question[] }) =>
      setQuestions(data?.questions),
  });

  const formik = useFormik({
    initialValues: { answers: [] },
    onSubmit: async (values) => {
      const topic = searchParams.get("topic") || "";
      const evaluation = await evaluateQuiz({
        userId: session?.user?.email,
        topic,
        questions,
        answers: values.answers,
      });
      console.log("evaluation", evaluation);
      //   router.push("/dashboard");
    },
  });

  useEffect(() => {
    const topic = searchParams.get("topic") || "";
    const count = parseInt(searchParams.get("count") || "1");
    const difficulty = searchParams.get("difficulty") || "";
    const type = searchParams.get("type") || "";

    const quizData: QuizFormData = {
      topic,
      count,
      difficulty,
      type,
    };

    console.log("quizData", quizData);
    generateQuiz(quizData);
  }, [searchParams]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowModal(true);
      formik.handleSubmit(); // auto-submit
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (s: number): string =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-6">
      {/* <h1 className="text-xl font-bold mb-4">Quiz on {topic}</h1> */}
      <p className="mb-2">
        Time Remaining:{" "}
        <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="border p-4 rounded">
            <p>
              <b>
                {i + 1}. {q.question}
              </b>
            </p>
            {q.type === "mcq" ? (
              q.options?.map((opt, j) => (
                <label key={j} className="block">
                  <input
                    type="radio"
                    name={`answers[${i}]`}
                    value={opt}
                    onChange={formik.handleChange}
                    checked={formik.values.answers[i] === opt}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))
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
        <button
          type="submit"
          disabled={isEvaluating}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit Quiz
        </button>
      </form>

      {/* Modal */}
      <Dialog open={showModal}>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Time's Up!</h2>
          <p>Your answers have been auto-submitted.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </Dialog>
    </div>
  );
}
