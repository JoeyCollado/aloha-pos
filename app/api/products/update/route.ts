import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { ProductUpdateSchema } from "@/lib/models";
import { z } from "zod";

const UpdateSchema = ProductUpdateSchema.extend({ id: z.string() });

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await req.json();
    const { id, ...updateData } = UpdateSchema.parse(body);

    await (await collection("products")).updateOne(
      { _id: new ObjectId(id), ownerId: owner.clerkUserId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return Response.json({ ok: true });
  });
}