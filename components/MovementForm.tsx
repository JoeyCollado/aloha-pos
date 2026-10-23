"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type MovementType = "in" | "out" | "adjustment";
type InventoryItem = {
  _id: string | number;
  name: string;
};

export function MovementForm({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<MovementType>("in");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      itemId: formData.get("itemId"),
      type: type,
      quantity: Number(formData.get("quantity")),
      note: formData.get("note") || undefined,
    };

    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to save movement");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="card grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
      <div className="col-span-2">
        <label className="label">Item</label>
        <select name="itemId" className="input" required>
          <option value="">Select an item...</option>
          {items.map(i => <option key={String(i._id)} value={String(i._id)}>{i.name}</option>)}
        </select>
      </div>
      
      <div className="col-span-1">
        <label className="label">Type</label>
        <select className="input" value={type} onChange={e => setType(e.target.value as MovementType)}>
          <option value="in">Stock In (+)</option>
          <option value="out">Stock Out (-)</option>
          <option value="adjustment">Adjust (Set)</option>
        </select>
      </div>

      <div className="col-span-1">
        <label className="label">Quantity</label>
        <input name="quantity" type="number" step="0.01" className="input" required defaultValue={1} />
      </div>
      
      <div className="col-span-1">
        <label className="label">Note</label>
        <input name="note" className="input" placeholder="e.g. Delivery" />
      </div>
      
      <div className="col-span-full flex justify-end mt-2">
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Saving..." : "Save Movement"}
        </button>
      </div>
      {error && <p className="col-span-full text-red-600 text-sm">{error}</p>}
    </form>
  );
}