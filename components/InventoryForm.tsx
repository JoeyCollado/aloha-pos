"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryForm() {
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
      unit: formData.get("unit"),
      quantity: Number(formData.get("quantity")),
      reorderLevel: Number(formData.get("reorderLevel")),
      unitCost: Number(formData.get("unitCost")),
    };

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to add item");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="card grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
      <div className="col-span-2">
        <label className="label">Name</label>
        <input name="name" className="input" required placeholder="e.g. Mozzarella" />
      </div>
      <div className="col-span-1">
        <label className="label">Category</label>
        <input name="category" className="input" required placeholder="Cheese" />
      </div>
      <div className="col-span-1">
        <label className="label">Unit</label>
        <input name="unit" className="input" required placeholder="kg" />
      </div>
      <div className="col-span-1">
        <label className="label">Qty</label>
        <input name="quantity" type="number" step="0.01" className="input" required defaultValue={0} />
      </div>
      <div className="col-span-1">
        <label className="label">Reorder</label>
        <input name="reorderLevel" type="number" step="0.01" className="input" required defaultValue={5} />
      </div>
      <div className="col-span-1">
        <label className="label">Cost (₱)</label>
        <input name="unitCost" type="number" step="0.01" className="input" required defaultValue={0} />
      </div>
      
      <div className="col-span-full flex justify-end mt-2">
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Adding..." : "Add Item"}
        </button>
      </div>
      {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
    </form>
  );
}