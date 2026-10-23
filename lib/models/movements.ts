import { z } from "zod";
export interface Movement {
  _id?: unknown;
  ownerId: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string;
  saleId?: string;
  createdAt: Date;
}
export const MovementCreateSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().finite().min(0),
  note: z.string().trim().max(500).optional(),
  saleId: z.string().min(1).optional(),
});
export type MovementCreate = z.infer<typeof MovementCreateSchema>;