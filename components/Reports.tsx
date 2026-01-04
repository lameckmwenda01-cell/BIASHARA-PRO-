
import React from 'react';
import { AppState } from '../types';
import { formatCurrency } from '../utils';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const totalRevenue = state.sales.reduce((a, b) => a + b.totalPrice, 0);
  const totalProfit = state.sales.reduce((a, b) => a + b.profit, 0);
  const totalExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
  const inventoryValue = state.inventory.reduce((a, b) => a + (b.buyingPrice * b.stock), 0);

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ["Type", "Date", "Description/Item", "Category", "Quantity", "Amount", "Profit"];
    const rows = [
      ...state.sales.map(s => [
        "SALE", 
        new Date(s.date).toLocaleDateString(), 
        s.itemName, 
        "Revenue", 
        s.quantity.toString(), 
        s.totalPrice.toString(), 
        s.profit.toString()
      ]),
      ...state.expenses.map(e => [
        "EXPENSE", 
        new Date(e.date).toLocaleDateString(), 
        e.description, 
        e.category, 
        "1", 
        e.amount.toString(), 
        "0"
      ])
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Boutique_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Business Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; }
        h1, h2 { color: #333; }
      </style>
      </head><body>
    `;
    const footer = "</body></html>";
    
    const content = `
      <div style="text-align: center;">
        <h1>BOUTIQUE MASTER - BUSINESS REPORT</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total Revenue:</strong> ${formatCurrency(totalRevenue)}</p>
        <p><strong>Gross Profit:</strong> ${formatCurrency(totalProfit)}</p>
        <p><strong>Total Expenses:</strong> ${formatCurrency(totalExpenses)}</p>
        <p><strong>Inventory Valuation:</strong> ${formatCurrency(inventoryValue)}</p>
      </div>

      <h2>Sales Ledger</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Item</th><th>Qty</th><th>Revenue</th><th>Profit</th></tr>
        </thead>
        <tbody>
          ${state.sales.map(s => `
            <tr>
              <td>${new Date(s.date).toLocaleDateString()}</td>
              <td>${s.itemName}</td>
              <td>${s.quantity}</td>
              <td>${formatCurrency(s.totalPrice)}</td>
              <td>${formatCurrency(s.profit)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Expense Audit</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>
        </thead>
        <tbody>
          ${state.expenses.map(e => `
            <tr>
              <td>${new Date(e.date).toLocaleDateString()}</td>
              <td>${e.description}</td>
              <td>${e.category}</td>
              <td>${formatCurrency(e.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Boutique_Report_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Print-Only Header */}
      <div className="print-header">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Boutique Master Business Report</h1>
        <p className="text-sm font-bold">Generated on: {new Date().toLocaleString()}</p>
        <p className="text-xs">Confidential Business Data • Boutique Master Suite</p>
      </div>

      <div className="bg-[#1f2937] p-8 rounded-3xl border border-gray-800 shadow-xl no-print">
        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase text-white tracking-tighter mb-2">Multi-Format Data Export</h3>
          <p className="text-gray-500 text-sm">Download your boutique performance data in the format that best suits your needs.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={handlePrint}
            className="group bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
          >
            <i className="fa-solid fa-file-pdf text-2xl group-hover:scale-110 transition-transform"></i>
            <span>Export PDF</span>
          </button>

          <button 
            onClick={exportToCSV}
            className="group bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
          >
            <i className="fa-solid fa-file-csv text-2xl group-hover:scale-110 transition-transform"></i>
            <span>Export CSV / Excel</span>
          </button>

          <button 
            onClick={exportToWord}
            className="group bg-sky-600 hover:bg-sky-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex flex-col items-center gap-3 transition-all hover:-translate-y-1"
          >
            <i className="fa-solid fa-file-word text-2xl group-hover:scale-110 transition-transform"></i>
            <span>Export Word</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stat-grid">
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 stat-card">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 stat-card">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Gross Profit</p>
          <p className="text-3xl font-black text-emerald-400">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 stat-card">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Expenses</p>
          <p className="text-3xl font-black text-rose-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 stat-card">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Inventory Value</p>
          <p className="text-3xl font-black text-sky-400">{formatCurrency(inventoryValue)}</p>
        </div>
      </div>

      <div className="bg-[#1f2937] rounded-3xl border border-gray-800 overflow-hidden">
        <div className="p-6 bg-[#111827]/30 border-b border-gray-800">
           <h4 className="text-white font-black uppercase tracking-widest text-xs">Full Sales Ledger</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-black/20 text-gray-500 uppercase text-[9px] font-black tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {state.sales.map(sale => (
                <tr key={sale.id} className="text-white">
                  <td className="px-6 py-4 font-bold">{sale.itemName}</td>
                  <td className="px-6 py-4 text-gray-400">{sale.quantity}</td>
                  <td className="px-6 py-4 font-black">{formatCurrency(sale.totalPrice)}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{formatCurrency(sale.profit)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {state.sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">No sales records to report.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-[#1f2937] rounded-3xl border border-gray-800 overflow-hidden mt-8">
        <div className="p-6 bg-[#111827]/30 border-b border-gray-800">
           <h4 className="text-white font-black uppercase tracking-widest text-xs">Expense Audit Trail</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-black/20 text-gray-500 uppercase text-[9px] font-black tracking-widest border-b border-gray-800">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {state.expenses.map(exp => (
                <tr key={exp.id} className="text-white">
                  <td className="px-6 py-4 font-bold">{exp.description}</td>
                  <td className="px-6 py-4 text-gray-400 font-bold uppercase text-[10px]">{exp.category}</td>
                  <td className="px-6 py-4 font-black text-rose-400">{formatCurrency(exp.amount)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {state.expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500 italic">No expense records to report.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
