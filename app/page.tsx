// "use client";

// import { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { useSession } from "next-auth/react";

// export default function Home() {
//   const [questions, setQuestions] = useState<any[]>([]);
//   const [answers, setAnswers] = useState<Record<number, string>>({});
//   const { data: session } = useSession();

//   const formik = useFormik({
//     initialValues: {
//       topic: "",
//       count: 5,
//       difficulty: "medium",
//       type: "mcq",
//     },
//     validationSchema: Yup.object({
//       topic: Yup.string().required("Topic is required"),
//       count: Yup.number().max(20).required(),
//       difficulty: Yup.string().oneOf(["easy", "medium", "hard"]).required(),
//       type: Yup.string().oneOf(["mcq", "typed"]).required(),
//     }),
//     onSubmit: (values) => generateQuiz(values),
//   });

//   type QuizFormData = {
//     topic: string;
//     count: number;
//     difficulty: string;
//     type: string;
//   };

//   const { mutate: generateQuiz, isPending: isLoading } = useMutation<
//     any,
//     Error,
//     QuizFormData
//   >({
//     mutationFn: async (formData) => {
//       const res = await axios.post("/api/quiz", formData);
//       return res.data;
//     },
//     onSuccess: (data) => setQuestions(data.questions),
//   });

//   const submitAnswers = async () => {
//     await axios.post("/api/evaluate", {
//       userId: session?.user?.email,
//       topic: formik.values.topic,
//       answers,
//       questions,
//     });
//     alert("Answers submitted and evaluated!");
//   };

//   console.log("questions", questions);

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       {/* <h1 className="text-2xl font-bold mb-4">AI Quiz Generator</h1> */}
//       <form onSubmit={formik.handleSubmit} className="space-y-4">
//         <Input
//           name="topic"
//           placeholder="Enter topic..."
//           value={formik.values.topic}
//           onChange={formik.handleChange}
//         />
//         <Input
//           type="number"
//           name="count"
//           placeholder="Number of questions (max 20)"
//           value={formik.values.count}
//           onChange={formik.handleChange}
//         />
//         <Select
//           onValueChange={(val) => formik.setFieldValue("difficulty", val)}
//           defaultValue={formik.values.difficulty}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select difficulty" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="easy">Easy</SelectItem>
//             <SelectItem value="medium">Medium</SelectItem>
//             <SelectItem value="hard">Hard</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select
//           onValueChange={(val) => formik.setFieldValue("type", val)}
//           defaultValue={formik.values.type}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="mcq">MCQ</SelectItem>
//             <SelectItem value="typed">Typed</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button type="submit" disabled={isLoading}>
//           Generate
//         </Button>
//       </form>

//       {Array.isArray(questions) && questions.length > 0 && (
//         <div className="mt-8 space-y-4">
//           <h2 className="text-xl font-semibold">Generated Questions</h2>
//           {questions.map((q, idx) => (
//             <div key={idx} className="p-4 border rounded-lg">
//               <p className="font-medium">
//                 {idx + 1}. {q.question}
//               </p>
//               {q.type === "mcq" ? (
//                 <ul className="list-disc pl-6 space-y-1">
//                   {q.options.map((opt: string, i: number) => (
//                     <li key={i}>
//                       <label>
//                         <input
//                           type="radio"
//                           name={`q-${idx}`}
//                           value={opt}
//                           onChange={(e) =>
//                             setAnswers({ ...answers, [idx]: e.target.value })
//                           }
//                         />{" "}
//                         {opt}
//                       </label>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <Textarea
//                   placeholder="Your answer here..."
//                   onChange={(e) =>
//                     setAnswers({ ...answers, [idx]: e.target.value })
//                   }
//                 />
//               )}
//             </div>
//           ))}
//           <Button onClick={submitAnswers} className="mt-4">
//             Submit Answers
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dialog } from "@/components/ui/dialog"; // shadcn modal
import { useFormik } from "formik";

interface QuizPageProps {
  searchParams: {
    topic?: string;
    count?: string;
    difficulty?: string;
    type?: string;
  };
}

type Question = {
  question: string;
  type: "mcq" | "typed";
  options?: string[];
  answer: string;
};

export default function QuizPage({ searchParams }: QuizPageProps) {
  const { topic, count, difficulty, type } = searchParams;
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);

  const [timeLeft, setTimeLeft] = useState(60 * Number(count)); // 1 min per question
  const [showModal, setShowModal] = useState(false);

  const formik = useFormik({
    initialValues: { answers: [] },
    onSubmit: async (values) => {
      await axios.post("/api/evaluate", {
        userId: session?.user?.email,
        topic,
        questions,
        answers: values.answers,
      });
      router.push("/dashboard");
    },
  });

  // Fetch quiz questions
  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await axios.post("/api/quiz", {
        topic,
        count,
        difficulty,
        type,
      });
      setQuestions(res.data.questions);
      formik.setFieldValue(
        "answers",
        new Array(res.data.questions.length).fill("")
      );
    };
    fetchQuiz();
  }, []);

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
      <h1 className="text-xl font-bold mb-4">Quiz on {topic}</h1>
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
