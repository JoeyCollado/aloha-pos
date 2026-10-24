"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiEdit2 } from "react-icons/fi";

interface EditProductModalProps {
  product: {
    _id: string;
    name: string;
    category: string;
    price: number;
    active: boolean;
  };
}

export function EditProductModal({ product }: EditProductModalProps) {
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
      id: String(product._id),
      name: formData.get("name"),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      active: formData.get("active") === "true",
    };

    const res = await fetch("/api/products/update", {
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
                <h3 className="font-semibold text-lg text-[var(--fg)]">Edit Product: {product.name}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Name</label>
                  <input name="name" className="input" defaultValue={product.name} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input name="category" className="input" defaultValue={product.category} required />
                </div>
                <div>
                  <label className="label">Price (₱)</label>
                  <input name="price" type="number" step="0.01" className="input" defaultValue={product.price} required />
                </div>
                <div className="col-span-2">
                  <label className="label">Status</label>
                  <select name="active" className="input" defaultValue={String(product.active)}>
                    <option value="true">Active (Available for sale)</option>
                    <option value="false">Inactive (Hidden from POS)</option>
                  </select>
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