import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const owner = await requireOwner();
  
  const sales = await (await collection("sales"))
    .find({ ownerId: owner.clerkUserId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Sales Reports</h1>
        <p className="muted text-sm">Recent transactions.</p>
      </header>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-3">Date</th>
              <th className="p-3">Sale #</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-[var(--muted)]">No sales yet.</td></tr>
            ) : sales.map((s) => (
              <tr key={String(s._id)} className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50">
                <td className="p-3">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-3 font-mono text-xs">{s.saleNumber}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs capitalize">{s.status}</span>
                </td>
                <td className="p-3 text-right font-medium">₱{s.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}