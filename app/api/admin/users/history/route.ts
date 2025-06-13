import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Submission from "@/models/Submission";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = await getToken({ req });
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const data = await Submission.find({ userId: token.email }).sort({
    createdAt: -1,
  });
  return NextResponse.json({ submissions: data });
}
