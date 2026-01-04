
import React, { useState } from 'react';
import { Debt, Loan, Equity } from '../types';
import { generateId, formatCurrency, getStatusColor, exportToWord } from '../utils';

interface FinancialsProps {
  type: 'debts' | 'loans' | 'equity';
  data: (Debt | Loan | Equity)[];
  setData: (data: (Debt | Loan | Equity)[]) => void;
}

const Financials: React.FC<FinancialsProps> = ({ type, data, setData }) => {
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().slice(0, 16),
    subType: type === 'debts' ? 'Booked Item' : 'Cash Loan'
  });
  const [paymentInput, setPaymentInput] = useState<{ [key: string]: string }>({});

  const handleAdd = () => {
    let newItem: any;
    const base = { 
        id: generateId(), 
        date: new Date(formData.date || new Date()).toISOString() 
    };

    if (type === 'debts') {
      if (!formData.creditor || !formData.amount) return;
      newItem = { 
        ...base, 
        creditor: `${formData.subType}: ${formData.creditor}`, 
        amount: Number(formData.amount), 
        paidAmount: 0,
        dueDate: formData.dueDate || '', 
        status: 'pending' 
      };
    } else if (type === 'loans') {
      if (!formData.source || !formData.principal) return;
      newItem = { 
        ...base, 
        source: `${formData.subType}: ${formData.source}`, 
        principal: Number(formData.principal), 
        paidAmount: 0,
        interestRate: Number(formData.interestRate || 0), 
        termMonths: Number(formData.termMonths || 12), 
        startDate: base.date, 
        status: 'active' 
      };
    } else {
      if (!formData.source || !formData.amount) return;
      newItem = { ...base, source: formData.source, amount: Number(formData.amount), type: formData.entryType || 'investment' };
    }

    setData([newItem, ...data]);
    setFormData({ 
      date: new Date().toISOString().slice(0, 16),
      subType: type === 'debts' ? 'Booked Item' : 'Cash Loan'
    });
  };

  const handlePayment = (id: string) => {
    const amount = Number(paymentInput[id]);
    if (!amount || amount <= 0) return;

    setData(data.map((item: any) => {
      if (item.id === id) {
        const total = item.amount || item.principal || 1;
        const currentPaid = item.paidAmount || 0;
        const newPaid = currentPaid + amount;
        const isFullyPaid = newPaid >= total;
        
        return { 
          ...item, 
          paidAmount: Math.min(newPaid, total),
          status: isFullyPaid ? (type === 'debts' ? 'paid' : 'cleared') : item.status
        };
      }
      return item;
    }));
    
    setPaymentInput({ ...paymentInput, [id]: '' });
  };

  const deleteItem = (id: string) => {
    if (confirm('Delete this financial record?')) {
      setData(data.filter(i => i.id !== id));
    }
  };

  const handleWordExport = () => {
    const title = type === 'debts' ? "Boutique Receivables (Debts)" : type === 'loans' ? "Boutique Liabilities (Loans)" : "Boutique Equity Log";
    let headers: string[] = [];
    let rows: any[][] = [];

    if (type === 'debts') {
      headers = ["Date", "Details", "Due Date", "Total", "Paid", "Balance", "Status"];
      rows = data.map((d: any) => [
        new Date(d.date).toLocaleDateString(),
        d.creditor,
        d.dueDate || 'N/A',
        formatCurrency(d.amount),
        formatCurrency(d.paidAmount),
        formatCurrency(d.amount - d.paidAmount),
        d.status
      ]);
    } else if (type === 'loans') {
      headers = ["Start Date", "Source", "Principal", "Paid", "Balance", "Rate", "Status"];
      rows = data.map((l: any) => [
        new Date(l.startDate).toLocaleDateString(),
        l.source,
        formatCurrency(l.principal),
        formatCurrency(l.paidAmount),
        formatCurrency(l.principal - l.paidAmount),
        `${l.interestRate}%`,
        l.status
      ]);
    } else {
      headers = ["Date", "Source", "Amount", "Type"];
      rows = data.map((e: any) => [
        new Date(e.date).toLocaleDateString(),
        e.source,
        formatCurrency(e.amount),
        e.type
      ]);
    }
    exportToWord(title, headers, rows);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 no-print">
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 sticky top-4">
          <h3 className="text-xl font-black uppercase text-white tracking-tighter mb-6 flex items-center">
            <i className={`fa-solid ${type === 'debts' ? 'fa-book-bookmark text-orange-400' : type === 'loans' ? 'fa-hand-holding-dollar text-blue-400' : 'fa-user-tie text-emerald-400'} mr-3`}></i>
            Record {type === 'debts' ? 'Payment Owed' : type === 'loans' ? 'Money Borrowed' : 'Equity Entry'}
          </h3>
          
          <div className="space-y-4">
            {type !== 'equity' && (
              <div>
                 <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Category Type</label>
                 <select 
                   value={formData.subType} 
                   onChange={e => setFormData({...formData, subType: e.target.value})}
                   className="input-style text-white text-sm bg-black/40"
                 >
                   {type === 'debts' ? (
                     <>
                      <option value="Booked Item">Booked Item (Customer)</option>
                      <option value="Supplier Debt">Supplier Debt (Store)</option>
                     </>
                   ) : (
                     <>
                      <option value="Cash Loan">Cash Loan</option>
                      <option value="Borrowed Money">Borrowed Money</option>
                      <option value="Bank Loan">Bank Credit</option>
                     </>
                   )}
                 </select>
              </div>
            )}

            <div>
               <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">{type === 'equity' ? 'Source' : 'Details / Name'}</label>
               <input 
                 type="text" 
                 placeholder={type === 'debts' ? "Customer Name" : type === 'loans' ? "Lender Name" : "Investment Source"} 
                 value={formData.creditor || formData.source || ''} 
                 onChange={e => setFormData({...formData, creditor: e.target.value, source: e.target.value})} 
                 className="input-style text-white" 
               />
            </div>

            <div>
               <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Amount</label>
               <input 
                 type="number" 
                 placeholder="0.00" 
                 value={formData.amount || formData.principal || ''} 
                 onChange={e => setFormData({...formData, amount: e.target.value, principal: e.target.value})} 
                 className="input-style text-white font-black" 
               />
            </div>

            {type === 'debts' && (
               <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Deadline Date</label>
                  <input type="date" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="input-style text-white" />
               </div>
            )}

            {type === 'equity' && (
               <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Entry Type</label>
                  <select value={formData.entryType || 'investment'} onChange={e => setFormData({...formData, entryType: e.target.value})} className="input-style text-white">
                    <option value="investment">Capital Injection</option>
                    <option value="drawal">Owner Withdrawal</option>
                  </select>
               </div>
            )}

            <button onClick={handleAdd} className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl">
              Save Record
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-end no-print">
            <button onClick={handleWordExport} className="bg-[#1f2937] border border-gray-800 text-sky-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <i className="fa-solid fa-file-word mr-2"></i> Export Word Report
            </button>
        </div>

        {data.length === 0 && (
          <div className="bg-[#1f2937] p-20 rounded-3xl border border-dashed border-gray-800 text-center opacity-30">
            <i className="fa-solid fa-folder-open text-5xl mb-4"></i>
            <p className="font-bold uppercase tracking-widest text-xs">No records found</p>
          </div>
        )}

        {data.map((item: any) => {
          const total = item.amount || item.principal;
          const paid = item.paidAmount || 0;
          const percentage = Math.min(100, Math.round((paid / total) * 100));
          const isSettled = percentage === 100;
          
          return (
            <div key={item.id} className={`bg-[#1f2937] rounded-3xl border transition-all ${isSettled ? 'border-emerald-500/50' : 'border-gray-800'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-white font-black uppercase tracking-tight text-lg">{item.creditor || item.source}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(item.date || item.startDate).toLocaleDateString()} 
                      {item.dueDate && ` • Due: ${item.dueDate}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status ? (isSettled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400') : (item.type === 'drawal' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400')}`}>
                    {item.status || item.type}
                  </span>
                </div>

                {item.status && (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/20 p-3 rounded-2xl"><p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Total</p><p className="text-sm font-black text-white">{formatCurrency(total)}</p></div>
                      <div className="bg-black/20 p-3 rounded-2xl"><p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Paid</p><p className="text-sm font-black text-emerald-400">{formatCurrency(paid)}</p></div>
                      <div className="bg-black/20 p-3 rounded-2xl"><p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Balance</p><p className="text-sm font-black text-rose-400">{formatCurrency(total - paid)}</p></div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-gray-800">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isSettled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-orange-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                    {!isSettled && (
                      <div className="no-print flex gap-3 p-4 bg-black/20 rounded-2xl border border-gray-800/50">
                        <input type="number" placeholder="Payment..." value={paymentInput[item.id] || ''} onChange={e => setPaymentInput({...paymentInput, [item.id]: e.target.value})} className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                        <button onClick={() => handlePayment(item.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Submit</button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="no-print px-6 py-3 bg-[#111827]/50 border-t border-gray-800 flex justify-between">
                <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-rose-500 transition-colors text-xs uppercase font-bold tracking-widest"><i className="fa-solid fa-trash-can mr-2"></i> Delete</button>
                {isSettled && <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest"><i className="fa-solid fa-circle-check mr-2"></i> Completed</span>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .input-style { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid #374151; padding: 12px; border-radius: 12px; outline: none; transition: 0.2s; }
        .input-style:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Financials;
