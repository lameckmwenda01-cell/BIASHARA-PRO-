
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, SaleRecord } from '../types';
import { generateId, formatCurrency, exportToWord, printReceipt } from '../utils';

interface SalesProps {
  state: AppState;
  updateState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Sales: React.FC<SalesProps> = ({ state, updateState }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));

  const selectedItem = useMemo(() => 
    state.inventory.find(i => i.id === selectedItemId), 
    [state.inventory, selectedItemId]
  );

  useEffect(() => {
    if (selectedItem) {
      setCustomPrice(selectedItem.sellingPrice);
    } else {
      setCustomPrice('');
    }
  }, [selectedItem]);

  const handleSale = () => {
    if (!selectedItem || qty <= 0 || selectedItem.stock < qty) {
      alert("Invalid selection or insufficient stock!");
      return;
    }

    const finalUnitPrice = customPrice === '' ? selectedItem.sellingPrice : Number(customPrice);
    const totalRevenue = finalUnitPrice * qty;
    const totalCost = selectedItem.buyingPrice * qty;
    const profit = totalRevenue - totalCost;

    const newSale: SaleRecord = {
      id: generateId(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: qty,
      totalPrice: totalRevenue,
      profit: profit,
      date: new Date(transactionDate).toISOString()
    };

    updateState(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales],
      inventory: prev.inventory.map(item => 
        item.id === selectedItem.id 
          ? { ...item, stock: item.stock - qty } 
          : item
      )
    }));

    if (confirm("Sale completed! Print receipt?")) {
      printReceipt(newSale);
    }

    setSelectedItemId('');
    setQty(1);
    setTransactionDate(new Date().toISOString().slice(0, 16));
  };

  const handleWordExport = () => {
    const headers = ["Date", "Time", "Item", "Qty", "Revenue", "Profit"];
    const rows = state.sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sale.itemName,
      sale.quantity.toString(),
      formatCurrency(sale.totalPrice),
      formatCurrency(sale.profit)
    ]);
    exportToWord("Boutique Sales Ledger", headers, rows);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6 no-print">
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-black uppercase text-white tracking-tighter mb-6">New Transaction</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Select Item</label>
              <select 
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white"
              >
                <option value="">Choose a product...</option>
                {state.inventory.map(item => (
                  <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                    {item.name} ({item.stock} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Quantity</label>
                <div className="flex items-center bg-black/40 border border-gray-800 rounded-xl px-2 py-1">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-gray-400 hover:text-white"><i className="fa-solid fa-minus"></i></button>
                  <input 
                    type="number" 
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="flex-1 bg-transparent border-none text-center font-bold outline-none text-white text-sm" 
                  />
                  <button onClick={() => setQty(qty + 1)} className="p-2 text-gray-400 hover:text-white"><i className="fa-solid fa-plus"></i></button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Unit Price (Edit)</label>
                <input 
                  type="number" 
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Selling Price"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white font-bold text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Transaction Date & Time</label>
              <input 
                type="datetime-local" 
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm" 
              />
            </div>

            {selectedItem && (
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Buying Cost (Total)</span>
                  <span className="text-white font-bold">{formatCurrency(selectedItem.buyingPrice * qty)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Estimated Profit</span>
                  <span className="text-emerald-400 font-bold">+{formatCurrency((Number(customPrice || selectedItem.sellingPrice) - selectedItem.buyingPrice) * qty)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-blue-500/20 pt-2">
                  <span className="text-gray-400">Grand Total</span>
                  <span className="text-white font-black text-lg">{formatCurrency(Number(customPrice || selectedItem.sellingPrice) * qty)}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleSale}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-xl font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center"
            >
              <i className="fa-solid fa-cash-register mr-3"></i> Complete Sale
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#1f2937] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#111827]/30">
            <h3 className="text-xl font-black uppercase text-white tracking-tighter">Sale History</h3>
            <div className="flex items-center gap-3 no-print">
               <button onClick={handleWordExport} className="text-[10px] font-black uppercase tracking-widest text-sky-400 hover:text-sky-300">
                  <i className="fa-solid fa-file-word mr-1"></i> Export Word
               </button>
               <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold">Total: {state.sales.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#111827]/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800">
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4 text-right no-print">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {state.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{new Date(sale.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-500">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 text-white font-bold">{sale.itemName}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{sale.quantity}</td>
                    <td className="px-6 py-4 text-white font-black">{formatCurrency(sale.totalPrice)}</td>
                    <td className="px-6 py-4 text-right no-print">
                      <button 
                        onClick={() => printReceipt(sale)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sky-400 transition-colors"
                        title="Print Receipt"
                      >
                        <i className="fa-solid fa-print"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {state.sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center opacity-30">
                      <i className="fa-solid fa-receipt text-5xl mb-4"></i>
                      <p>No sales recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
