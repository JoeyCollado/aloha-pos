import { withOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
  paymentMethod: z.enum(["cash", "card", "ewallet"]),
  paymentIntentId: z.string().optional(), // Added for Stripe
});

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await req.json();
    const parsed = CheckoutSchema.parse(body);

    // 1. If card, verify the Stripe payment succeeded
    let stripeRef = undefined;
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
      let resultData: any = null;

      await session.withTransaction(async () => {
        // ... (Keep the existing product fetching and total calculation code) ...
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

        await db.collection("sale_items").insertMany(
          saleItems.map(si => ({ ...si, saleId })), { session }
        );

        await db.collection("payments").insertOne({
          ownerId: owner.clerkUserId,
          saleId,
          method: parsed.paymentMethod,
          amount: total,
          status: "succeeded",
          providerReference: stripeRef, // Save Stripe ID
          idempotencyKey: `pay_${saleNumber}`,
          createdAt: new Date(), updatedAt: new Date(),
        }, { session });

        // ... (Keep the existing recipe deduction logic here) ...
        
        resultData = { saleId, saleNumber, total, saleItems };
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