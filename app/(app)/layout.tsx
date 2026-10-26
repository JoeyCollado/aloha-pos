"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Nav } from "@/components/Nav";
import { FiCoffee, FiMenu, FiX, FiAlertTriangle } from "react-icons/fi";
// Import your auth helper
import { requireOwner, UnauthorizedError } from "@/lib/auth"; 

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check authorization when the layout loads
  useEffect(() => {
    async function checkAuth() {
      try {
        await requireOwner();
        setIsAuthorized(true);
      } catch (err) {
        setIsAuthorized(false);
      }
    }
    checkAuth();
  }, []);

  // Show a loading state while checking Clerk
  if (isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show Access Denied screen if they are not the owner
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
          <FiAlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have the &quot;owner&quot; role.</p>
          <div className="mt-6">
            <UserButton />
          </div>
        </div>
      </div>
    );
  }

  // If they are authorized, show the normal app layout
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
            <div className="bg-[var(--brand)] text-white p-2 rounded-lg">
              <FiCoffee size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-tight">Aloha POS</div>
              <div className="text-xs text-gray-500 font-medium">Cafés & Pizza</div>
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
            <div className="bg-[var(--brand)] text-white p-1.5 rounded-lg">
              <FiCoffee size={16} />
            </div>
            <span className="font-bold text-gray-900">Aloha POS</span>
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