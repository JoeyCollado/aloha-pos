import { withOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { z } from "zod";

const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
  paymentMethod: z.enum(["cash", "card", "ewallet"]),
});

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await req.json();
    const parsed = CheckoutSchema.parse(body);

    const client = await (await import("mongodb")).MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db(process.env.MONGODB_DB || "aloha_rmr");
    const session = client.startSession();

    try {
      let resultData: any = null;

      await session.withTransaction(async () => {
        // 1. Fetch products securely from DB to get real prices
        const productIds = parsed.items.map(i => new ObjectId(i.productId));
        const products = await db.collection("products")
          .find({ _id: { $in: productIds }, ownerId: owner.clerkUserId })
          .toArray();

        const productMap = new Map(products.map(p => [String(p._id), p]));

        // 2. Recalculate totals
        let total = 0;
        const saleItems = [];

        for (const item of parsed.items) {
          const product = productMap.get(item.productId);
          if (!product || !product.active) throw new Error(`Product not found or inactive`);
          
          const lineTotal = product.price * item.quantity;
          total += lineTotal;
          
          saleItems.push({
            ownerId: owner.clerkUserId,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal,
            createdAt: new Date(),
          });
        }

        // 3. Generate Sale Header
        const saleNumber = `SALE-${Date.now()}`;
        const saleDoc = {
          ownerId: owner.clerkUserId,
          saleNumber,
          subtotal: total,
          tax: 0,
          total,
          status: "paid",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const saleRes = await db.collection("sales").insertOne(saleDoc, { session });
        const saleId = String(saleRes.insertedId);

        // 4. Save Sale Items
        const finalSaleItems = saleItems.map(si => ({ ...si, saleId }));
        await db.collection("sale_items").insertMany(finalSaleItems, { session });

        // 5. Save Payment
        await db.collection("payments").insertOne({
          ownerId: owner.clerkUserId,
          saleId,
          method: parsed.paymentMethod,
          amount: total,
          status: "succeeded",
          idempotencyKey: `pay_${saleNumber}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { session });

        // 6. Deduct Stock (if recipes exist)
        // For each item sold, find its recipe and deduct ingredients
        for (const item of parsed.items) {
          const recipes = await db.collection("recipes")
            .find({ ownerId: owner.clerkUserId, productId: item.productId })
            .toArray();

          for (const recipe of recipes) {
            const qtyToDeduct = recipe.quantityRequired * item.quantity;
            
            // Deduct from items
            await db.collection("items").updateOne(
              { _id: new ObjectId(recipe.itemId), ownerId: owner.clerkUserId },
              { 
                $inc: { quantity: -qtyToDeduct },
                $set: { updatedAt: new Date() } 
              },
              { session }
            );

            // Log the movement
            await db.collection("movements").insertOne({
              ownerId: owner.clerkUserId,
              itemId: recipe.itemId,
              type: "out",
              quantity: qtyToDeduct,
              note: `Auto-deducted from sale ${saleNumber}`,
              saleId: saleId,
              createdAt: new Date(),
            }, { session });
          }
        }

        resultData = { saleId, saleNumber, total, saleItems: finalSaleItems };
      });

      return Response.json({ ok: true, ...resultData });
    } catch (err: any) {
      return Response.json({ error: err.message || "Transaction failed" }, { status: 500 });
    } finally {
      await session.endSession();
      await client.close();
    }
  });
}