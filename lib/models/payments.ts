import { z } from "zod";
export interface Payment {
  _id?: unknown;
  ownerId: string;
  saleId: string;
  method: "cash" | "card" | "ewallet";
  amount: number;
  providerReference?: string;
  status: "pending" | "succeeded" | "failed";
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}
export const PaymentCreateSchema = z.object({
  saleId: z.string().min(1),
  method: z.enum(["cash", "card", "ewallet"]),
  amount: z.number().finite().min(0),
  providerReference: z.string().optional(),
  status: z.enum(["pending", "succeeded", "failed"]).default("pending"),
  idempotencyKey: z.string().min(1),
});
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;