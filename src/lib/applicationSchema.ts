import {z} from "zod";

export const calculatorSnapshotSchema = z
  .object({
    priceCzk: z.number().int().positive(),
    downPaymentCzk: z.number().int().nonnegative(),
    termMonths: z.number().int().positive(),
    aprPercent: z.number().nonnegative(),
    residualCzk: z.number().int().nonnegative(),
    monthlyFeesCzk: z.number().int().nonnegative(),
    monthlyPaymentCzk: z.number().int().nonnegative(),
    monthlyTotalCzk: z.number().int().nonnegative(),
  })
  .passthrough();

export const applicationCreateSchema = z
  .object({
    locale: z.string().min(2).max(10),
    sourcePath: z.string().max(200).optional(),

    fullName: z.string().min(2).max(120),
    phone: z.string().min(5).max(40).optional(),
    email: z.string().email().max(200).optional(),
    city: z.string().max(120).optional(),
    message: z.string().max(5000).optional(),

    topic: z
      .enum(["LEASING", "FUEL", "VEHICLE", "CAREER", "OTHER"])
      .optional()
      .default("LEASING"),

    consent: z.literal(true),
    calculator: calculatorSnapshotSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.phone && !val.email) {
      ctx.addIssue({
        code: "custom",
        message: "Provide at least phone or email",
        path: ["phone"],
      });
    }
  });

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type CalculatorSnapshot = z.infer<typeof calculatorSnapshotSchema>;

