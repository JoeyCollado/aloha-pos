import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { MovementForm } from "@/components/MovementForm";
import { MovementList } from "@/components/MovementList";
import { FiActivity } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const owner = await requireOwner();
  const items = await (await collection("items")).find({ ownerId: owner.clerkUserId }).sort({ name: 1 }).toArray();
  const movements = await (await collection("movements")).find({ ownerId: owner.clerkUserId }).sort({ createdAt: -1 }).limit(30).toArray();

  const plainItems = JSON.parse(JSON.stringify(items));
  const plainMovements = JSON.parse(JSON.stringify(movements));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FiActivity className="text-[var(--brand)]" /> Stock Movements
        </h1>
        <p className="muted text-sm mt-1">Record incoming deliveries, spoilage, or manual adjustments.</p>
      </header>

      <MovementForm items={plainItems} />
      <MovementList initialMovements={plainMovements} items={plainItems} />
    </div>
  );
}