import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { FiShoppingBag } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const owner = await requireOwner();
  const products = await (await collection("products"))
    .find({ ownerId: owner.clerkUserId })
    .sort({ name: 1 })
    .toArray();
  const items = await (await collection("items"))
    .find({ ownerId: owner.clerkUserId })
    .sort({ name: 1 })
    .toArray();
  const recipes = await (await collection("recipes"))
    .find({ ownerId: owner.clerkUserId })
    .toArray();

  // Server Action for deletion
  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const owner = await requireOwner();
    
    await (await collection("products")).deleteOne({ 
      _id: new ObjectId(id), 
      ownerId: owner.clerkUserId 
    });
    await (await collection("recipes")).deleteMany({ 
      productId: id, 
      ownerId: owner.clerkUserId 
    });
    
    revalidatePath("/products");
  }

  // Serialize for Client Component
  const plainProducts = JSON.parse(JSON.stringify(products));
  const plainItems = JSON.parse(JSON.stringify(items));
  const plainRecipes = JSON.parse(JSON.stringify(recipes));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FiShoppingBag className="text-[var(--brand)]" /> Products (Menu)
          </h1>
          <p className="muted text-sm mt-1">Manage items sold at the POS.</p>
        </div>
      </header>

      <ProductForm />

      <ProductList 
        initialProducts={plainProducts} 
        items={plainItems}
        recipes={plainRecipes}
        deleteProductAction={deleteProduct} 
      />
    </div>
  );
}