"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { EditItemModal } from "./EditItemModal";

export interface Item {
  _id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
}

interface InventoryListProps {
  initialItems: Item[];
  deleteItemAction: (formData: FormData) => void;
}

export function InventoryList({ initialItems, deleteItemAction }: InventoryListProps) {
  if (initialItems.length === 0) {
    return (
      <div className="card text-center py-12 text-[var(--muted)]">
        No items yet. Add your first ingredient above.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-4 font-medium">Item Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Unit Cost</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {initialItems.map((item) => (
                <motion.tr 
                  key={String(item._id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, backgroundColor: "#fee2e2" }}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={item.quantity <= item.reorderLevel ? "text-red-600 font-bold" : ""}>
                        {item.quantity} {item.unit}
                      </span>
                      {item.quantity <= item.reorderLevel && (
                        <FiAlertTriangle className="text-red-500" title="Low Stock" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">₱{item.unitCost.toFixed(2)}</td>
                  <td className="p-4 flex justify-end items-center gap-4">
                    <EditItemModal item={item} />
                    <form action={deleteItemAction}>
                      <input type="hidden" name="id" value={String(item._id)} />
                      <button type="submit" className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
                        <FiTrash2 size={18} />
                      </button>
                    </form>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        <AnimatePresence>
          {initialItems.map((item) => (
            <motion.div
              key={String(item._id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-4 flex flex-col gap-3 relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</span>
                </div>
                <div className="flex gap-2">
                  <EditItemModal item={item} />
                  <form action={deleteItemAction}>
                    <input type="hidden" name="id" value={String(item._id)} />
                    <button type="submit" className="text-red-500 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-2 pt-3 border-t border-[var(--border)]">
                <div>
                  <div className="text-xs text-gray-500">Current Stock</div>
                  <div className={`font-semibold ${item.quantity <= item.reorderLevel ? "text-red-600" : ""}`}>
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Unit Cost</div>
                  <div className="font-semibold">₱{item.unitCost.toFixed(2)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}