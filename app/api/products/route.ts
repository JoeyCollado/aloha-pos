import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { ProductCreateSchema } from "@/lib/models";
import { parseJson } from "@/lib/validation";

export async function GET() {
  return withOwner(async (owner) => {
    const products = await (await collection("products"))
      .find({ ownerId: owner.clerkUserId })
      .sort({ name: 1 })
      .toArray();
    return Response.json(products);
  });
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await parseJson(req, ProductCreateSchema);
    const doc = {
      ...body,
      ownerId: owner.clerkUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await (await collection("products")).insertOne(doc);
    return Response.json({ ok: true, id: res.insertedId });
  });
}