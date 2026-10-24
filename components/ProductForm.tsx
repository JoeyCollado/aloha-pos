"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";

export function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      active: true,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to add product");
    }
    setLoading(false);
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit} 
      className="card grid grid-cols-2 md:grid-cols-4 gap-3 items-end"
    >
      <div className="col-span-2">
        <label className="label text-xs">Product Name</label>
        <input name="name" className="input text-sm" required placeholder="e.g. Wakito's Pepperoni" />
      </div>
      <div className="col-span-1">
        <label className="label text-xs">Category</label>
        <input name="category" className="input text-sm" required placeholder="Pizza" />
      </div>
      <div className="col-span-1">
        <label className="label text-xs">Price (₱)</label>
        <input name="price" type="number" step="0.01" className="input text-sm" required defaultValue={0} />
      </div>
      
      <div className="col-span-full flex justify-end mt-2">
        <button type="submit" className="btn flex items-center gap-2 " disabled={loading}>
          {loading ? "Adding..." : <><FiPlus /> <p className="text-black">Add Product</p></>}
        </button>
      </div>
      {error && <p className="col-span-full text-red-600 text-sm mt-1">{error}</p>}
    </motion.form>
  );
}