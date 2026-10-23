import { z } from "zod";
export interface Recipe {
  _id?: unknown;
  ownerId: string;
  productId: string;
  itemId: string;
  quantityRequired: number;
  createdAt: Date;
  updatedAt: Date;
}
export const RecipeCreateSchema = z.object({
  productId: z.string().min(1),
  itemId: z.string().min(1),
  quantityRequired: z.number().finite().positive("Must be greater than zero"),
});
export type RecipeCreate = z.infer<typeof RecipeCreateSchema>;