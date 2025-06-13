"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { data: session } = useSession();
  const router = useRouter();

  type formParams = {
    topic: string;
    count: number;
    difficulty: "easy" | "medium" | "hard";
    type: "mcq" | "typed";
  };

  const formik = useFormik({
    initialValues: {
      topic: "",
      count: 5,
      difficulty: "medium",
      type: "mcq",
    },
    validationSchema: Yup.object({
      topic: Yup.string().required("Topic is required"),
      count: Yup.number().max(5).required(),
      difficulty: Yup.string().oneOf(["easy", "medium", "hard"]).required(),
      type: Yup.string().oneOf(["mcq", "typed"]).required(),
    }),
    onSubmit: (values: formParams) => navigateToQuizPage(values),
  });

  const navigateToQuizPage = (values: formParams) => {
    const { topic, count, difficulty, type } = values;
    const searchParams = new URLSearchParams({
      topic,
      count: count.toString(),
      difficulty,
      type,
    });

    router.push(`/quiz?${searchParams.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* <h1 className="text-2xl font-bold mb-4">AI Quiz Generator</h1> */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          name="topic"
          placeholder="Enter topic..."
          value={formik.values.topic}
          onChange={formik.handleChange}
        />
        <Input
          type="number"
          name="count"
          placeholder="Number of questions (max 20)"
          value={formik.values.count}
          onChange={formik.handleChange}
        />
        <Select
          onValueChange={(val) => formik.setFieldValue("difficulty", val)}
          defaultValue={formik.values.difficulty}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(val) => formik.setFieldValue("type", val)}
          defaultValue={formik.values.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="typed">Typed</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Generate</Button>
      </form>

      {/* {Array.isArray(questions) && questions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Generated Questions</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <p className="font-medium">
                {idx + 1}. {q.question}
              </p>
              {q.type === "mcq" ? (
                <ul className="list-disc pl-6 space-y-1">
                  {q.options.map((opt: string, i: number) => (
                    <li key={i}>
                      <label>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          onChange={(e) =>
                            setAnswers({ ...answers, [idx]: e.target.value })
                          }
                        />{" "}
                        {opt}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <Textarea
                  placeholder="Your answer here..."
                  onChange={(e) =>
                    setAnswers({ ...answers, [idx]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
          <Button onClick={submitAnswers} className="mt-4">
            Submit Answers
          </Button>
        </div>
      )} */}
    </div>
  );
}
