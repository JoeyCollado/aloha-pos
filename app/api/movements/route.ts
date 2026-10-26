// app/api/movements/route.ts
import { withOwner } from "@/lib/auth";
import { MovementCreateSchema } from "@/lib/models";
import { parseJson } from "@/lib/validation";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await parseJson(req, MovementCreateSchema);
    
    const client = await (await import("mongodb")).MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db(process.env.MONGODB_DB || "aloha_rmr");
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Create the movement record
        await db.collection("movements").insertOne({
          ...body,
          ownerId: owner.clerkUserId,
          createdAt: new Date(),
        }, { session });

        // 2. Update the item quantity
        const itemId = new ObjectId(body.itemId);
        const qtyChange = body.type === "in" ? body.quantity : body.type === "out" ? -body.quantity : 0;
        
        if (body.type === "adjustment") {
          // For adjustments, we set the exact count
          await db.collection("items").updateOne(
            { _id: itemId, ownerId: owner.clerkUserId },
            { $set: { quantity: body.quantity, updatedAt: new Date() } },
            { session }
          );
        } else {
          // For in/out, we increment/decrement
          await db.collection("items").updateOne(
            { _id: itemId, ownerId: owner.clerkUserId },
            { $inc: { quantity: qtyChange }, $set: { updatedAt: new Date() } },
            { session }
          );
        }
      });
      return Response.json({ ok: true });
    } finally {
      await session.endSession();
      await client.close();
    }
  });
}