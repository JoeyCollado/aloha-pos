// app(app)/checkout/page.tsx
import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { CheckoutClient } from "@/components/CheckoutClient";
import { StripeProvider } from "@/components/StripeProvider";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const owner = await requireOwner();
  const products = await (await collection("products"))
    .find({ ownerId: owner.clerkUserId, active: true })
    .sort({ name: 1 })
    .toArray();

  return (
    <StripeProvider>
      <CheckoutClient initialProducts={JSON.parse(JSON.stringify(products))} />
    </StripeProvider>
  );
}