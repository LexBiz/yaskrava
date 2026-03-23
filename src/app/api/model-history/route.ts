import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function GET(req: NextRequest) {
  const {searchParams} = req.nextUrl;
  const make = searchParams.get("make")?.trim();
  const model = searchParams.get("model")?.trim();
  const year = searchParams.get("year")?.trim();
  const locale = searchParams.get("locale") ?? "uk";

  if (!make || !model) {
    return NextResponse.json({error: "make and model are required"}, {status: 400});
  }

  const langInstruction =
    locale === "cs" ? "Odpověz v češtině." :
    locale === "en" ? "Answer in English." :
    "Відповідай українською мовою.";

  const prompt = `${langInstruction}
Write a short, engaging 2-3 sentence summary about the ${make} ${model}${year ? ` (${year} generation)` : ""}.
Focus on: what makes this model special, its key strengths, and who it's best suited for.
Keep it conversational, informative, and under 60 words. No bullet points, just flowing text.`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{role: "user", content: prompt}],
      max_tokens: 150,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({text}, {
      headers: {"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"},
    });
  } catch {
    return NextResponse.json({error: "Failed to generate history"}, {status: 500});
  }
}
