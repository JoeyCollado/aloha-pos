import { z } from "zod";
export interface User {
  _id?: unknown;
  clerkUserId: string;
  email: string;
  role: "owner";
  createdAt: Date;
  updatedAt: Date;
}
export const UserCreateSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  role: z.literal("owner").default("owner"),
});
export type UserCreate = z.infer<typeof UserCreateSchema>;