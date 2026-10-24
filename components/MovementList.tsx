"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiArrowDownLeft, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";

export interface Movement {
  _id: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string;
  createdAt: string;
}

export interface Item {
  _id: string;
  name: string;
}

interface MovementListProps {
  initialMovements: Movement[];
  items: Item[];
}

export function MovementList({ initialMovements, items }: MovementListProps) {
  const itemMap = new Map(items.map((i) => [String(i._id), i.name]));

  if (initialMovements.length === 0) {
    return <div className="card text-center py-12 text-[var(--muted)]">No movements logged yet.</div>;
  }

  const getIcon = (type: string) => {
    if (type === "in") return <FiArrowDownLeft className="text-green-600" />;
    if (type === "out") return <FiArrowUpRight className="text-red-600" />;
    return <FiRefreshCw className="text-yellow-600" />;
  };

  const getBadge = (type: string) => {
    if (type === "in") return "bg-green-100 text-green-800 border-green-200";
    if (type === "out") return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  return (
    <>
      <div className="hidden md:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Qty</th>
              <th className="p-4 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {initialMovements.map((m) => (
                <motion.tr 
                  key={String(m._id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50"
                >
                  <td className="p-4 text-[var(--muted)]">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{itemMap.get(String(m.itemId)) || "Unknown"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getBadge(m.type)}`}>
                      {getIcon(m.type)} {m.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{m.quantity}</td>
                  <td className="p-4 text-[var(--muted)]">{m.note || "—"}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        <AnimatePresence>
          {initialMovements.map((m) => (
            <motion.div key={String(m._id)} className="card p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="font-semibold">{itemMap.get(String(m.itemId)) || "Unknown"}</div>
                <div className="text-xs text-[var(--muted)]">{new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getBadge(m.type)}`}>
                  {getIcon(m.type)} {m.type}
                </span>
                <span className="font-bold text-lg">{m.quantity}</span>
              </div>
              {m.note && <div className="text-xs text-[var(--muted)] mt-1 italic">&quot;{m.note}&quot;</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}