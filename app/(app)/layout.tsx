// app/(app)/layout.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";
import { FiCoffee, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[260px_1fr]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          bg-white border-r border-slate-200 h-screen z-50 flex-col
          ${sidebarOpen ? "fixed inset-y-0 left-0 flex w-[260px] shadow-2xl" : "hidden md:flex md:sticky md:top-0"}
        `}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-600/25">
              <FiCoffee size={22} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Aloha POS</div>
              <div className="text-xs text-slate-500 font-medium">Cafés & Pizza</div>
            </div>
          </div>
          {/* Close button for mobile inside the sidebar */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Pass the close function so clicking a link closes the drawer */}
          <Nav onLinkClick={() => setSidebarOpen(false)} />
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Account</span>
          <UserButton />
        </div>
      </aside>

      {/* Mobile Top Bar (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white p-1.5 rounded-lg">
              <FiCoffee size={16} />
            </div>
            <span className="font-bold text-slate-900">Aloha POS</span>
          </div>
        </div>
        <UserButton />
      </div>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-16 sm:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}