"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecipeManager({ productId, productName, items, existingRecipes }: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
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
      setIsOpen(false);
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-ghost py-1 px-3 text-xs">
        Manage Recipe ({existingRecipes.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Recipe: {productName}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingRecipes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No ingredients linked yet.</p>
              ) : existingRecipes.map((r: any) => {
                const item = items.find((i: any) => String(i._id) === r.itemId);
                return (
                  <div key={r._id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{item?.name || "Unknown"}</span>
                    <span className="font-medium">{r.quantityRequired} {item?.unit}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={onSubmit} className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Add Ingredient</h4>
              <select name="itemId" className="input text-sm" required>
                <option value="">Select ingredient...</option>
                {items.map((i: any) => <option key={String(i._id)} value={String(i._id)}>{i.name}</option>)}
              </select>
              <input name="quantityRequired" type="number" step="0.01" className="input text-sm" placeholder="Qty required per sale (e.g. 0.2)" required />
              <button type="submit" className="btn w-full" disabled={loading}>Save Ingredient</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}