import {NextRequest, NextResponse} from "next/server";
import OpenAI from "openai";

import {getCurrentUser} from "@/lib/auth";
import {saveVehicleImages, saveVehicleVideo} from "@/lib/uploads";

const ANALYSIS_PROMPT = `Ти — експерт з автомобілів і автомобільної фотографії для автодилерів. Уважно проаналізуй ВСІ надані фотографії та поверни структурований JSON.

═══ КРИТИЧНО: ПРАВИЛА ВИБОРУ ГОЛОВНОГО ФОТО ═══
Перший елемент photoOrder — це ГОЛОВНЕ ФОТО ОГОЛОШЕННЯ. Воно повинно бути НАЙКРАЩИМ зовнішнім видом автомобіля ЦІЛКОМ.

✅ ПІДХОДИТЬ для головного фото (першого):
- Автомобіль ЦІЛКОМ збоку (¾ спереду або ззаду) — найкращий варіант
- Фото всього автомобіля спереду або ззаду
- Студійне фото на чистому фоні

❌ КАТЕГОРИЧНО НЕ ПІДХОДИТЬ для першого фото:
- Динаміки, сабвуфери, аудіосистема
- Деталі торпедо, кнопки, клімат-контроль
- Руль крупно, педалі, важіль КПП
- Колісні диски крупно або шини
- Логотипи, емблеми, значки
- Пороги, ручки дверей, замки
- Будь-яка ДЕТАЛЬ без повного вигляду авто
- Номерний знак крупно
- Двигун або підкапотний простір
- Фото салону крупно (тільки якщо немає жодного зовнішнього фото)

Порядок для photoOrder:
1. Найкраще ЗОВНІШНЄ фото (авто цілком, ¾ або збоку) ← ПЕРШИЙ
2. Інші зовнішні фото з різних боків
3. Фото авто спереду і ззаду
4. Загальний вигляд салону
5. Панель приладів, торпедо
6. Задній ряд
7. Деталі (диски, двигун, специфічне обладнання)
8. Дуже крупні деталі (динаміки, кнопки тощо) ← ОСТАННІ

═══ ФОРМАТ ВІДПОВІДІ ═══
Поверни ТІЛЬКИ валідний JSON, без markdown, без пояснень:
{
  "title": "Повна назва у форматі: Марка Модель Рік Комплектація (наприклад: BMW X5 xDrive30d 2021 M Sport)",
  "make": "Марка автомобіля як написано на кузові (BMW, Volkswagen, Škoda, Mercedes-Benz тощо)",
  "model": "Модель і покоління (X5 G05, Golf 8, Octavia A8 тощо)",
  "year": 2021,
  "mileageKm": null,
  "fuel": "ЛИШЕ одне з: Diesel, Petrol, Hybrid, Electric, LPG",
  "transmission": "ЛИШЕ одне з: Automatic, Manual",
  "priceCzk": null,
  "description": "Детальний опис УКРАЇНСЬКОЮ: колір, стан кузова, салон, помітне обладнання та опції, особливості, переваги для покупця",
  "vinLast6": null,
  "photoOrder": [0, 2, 1, 3]
}

Правила:
- photoOrder — масив індексів фото (0-based). ПЕРШИЙ — найкраще зовнішнє фото авто ЦІЛКОМ. Включай ВСІ індекси від 0 до N-1
- Для fuel та transmission використовуй ТІЛЬКИ вказані англійські значення
- Якщо значення невідоме — пиши null (без лапок)
- Рік, пробіг, ціна — числа без лапок або null
- Опис пиши детально, 2-4 речення українською мовою
`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.platformRole) {
    return NextResponse.json({error: "Немає доступу"}, {status: 401});
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {error: "OPENAI_API_KEY не налаштовано на сервері"},
      {status: 503}
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({error: "Помилка читання файлів"}, {status: 400});
  }

  const rawFiles = formData.getAll("images");
  const imageFiles = rawFiles
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 30);

  if (!imageFiles.length) {
    return NextResponse.json({error: "Зображень не знайдено"}, {status: 400});
  }

  const rawVideo = formData.get("video");
  const videoFile =
    rawVideo instanceof File && rawVideo.size > 0 ? rawVideo : null;

  // Save images + video in parallel with GPT analysis
  const [uploadedUrls, uploadedVideoUrl, gptResult] = await Promise.all([
    saveVehicleImages(imageFiles),
    videoFile ? saveVehicleVideo(videoFile) : Promise.resolve(undefined),
    analyzeWithGPT(apiKey, imageFiles),
  ]);

  // Apply GPT's recommended photo order to the saved URLs
  const rawOrder = gptResult.photoOrder;
  const orderedUrls = applyPhotoOrder(uploadedUrls, rawOrder);

  // Remove photoOrder from the extracted data (it's internal)
  const {photoOrder: _po, ...extracted} = gptResult;
  void _po;

  return NextResponse.json({
    uploadedUrls: orderedUrls,
    uploadedVideoUrl: uploadedVideoUrl ?? null,
    extracted,
  });
}

function applyPhotoOrder(
  urls: string[],
  rawOrder: unknown
): string[] {
  if (!Array.isArray(rawOrder) || rawOrder.length === 0) return urls;
  const order = rawOrder.filter(
    (i): i is number => typeof i === "number" && i >= 0 && i < urls.length
  );
  if (order.length === 0) return urls;

  // Build reordered array; append any URLs not mentioned in order at the end
  const mentioned = new Set(order);
  const remainder = urls
    .map((_, i) => i)
    .filter((i) => !mentioned.has(i));
  return [...order, ...remainder].map((i) => urls[i]!);
}

async function analyzeWithGPT(
  apiKey: string,
  files: File[]
): Promise<Record<string, unknown>> {
  const openai = new OpenAI({apiKey});

  // Send up to 20 images to GPT — more context = better photo ordering
  const filesToAnalyze = files.slice(0, 20);

  const imageContents = await Promise.all(
    filesToAnalyze.map(async (file, idx) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      return {
        idx,
        content: {
          type: "image_url" as const,
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: "auto" as const, // "auto" = better quality analysis for correct main photo selection
          },
        },
      };
    })
  );

  // Add index labels to help GPT reference photos by number
  const promptWithCount = ANALYSIS_PROMPT.replace(
    '"photoOrder": [0, 2, 1, 3]',
    `"photoOrder": [0, 2, 1, 3] — усього ${filesToAnalyze.length} фото (індекси 0–${filesToAnalyze.length - 1})`
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {type: "text", text: promptWithCount},
            ...imageContents.map((c) => c.content),
          ],
        },
      ],
      max_tokens: 1600,
      response_format: {type: "json_object"},
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content);
  } catch (err) {
    console.error("[analyze-vehicle] OpenAI error:", err);
    return {};
  }
}
