
import React from 'react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const menuItems: { id: TabType; label: string; icon: string; special?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
    { id: 'sales', label: 'Sales', icon: 'fa-cart-shopping' },
    { id: 'expenses', label: 'Expenses', icon: 'fa-receipt' },
    { id: 'debts', label: 'Debts', icon: 'fa-handshake-angle' },
    { id: 'loans', label: 'Loans', icon: 'fa-landmark' },
    { id: 'equity', label: 'Equity', icon: 'fa-user-tie' },
    { id: 'reports', label: 'Reports & PDF', icon: 'fa-file-pdf' },
    { id: 'projections', label: 'AI Forecast', icon: 'fa-wand-magic-sparkles', special: true },
    { id: 'settings', label: 'Backup & Restore', icon: 'fa-cloud-arrow-up' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-[#111827] border-r border-gray-800 p-4 md:p-6 flex flex-col transition-all duration-300 no-print">
      <div className="mb-10 text-center">
        <h1 className="font-black text-xl md:text-2xl text-white italic tracking-tighter uppercase whitespace-nowrap overflow-hidden">
          Boutique<span className="text-sky-500">Master</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center px-3 md:px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : item.special 
                  ? 'text-emerald-400 hover:bg-emerald-400/10'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="hidden md:block ml-3 font-semibold text-sm truncate">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-gray-800">
        <div className="bg-gray-800/30 rounded-xl p-3 mb-3 flex items-center justify-between no-print">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase text-gray-500">Production</span>
           </div>
           <span className="text-[8px] font-mono text-gray-600">v1.2.0</span>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">Admin</div>
          <div className="hidden md:block ml-3">
            <p className="text-xs font-bold text-white">Boutique Owner</p>
            <p className="text-[10px] text-gray-500 uppercase font-black">Secure Node</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
