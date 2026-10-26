// app/(app)/dashboard/page.tsx
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { FiShoppingBag, FiBox, FiAlertTriangle, FiActivity } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="p-8 text-center card max-w-md mx-auto mt-20">
          <FiAlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have the &quot;owner&quot; role.</p>
        </div>
      );
    }
    throw err;
  }

  const itemsCount = await (await collection("items")).countDocuments({ ownerId: owner.clerkUserId });
  const productsCount = await (await collection("products")).countDocuments({ ownerId: owner.clerkUserId });
  const lowStockItems = await (await collection("items"))
    .find({ ownerId: owner.clerkUserId, $expr: { $lte: ["$quantity", "$reorderLevel"] } })
    .toArray();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Here is the latest overview of your business.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <FiShoppingBag size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Products</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{productsCount}</div>
          </div>
        </div>

        <div className="card flex items-center gap-5">
          <div className="p-4 bg-brand-50 text-brand-500 rounded-xl">
            <FiBox size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Inventory</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{itemsCount}</div>
          </div>
        </div>

        <div className="card flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <FiAlertTriangle size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Low Stock</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{lowStockItems.length}</div>
          </div>
        </div>
      </div>

      {/* Low Stock Details Panel */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-(--border) bg-gray-50 flex items-center gap-2">
          <FiActivity className="text-(--brand-500)" />
          <h2 className="font-semibold text-gray-900">Items Requiring Attention</h2>
        </div>
        {lowStockItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            All inventory items are currently above their reorder levels.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-(--border) text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold">Current Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={String(item._id)} className="border-b border-(--border) last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  
                  {/* Clean formatting: 2 / 10 */}
                  <td className="px-6 py-4 font-bold text-red-600">
                    <div className="flex items-center gap-1.5">
                      <span>{item.quantity}</span>
                      <span className="text-sm font-normal text-gray-400">/ {item.unit}</span>
                    </div>
                  </td>
                  
                  {/* Clean formatting: 5 / 10 */}
                  <td className="px-6 py-4 text-right text-gray-500">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{item.reorderLevel}</span>
                      <span className="text-sm font-normal text-gray-400">/ {item.unit}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}