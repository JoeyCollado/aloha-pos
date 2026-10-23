import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You are signed in, but you do not have the "owner" role.</p>
          <p className="text-gray-600 mt-2">Please go to the Clerk Dashboard, add {"{\"role\": \"owner\"}"} to your Public Metadata, and sign out and back in.</p>
        </div>
      );
    }
    throw err;
  }

  const itemsCount = await (await collection("items")).countDocuments({ ownerId: owner.clerkUserId });
  const productsCount = await (await collection("products")).countDocuments({ ownerId: owner.clerkUserId });
  const lowStock = await (await collection("items"))
    .find({ ownerId: owner.clerkUserId, $expr: { $lte: ["$quantity", "$reorderLevel"] } })
    .toArray();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="muted text-sm">Welcome back to Aloha POS.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="muted text-xs uppercase font-semibold">Products</div>
          <div className="text-3xl font-bold mt-2">{productsCount}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-semibold">Inventory Items</div>
          <div className="text-3xl font-bold mt-2">{itemsCount}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-semibold">Low Stock Alerts</div>
          <div className="text-3xl font-bold mt-2 text-red-600">{lowStock.length}</div>
        </div>
      </div>
    </div>
  );
}