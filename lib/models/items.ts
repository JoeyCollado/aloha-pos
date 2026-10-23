import { z } from "zod";
export interface Item {
  _id?: unknown;
  ownerId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  createdAt: Date;
  updatedAt: Date;
}
const nonNegative = z.number().finite().min(0, "Must be zero or greater");
export const ItemCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  unit: z.string().trim().min(1).max(20),
  quantity: nonNegative,
  reorderLevel: nonNegative,
  unitCost: nonNegative,
});
export const ItemUpdateSchema = ItemCreateSchema.partial();
export type ItemCreate = z.infer<typeof ItemCreateSchema>;
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>;