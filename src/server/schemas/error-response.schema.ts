import z from "zod";

/** Error response schema for 4xx/5xx (optional fields appear in development from sendResult) */
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
