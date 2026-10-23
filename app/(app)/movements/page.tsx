import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { MovementForm } from "@/components/MovementForm";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const owner = await requireOwner();
  const items = await (await collection("items")).find({ ownerId: owner.clerkUserId }).sort({ name: 1 }).toArray();
  const movements = await (await collection("movements")).find({ ownerId: owner.clerkUserId }).sort({ createdAt: -1 }).limit(20).toArray();

  const itemMap = new Map(items.map((i) => [String(i._id), i.name]));

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Stock Movements</h1>
        <p className="muted text-sm">Record incoming deliveries, spoilage, or manual adjustments.</p>
      </header>

      <MovementForm items={items} />

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-3">Date</th>
              <th className="p-3">Item</th>
              <th className="p-3">Type</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-[var(--muted)]">No movements yet.</td></tr>
            ) : movements.map((m) => (
              <tr key={String(m._id)} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3">{new Date(m.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-medium">{itemMap.get(String(m.itemId)) || "Unknown"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${
                    m.type === 'in' ? 'bg-green-100 text-green-800' : 
                    m.type === 'out' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {m.type}
                  </span>
                </td>
                <td className="p-3">{m.quantity}</td>
                <td className="p-3 text-[var(--muted)]">{m.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}