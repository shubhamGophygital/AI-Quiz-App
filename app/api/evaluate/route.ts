import { connectDB } from "@/lib/mongodb";
// import Submission from "@/models/Submission";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // await connectDB();
  const { userId, topic, questions, answers } = await req.json();

  let score = 0;
  if (questions?.[0]?.type === "mcq") {
    questions.forEach((q: any, i: number) => {
      if (q.answer?.toLowerCase?.() === answers[i]?.toLowerCase?.()) {
        score++;
      }
    });
  }

  // await Submission.create({
  //   userId,
  //   topic,
  //   questions,
  //   answers,
  //   score,
  // });

  return NextResponse.json({ success: true, score });
}
