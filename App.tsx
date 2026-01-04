
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, TabType, Debt, Loan, Equity } from './types';
import { STORAGE_KEY } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Financials from './components/Financials';
import Projections from './components/Projections';
import Settings from './components/Settings';
import Reports from './components/Reports';

const APP_VERSION = '1.2.1'; 

const App: React.FC = () => {
  const migrateState = (savedData: any): AppState => {
    const defaultState: AppState = {
      inventory: [],
      sales: [],
      expenses: [],
      debts: [],
      loans: [],
      equity: []
    };

    if (!savedData) return defaultState;
    const migrated = { ...defaultState, ...savedData };

    migrated.debts = (migrated.debts || []).map((d: any) => ({
      ...d,
      paidAmount: d.paidAmount !== undefined ? d.paidAmount : (d.status === 'paid' ? d.amount : 0)
    }));

    migrated.loans = (migrated.loans || []).map((l: any) => ({
      ...l,
      paidAmount: l.paidAmount !== undefined ? l.paidAmount : (l.status === 'cleared' ? l.principal : 0)
    }));

    return migrated;
  };

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return migrateState(saved ? JSON.parse(saved) : null);
    } catch (e) {
      console.error("Storage parse failed", e);
      return migrateState(null);
    }
  });

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    const lastVersion = localStorage.getItem('biashara_app_version');
    if (lastVersion && lastVersion !== APP_VERSION) setShowUpdateToast(true);
    localStorage.setItem('biashara_app_version', APP_VERSION);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSyncStatus('synced');
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setSyncStatus('syncing');
    setState(updater);
  }, []);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard state={state} setTab={setCurrentTab} />;
      case 'inventory': return <Inventory inventory={state.inventory} setInventory={(inv) => updateState(s => ({ ...s, inventory: inv }))} />;
      case 'sales': return <Sales state={state} updateState={setState} />;
      case 'expenses': return <Expenses expenses={state.expenses} setExpenses={(exp) => updateState(s => ({ ...s, expenses: exp }))} />;
      case 'debts': return <Financials type="debts" data={state.debts} setData={(d) => updateState(s => ({ ...s, debts: d as Debt[] }))} />;
      case 'loans': return <Financials type="loans" data={state.loans} setData={(l) => updateState(s => ({ ...s, loans: l as Loan[] }))} />;
      case 'equity': return <Financials type="equity" data={state.equity} setData={(e) => updateState(s => ({ ...s, equity: e as Equity[] }))} />;
      case 'reports': return <Reports state={state} />;
      case 'projections': return <Projections state={state} />;
      case 'settings': return <Settings state={state} setState={setState} />;
      default: return <Dashboard state={state} setTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0f1a] overflow-hidden print:block print:bg-white print:h-auto print:overflow-visible text-gray-100 font-['Plus_Jakarta_Sans']">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative print:p-0 print:overflow-visible print:static">
        {showUpdateToast && (
          <div className="no-print toast-notification fixed bottom-6 right-6 z-[100] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400 animate-slide-up">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-code-branch"></i></div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Build {APP_VERSION} Live</p>
              <button onClick={() => window.location.reload()} className="text-[10px] font-bold text-blue-200 hover:text-white underline uppercase">Refresh App</button>
            </div>
          </div>
        )}

        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:mb-4 no-print">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              {currentTab === 'settings' ? 'Vault & Backups' : currentTab.replace(/([A-Z])/g, ' $1')}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`}></span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {isOnline ? 'Active Session' : 'Offline Mode (Local Only)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-l border-gray-800 pl-4">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</p>
              <div className="flex items-center justify-end gap-2">
                <i className={`fa-solid fa-cloud-check ${syncStatus === 'syncing' ? 'animate-spin text-sky-400' : 'text-emerald-400'} text-[11px]`}></i>
                <span className="text-[11px] font-bold text-white uppercase">{syncStatus}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="print:block overflow-visible">{renderContent()}</div>
      </main>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
