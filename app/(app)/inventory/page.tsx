// app/(app)/inventory/page.tsx
import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { InventoryForm } from "@/components/InventoryForm";
import { InventoryList } from "@/components/InventoryList";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { FiBox } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const owner = await requireOwner();
  const items = await (await collection("items"))
    .find({ ownerId: owner.clerkUserId })
    .sort({ name: 1 })
    .toArray();

  // Server Action for deletion
  async function deleteItem(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const owner = await requireOwner();
    
    await (await collection("items")).deleteOne({ 
      _id: new ObjectId(id), 
      ownerId: owner.clerkUserId 
    });
    
    revalidatePath("/inventory");
  }

  // Pass the plain JSON to the client component for animations
  const plainItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FiBox className="text-(--brand)" /> Inventory
          </h1>
          <p className="muted text-sm mt-1">Manage raw ingredients, packaging, and supplies.</p>
        </div>
      </header>

      <InventoryForm />

      {/* 
        We pass the items to a Client Component so we can use Framer Motion 
        to animate additions and deletions.
      */}
      <InventoryList 
        initialItems={plainItems} 
        deleteItemAction={deleteItem} 
      />
    </div>
  );
}