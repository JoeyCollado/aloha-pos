import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { FiDollarSign, FiFileText, FiTrendingUp } from "react-icons/fi";
import { SalesTable } from "@/components/SalesTable";

export const dynamic = "force-dynamic";

// 1. Define the strict type for the Best Sellers aggregation result
interface BestSeller {
  _id: string; // The grouped product name
  qtySold: number;
  revenue: number;
}

export default async function SalesPage() {
  const owner = await requireOwner();
  const ownerId = owner.clerkUserId;
  
  const sales = await (await collection("sales"))
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const totalsAgg = await (await collection("sales")).aggregate([
    { $match: { ownerId, status: "paid" } },
    { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
  ]).toArray();
  
  const totalRevenue = totalsAgg[0]?.revenue ?? 0;
  const totalOrders = totalsAgg[0]?.count ?? 0;

  const bestSellersAgg = await (await collection("saleItems")).aggregate([
    { $match: { ownerId } },
    { $group: { _id: "$productName", qtySold: { $sum: "$quantity" }, revenue: { $sum: "$lineTotal" } } },
    { $sort: { qtySold: -1 } },
    { $limit: 5 }
  ]).toArray();

  // 2. Cast to the strict interface instead of using any
  const plainSales = JSON.parse(JSON.stringify(sales));
  const plainBestSellers = JSON.parse(JSON.stringify(bestSellersAgg)) as BestSeller[];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl font-semibold">Sales Reports</h1>
        <p className="muted text-sm mt-1">Overview of your business performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <FiDollarSign size={28} />
          </div>
          <div>
            <div className="muted text-xs uppercase font-semibold">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">₱{totalRevenue.toFixed(2)}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FiFileText size={28} />
          </div>
          <div>
            <div className="muted text-xs uppercase font-semibold">Total Orders</div>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-(--border) bg-gray-50 flex items-center gap-2">
            <FiTrendingUp className="text-(--brand)" />
            <h2 className="font-semibold">Best Sellers</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-(--border)">
              <tr className="text-left text-(--muted)">
                <th className="p-3">Product</th>
                <th className="p-3 text-right">Qty Sold</th>
                <th className="p-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {plainBestSellers.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-(--muted)">No data yet.</td></tr>
              ) : plainBestSellers.map((b) => ( // 3. Removed 'any'
                <tr key={b._id} className="border-b border-(--border) last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{b._id}</td>
                  <td className="p-3 text-right">{b.qtySold}</td>
                  <td className="p-3 text-right font-medium text-green-600">₱{b.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Transactions */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-(--border) bg-gray-50 flex items-center gap-2">
            <FiFileText className="text-(--brand)" />
            <h2 className="font-semibold">Recent Transactions</h2>
          </div>
          <SalesTable initialSales={plainSales} />
        </div>
      </div>
    </div>
  );
}