import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = await getToken({ req });
  if (token?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const users = await User.find().select("email role name");
  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  const token = await getToken({ req });
  if (token?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json();
  await connectDB();
  await User.updateOne({ email }, { role });
  return NextResponse.json({ success: true });
}
