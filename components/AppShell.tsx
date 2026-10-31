// components/AppShell.tsx
"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";
import { FiMenu, FiX } from "react-icons/fi";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] md:grid md:grid-cols-[260px_1fr]">
      {/* Mobile Overlay */}
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
          bg-white border-r border-[var(--border)] h-screen z-50 flex-col
          ${sidebarOpen ? "fixed inset-y-0 left-0 flex w-[260px] shadow-2xl" : "hidden md:flex md:sticky md:top-0"}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 11-8 0"></path>
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-tight">Aloha Pos</div>
              <div className="text-xs text-gray-500 font-medium">Aloha RMR & Wakito's Pizza</div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <Nav onLinkClick={() => setSidebarOpen(false)} />
        </div>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Account</span>
          <UserButton />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 11-8 0"></path>
              </svg>
            </div>
            <span className="font-bold text-gray-900">Aloha Pos</span>
          </div>
        </div>
        <UserButton />
      </div>

      {/* Main Content */}
      <main className="p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}