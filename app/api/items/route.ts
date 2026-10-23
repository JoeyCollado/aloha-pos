import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { ItemCreateSchema } from "@/lib/models";
import { parseJson } from "@/lib/validation";

export async function GET() {
  return withOwner(async (owner) => {
    const items = await (await collection("items"))
      .find({ ownerId: owner.clerkUserId })
      .sort({ name: 1 })
      .toArray();
    return Response.json(items);
  });
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await parseJson(req, ItemCreateSchema);
    const doc = {
      ...body,
      ownerId: owner.clerkUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await (await collection("items")).insertOne(doc);
    return Response.json({ ok: true, id: res.insertedId });
  });
}