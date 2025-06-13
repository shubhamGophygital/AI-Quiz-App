"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { QuizFormPayload } from "@/types/quiz";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      topic: "",
      count: 5,
      difficulty: "medium",
      type: "mcq",
    },
    validationSchema: Yup.object({
      topic: Yup.string().required("Topic is required"),
      count: Yup.number().max(10).required(),
      difficulty: Yup.string().oneOf(["easy", "medium", "hard"]).required(),
      type: Yup.string().oneOf(["mcq", "typed"]).required(),
    }),
    onSubmit: (values: QuizFormPayload) => navigateToQuizPage(values),
  });

  const navigateToQuizPage = (values: QuizFormPayload) => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(values)));
    router.push(`/quiz?data=${encoded}&topic=${values?.topic}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Quiz Generator</h1>
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
    </div>
  );
}
