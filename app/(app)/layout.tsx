import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b md:border-b-0 md:border-r border-[var(--border)] p-4 md:min-h-screen bg-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Aloha POS</div>
            <div className="text-xs text-[var(--muted)]">Cafés & Pizza</div>
          </div>
          <UserButton />
        </div>
        <Nav />
      </aside>
      <main className="p-4 md:p-8 bg-[var(--bg)]">{children}</main>
    </div>
  );
}