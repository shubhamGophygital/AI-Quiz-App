import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Question = {
  question: string;
  type: string;
  options: string[];
  answer: string;
};

type QuizResponse = {
  questions: Question[];
};

export async function POST(req: Request) {
  const { topic, count, difficulty, type } = await req.json();

  const prompt = `Generate ${count} ${difficulty} ${
    type === "mcq" ? "multiple choice" : "typed answer"
  } questions on "${topic}". Return ONLY a valid JSON object like this (do NOT include triple backticks):
  {
    questions: [
      { question: '...', type: 'mcq', options: ['a','b','c','d'], answer: 'b' }
    ]
  }`;
  console.log("prompt : ", prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
    // config: { maxOutputTokens: 500, temperature: 0.1 },
  });
  console.log("response", response);

  let textResponse: string | undefined =
    response.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("textResponse", textResponse);
  if (!textResponse) {
    return NextResponse.json(
      { error: "Failed to parse JSON from model" },
      { status: 400 }
    );
  }
  try {
    const cleanedText = textResponse
      .replace(/^```json\s*/i, "") // remove ```json (case-insensitive)
      .replace(/^```\s*/i, "") // remove ``` alone (if present)
      .replace(/```$/i, "") // remove ending ```
      .trim(); // remove any surrounding whitespace
    const json: QuizResponse = JSON.parse(cleanedText);
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to parse JSON from model" },
      { status: 400 }
    );
  }
}
