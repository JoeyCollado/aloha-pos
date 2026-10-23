import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { RecipeManager } from "@/components/RecipeManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const owner = await requireOwner();
  const products = await (await collection("products")).find({ ownerId: owner.clerkUserId }).sort({ name: 1 }).toArray();
  const items = await (await collection("items")).find({ ownerId: owner.clerkUserId }).sort({ name: 1 }).toArray();
  
  // Fetch all existing recipes to display
  const recipes = await (await collection("recipes")).find({ ownerId: owner.clerkUserId }).toArray();

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Products (Menu)</h1>
      </header>

      <ProductForm />

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-3">Product Name</th>
              <th className="p-3">Price</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={String(p._id)} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">₱{p.price.toFixed(2)}</td>
                <td className="p-3 text-right">
                  <RecipeManager 
                    productId={String(p._id)} 
                    productName={p.name} 
                    items={items} 
                    existingRecipes={recipes.filter(r => r.productId === String(p._id))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}