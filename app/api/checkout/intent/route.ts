import { withOwner } from "@/lib/auth";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-09-30.endive" });

const IntentSchema = z.object({
  amount: z.number().positive(),
});

interface IntentResponse {
  clientSecret: string;
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await req.json();
    const parsed = IntentSchema.parse(body);

    // Stripe expects amounts in cents (e.g., ₱100.00 = 10000)
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(parsed.amount * 100),
      currency: "php",
      metadata: { ownerId: owner.clerkUserId },
      automatic_payment_methods: { enabled: true },
    });

    const response: IntentResponse = { 
      clientSecret: intent.client_secret! 
    };
    
    return Response.json(response);
  });
}