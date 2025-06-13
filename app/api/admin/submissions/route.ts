import { connectDB } from "@/lib/mongodb";
import Submission from "@/models/Submission";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = await getToken({ req });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const submissions = await Submission.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ submissions });
}
