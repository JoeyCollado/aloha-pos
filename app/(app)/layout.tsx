"use client";

import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";
import { FiCoffee } from "react-icons/fi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] md:grid md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-[var(--border)] h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-[var(--border)]">
          <div className="bg-[var(--brand-500)] text-white p-2 rounded-lg">
            <FiCoffee size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 leading-tight">Aloha POS</div>
            <div className="text-xs text-gray-500 font-medium">Cafés & Pizza</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <Nav />
        </div>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Account</span>
          <UserButton />
        </div>
      </aside>

      {/* Mobile Top Bar (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-[var(--border)] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--brand-500)] text-white p-1.5 rounded-lg">
            <FiCoffee size={16} />
          </div>
          <span className="font-bold">Aloha POS</span>
        </div>
        <UserButton />
      </div>

      {/* Main Content Area */}
      <main className="p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}