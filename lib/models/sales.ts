import { z } from "zod";
export interface Sale {
  _id?: unknown;
  ownerId: string;
  saleNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "void";
  createdAt: Date;
  updatedAt: Date;
}
export const SaleCreateSchema = z.object({
  subtotal: z.number().finite().min(0),
  tax: z.number().finite().min(0).default(0),
  total: z.number().finite().min(0),
});
export type SaleCreate = z.infer<typeof SaleCreateSchema>;