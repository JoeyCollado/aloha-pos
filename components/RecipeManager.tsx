"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiLink, FiPlus } from "react-icons/fi";
import { InventoryItem, Recipe } from "./ProductList";

interface RecipeManagerProps {
  productId: string;
  productName: string;
  items: InventoryItem[];
  existingRecipes: Recipe[];
}

export function RecipeManager({ productId, productName, items, existingRecipes }: RecipeManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      productId,
      itemId: formData.get("itemId"),
      quantityRequired: Number(formData.get("quantityRequired")),
    };

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to add recipe");
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-sm text-[var(--brand)] hover:text-[var(--brand-700)] font-medium flex items-center gap-1 transition-colors bg-orange-50 px-2 py-1 rounded"
      >
        <FiLink size={14} /> {existingRecipes.length} Items
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
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-left"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-[var(--fg)]">Recipe: {productName}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {existingRecipes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed rounded-lg">
                    No ingredients linked yet.
                  </p>
                ) : existingRecipes.map((r) => {
                  const item = items.find((i) => String(i._id) === r.itemId);
                  return (
                    <div key={r._id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg border border-[var(--border)]">
                      <span className="font-medium">{item?.name || "Unknown Item"}</span>
                      <span className="font-bold text-[var(--brand)] bg-white px-2 py-1 rounded shadow-sm">
                        {r.quantityRequired} {item?.unit}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={onSubmit} className="border-t border-[var(--border)] pt-4 space-y-3">
                <h4 className="font-medium text-sm">Add Ingredient</h4>
                <div>
                  <select name="itemId" className="input text-sm" required>
                    <option value="">Select ingredient...</option>
                    {items.map((i) => <option key={String(i._id)} value={String(i._id)}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <input name="quantityRequired" type="number" step="0.01" className="input text-sm" placeholder="Qty required per sale (e.g. 0.2)" required />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="btn w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? "Saving..." : <><FiPlus /> Add to Recipe</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}