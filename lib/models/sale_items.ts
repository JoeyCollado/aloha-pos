import { z } from "zod";
export interface SaleItem {
  _id?: unknown;
  ownerId: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: Date;
}
export const SaleItemCreateSchema = z.object({
  saleId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().finite().min(0),
  lineTotal: z.number().finite().min(0),
});
export type SaleItemCreate = z.infer<typeof SaleItemCreateSchema>;