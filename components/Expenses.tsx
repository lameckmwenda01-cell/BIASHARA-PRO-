import React, { useState } from 'react';
import { Expense } from '../types';
import { generateId, formatCurrency, exportToWord } from '../utils';
import { EXPENSE_CATEGORIES } from '../constants';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: (exp: Expense[]) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, setExpenses }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({ 
    category: 'General',
    date: new Date().toISOString().slice(0, 16)
  });

  const addExpense = () => {
    if (!formData.description || !formData.amount) return;

    const newExpense: Expense = {
      id: generateId(),
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category || 'General',
      date: new Date(formData.date || new Date()).toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({ 
      category: 'General', 
      date: new Date().toISOString().slice(0, 16) 
    });
  };

  const deleteExpense = (id: string) => {
    if (confirm('Delete this expense entry?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleWordExport = () => {
    const headers = ["Date", "Description", "Category", "Amount"];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      formatCurrency(exp.amount)
    ]);
    exportToWord("Boutique Expense Audit", headers, rows);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 no-print">
        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-black uppercase text-white tracking-tighter mb-6">Log Expense</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Description</label>
              <input type="text" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Rent" className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Amount</label>
              {/* Fix: Use Number() to convert string input value to number for amount */}
              <input type="number" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Date</label>
              <input type="datetime-local" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Category</label>
              <select value={formData.category || 'General'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white">
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button onClick={addExpense} className="w-full bg-rose-600 hover:bg-rose-700 py-4 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center">
              <i className="fa-solid fa-plus mr-3"></i> Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-[#1f2937] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-[#111827]/30 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase text-white tracking-tighter">Expense History</h3>
            <button onClick={handleWordExport} className="text-[10px] font-black uppercase text-sky-400 hover:text-sky-300">Word Export</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#111827]/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white font-bold">{exp.description}</td>
                    <td className="px-6 py-4 text-rose-400 font-black">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4 text-right no-print">
                      <button onClick={() => deleteExpense(exp.id)} className="text-gray-500 hover:text-rose-400"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;