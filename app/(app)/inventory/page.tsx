import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { InventoryForm } from "@/components/InventoryForm";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const owner = await requireOwner();
  const items = await (await collection("items")).find({ ownerId: owner.clerkUserId }).sort({ name: 1 }).toArray();

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="muted text-sm">Manage raw ingredients, packaging, and supplies.</p>
      </header>

      <InventoryForm />

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Reorder At</th>
              <th className="p-3">Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-[var(--muted)]">No items yet.</td></tr>
            ) : items.map((item) => (
              <tr key={String(item._id)} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">
                  <span className={item.quantity <= item.reorderLevel ? "text-red-600 font-bold" : ""}>
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="p-3">{item.reorderLevel} {item.unit}</td>
                <td className="p-3">₱{item.unitCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}