import { z } from "zod";
export interface DailyNote {
  _id?: unknown;
  ownerId: string;
  date: string;
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "other";
  remarks?: string;
  orderCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");
export const DailyNoteCreateSchema = z.object({
  date: dateString,
  weather: z.enum(["sunny", "cloudy", "rainy", "stormy", "other"]),
  remarks: z.string().trim().max(500).optional(),
  orderCount: z.number().int().min(0).optional(),
});
export type DailyNoteCreate = z.infer<typeof DailyNoteCreateSchema>;