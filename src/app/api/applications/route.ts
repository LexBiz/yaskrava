import {NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";
import {applicationCreateSchema} from "@/lib/applicationSchema";
import {Prisma} from "@/generated/prisma/client";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON"}, {status: 400});
  }

  const parsed = applicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {error: "Validation failed", details: parsed.error.flatten()},
      {status: 400}
    );
  }

  const data = parsed.data;

  const created = await prisma.application.create({
    data: {
      locale: data.locale,
      sourcePath: data.sourcePath,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      city: data.city,
      message: data.message,
      consent: true,
      calculator: data.calculator
        ? (data.calculator as unknown as Prisma.InputJsonValue)
        : undefined,
      topic: data.topic,
    },
  });

  return NextResponse.json({id: created.id});
}

