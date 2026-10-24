"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiEdit2 } from "react-icons/fi";
import { Item } from "./InventoryList";

export function EditItemModal({ item }: { item: Item }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: String(item._id),
      name: formData.get("name"),
      category: formData.get("category"),
      unit: formData.get("unit"),
      quantity: Number(formData.get("quantity")),
      reorderLevel: Number(formData.get("reorderLevel")),
      unitCost: Number(formData.get("unitCost")),
    };

    const res = await fetch("/api/items/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setIsOpen(false);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to update");
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50 flex items-center gap-1 text-sm font-medium"
      >
        <FiEdit2 size={16} /> Edit
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-[var(--fg)]">Edit Item: {item.name}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Name</label>
                  <input name="name" className="input" defaultValue={item.name} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input name="category" className="input" defaultValue={item.category} required />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input name="unit" className="input" defaultValue={item.unit} required />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input name="quantity" type="number" step="0.01" className="input" defaultValue={item.quantity} required />
                </div>
                <div>
                  <label className="label">Reorder Level</label>
                  <input name="reorderLevel" type="number" step="0.01" className="input" defaultValue={item.reorderLevel} required />
                </div>
                <div className="col-span-2">
                  <label className="label">Unit Cost (₱)</label>
                  <input name="unitCost" type="number" step="0.01" className="input" defaultValue={item.unitCost} required />
                </div>

                {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}

                <div className="col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Cancel</button>
                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}