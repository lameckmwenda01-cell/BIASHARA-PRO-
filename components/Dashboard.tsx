
import React, { useMemo } from 'react';
import { AppState, TabType } from '../types';
import { formatCurrency } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  state: AppState;
  setTab?: (tab: TabType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setTab }) => {
  const stats = useMemo(() => {
    const totalSales = state.sales.reduce((a, b) => a + b.totalPrice, 0);
    const totalProfits = state.sales.reduce((a, b) => a + b.profit, 0);
    const totalExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
    const totalLoans = state.loans.filter(l => l.status === 'active').reduce((a, b) => a + b.principal, 0);
    const totalDebts = state.debts.filter(d => d.status === 'pending').reduce((a, b) => a + b.amount, 0);
    const inventoryValue = state.inventory.reduce((a, b) => a + (b.buyingPrice * b.stock), 0);
    
    const margin = totalSales > 0 ? (totalProfits / totalSales) * 100 : 0;
    const lowStockCount = state.inventory.filter(i => i.stock < 5).length;

    return {
      netProfit: totalProfits - totalExpenses,
      revenue: totalSales,
      liabilities: totalLoans + totalDebts,
      inventoryValue,
      margin,
      lowStockCount
    };
  }, [state]);

  const salesData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySales = state.sales.filter(s => s.date.startsWith(date));
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: daySales.reduce((a, b) => a + b.totalPrice, 0),
        profit: daySales.reduce((a, b) => a + b.profit, 0)
      };
    });
  }, [state.sales]);

  return (
    <div className="space-y-6">
      <div className="bg-[#1f2937] p-4 rounded-2xl border border-blue-500/20 flex flex-wrap gap-3 no-print">
        <p className="w-full text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1 ml-1">Quick Action Command Center</p>
        <button onClick={() => setTab?.('sales')} className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <i className="fa-solid fa-cart-plus"></i> New Sale
        </button>
        <button onClick={() => setTab?.('inventory')} className="flex-1 min-w-[140px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <i className="fa-solid fa-box-open"></i> Restock
        </button>
        <button onClick={() => setTab?.('expenses')} className="flex-1 min-w-[140px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <i className="fa-solid fa-file-invoice-dollar"></i> Log Expense
        </button>
        <button onClick={() => setTab?.('settings')} className="flex-1 min-w-[140px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <i className="fa-solid fa-cloud-arrow-up"></i> Backup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Net Business Profit" value={stats.netProfit} color="text-emerald-400" icon="fa-wallet" />
        <StatCard title="Total Revenue" value={stats.revenue} color="text-blue-400" icon="fa-chart-line" />
        <StatCard title="Total Liabilities" value={stats.liabilities} color="text-rose-400" icon="fa-hand-holding-dollar" />
        <StatCard title="Inventory Value" value={stats.inventoryValue} color="text-amber-400" icon="fa-warehouse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <i className="fa-solid fa-chart-area mr-3 text-blue-500"></i>
              Revenue & Profit Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#f9fafb' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string; icon: string }> = ({ title, value, color, icon }) => (
  <div className="bg-[#1f2937] p-5 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all cursor-default group">
    <div className="flex justify-between items-start mb-2">
      <div className={`w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center ${color.replace('text', 'text-opacity-20')} group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon} ${color}`}></i>
      </div>
    </div>
    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</p>
    <p className={`text-2xl font-black ${color}`}>{formatCurrency(value)}</p>
  </div>
);

export default Dashboard;
