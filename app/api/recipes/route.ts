// app/api/recipes/route.ts
import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { RecipeCreateSchema } from "@/lib/models";
import { parseJson } from "@/lib/validation";

export async function GET(req: Request) {
  return withOwner(async (owner) => {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    
    const query: { ownerId: string; productId?: string } = { ownerId: owner.clerkUserId };
    if (productId) query.productId = productId;

    const recipes = await (await collection("recipes")).find(query).toArray();
    return Response.json(recipes);
  });
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await parseJson(req, RecipeCreateSchema);
    const doc = {
      ...body,
      ownerId: owner.clerkUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await (await collection("recipes")).insertOne(doc);
    return Response.json({ ok: true });
  });
}