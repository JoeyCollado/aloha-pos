"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface Sale {
  _id: string;
  saleNumber: string;
  total: number;
  createdAt: string;
}

export function SalesTable({ initialSales }: { initialSales: Sale[] }) {
  if (initialSales.length === 0) {
    return <div className="p-6 text-center text-[var(--muted)]">No sales yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-[var(--border)]">
          <tr className="text-left text-[var(--muted)]">
            <th className="p-3">Date</th>
            <th className="p-3">Sale #</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {initialSales.map((s) => (
              <motion.tr 
                key={String(s._id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50"
              >
                <td className="p-3 text-[var(--muted)]">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-mono text-xs">{s.saleNumber}</td>
                <td className="p-3 text-right font-bold text-[var(--fg)]">₱{s.total.toFixed(2)}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}