import { z } from "zod";
export interface Product {
  _id?: unknown;
  ownerId: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const price = z.number().finite().min(0, "Price must be zero or greater");
export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  price,
  active: z.boolean().default(true),
});
export const ProductUpdateSchema = ProductCreateSchema.partial();
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;