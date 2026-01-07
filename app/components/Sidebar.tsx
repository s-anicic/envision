"use client";

import React from 'react';
import { LayoutDashboard, Target, Image as ImageIcon, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userEmail?: string | null;
}

export const Sidebar = ({ currentView, setView, userEmail }: SidebarProps) => {
  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        currentView === id 
          ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      <Icon size={18} className={currentView === id ? 'text-stone-800' : 'text-stone-400'} />
      {label}
    </button>
  );

  return (
    <aside className="w-64 bg-[#FAFAF9] border-r border-stone-200 flex-shrink-0 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Envision</span>
        </div>
        <nav className="space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="goals" icon={Target} label="Goals" />
          <NavItem id="vision" icon={ImageIcon} label="Vision Board" />
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-stone-100">
         <p className="text-xs text-stone-400">Logged in as:</p>
         <p className="text-sm font-medium truncate">{userEmail || 'Guest'}</p>
      </div>
    </aside>
  );
};