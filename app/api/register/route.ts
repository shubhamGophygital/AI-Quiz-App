import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  await connectDB();

  const userExist = await User.findOne({ email });
  if (userExist)
    return NextResponse.json({ error: "User exists" }, { status: 409 });

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = await User.create({ name, email, password: hashed });

  return NextResponse.json({ user: newUser });
}
