// app/api/checkout/route.ts
import { withOwner } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-09-30.endive" });

const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
  paymentMethod: z.enum(["cash", "card", "ewallet"]),
  paymentIntentId: z.string().optional(),
});

// Define the shape of our successful response
interface CheckoutResponse {
  ok: boolean;
  saleId: string;
  saleNumber: string;
  total: number;
  saleItems: {
    ownerId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    createdAt: Date;
    saleId?: string;
  }[];
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await req.json();
    const parsed = CheckoutSchema.parse(body);

    // 1. If card, verify the Stripe payment succeeded
    let stripeRef: string | undefined = undefined;
    if (parsed.paymentMethod === "card") {
      if (!parsed.paymentIntentId) throw new Error("Missing payment intent");
      const intent = await stripe.paymentIntents.retrieve(parsed.paymentIntentId);
      if (intent.status !== "succeeded") throw new Error("Payment not successful");
      stripeRef = intent.id;
    }

    const client = await (await import("mongodb")).MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db(process.env.MONGODB_DB || "aloha_rmr");
    const session = client.startSession();

    try {
      // 2. Type the result data correctly
      let resultData: CheckoutResponse | null = null;

      await session.withTransaction(async () => {
        // Product fetching and total calculation
        const productIds = parsed.items.map(i => new ObjectId(i.productId));
        const products = await db.collection("products")
          .find({ _id: { $in: productIds }, ownerId: owner.clerkUserId })
          .toArray();
        const productMap = new Map(products.map(p => [String(p._id), p]));

        let total = 0;
        const saleItems = [];
        
        for (const item of parsed.items) {
          const product = productMap.get(item.productId);
          if (!product || !product.active) throw new Error(`Product not found`);
          
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

        // Save Sale Header, Items, and Payment
        const saleNumber = `SALE-${Date.now()}`;
        const saleRes = await db.collection("sales").insertOne({
          ownerId: owner.clerkUserId,
          saleNumber, subtotal: total, tax: 0, total, status: "paid",
          createdAt: new Date(), updatedAt: new Date(),
        }, { session });
        
        const saleId = String(saleRes.insertedId);

        const finalSaleItems = saleItems.map(si => ({ ...si, saleId }));
        await db.collection("sale_items").insertMany(finalSaleItems, { session });

        await db.collection("payments").insertOne({
          ownerId: owner.clerkUserId,
          saleId,
          method: parsed.paymentMethod,
          amount: total,
          status: "succeeded",
          providerReference: stripeRef,
          idempotencyKey: `pay_${saleNumber}`,
          createdAt: new Date(), updatedAt: new Date(),
        }, { session });

        // Deduct Stock (Recipe logic)
        for (const item of parsed.items) {
          const recipes = await db.collection("recipes")
            .find({ ownerId: owner.clerkUserId, productId: item.productId })
            .toArray();

          for (const recipe of recipes) {
            const qtyToDeduct = recipe.quantityRequired * item.quantity;
            
            await db.collection("items").updateOne(
              { _id: new ObjectId(recipe.itemId), ownerId: owner.clerkUserId },
              { $inc: { quantity: -qtyToDeduct }, $set: { updatedAt: new Date() } },
              { session }
            );

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

        resultData = { 
          ok: true, 
          saleId, 
          saleNumber, 
          total, 
          saleItems: finalSaleItems 
        };
      });

      return Response.json(resultData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      return Response.json({ error: message }, { status: 500 });
    } finally {
      await session.endSession();
      await client.close();
    }
  });
}