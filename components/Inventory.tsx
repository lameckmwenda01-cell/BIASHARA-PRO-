import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { generateId, formatCurrency, exportToWord } from '../utils';
import { PRODUCT_CATEGORIES } from '../constants';

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: (inv: InventoryItem[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({ category: 'General' });

  const handleSave = () => {
    if (!formData.name || !formData.buyingPrice || !formData.sellingPrice) return;

    if (editingItem) {
      setInventory(inventory.map(item => item.id === editingItem.id ? { ...item, ...formData } as InventoryItem : item));
    } else {
      const newItem: InventoryItem = {
        id: generateId(),
        name: formData.name!,
        sku: formData.sku || generateId().toUpperCase(),
        buyingPrice: Number(formData.buyingPrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock || 0),
        category: formData.category || 'General'
      };
      setInventory([...inventory, newItem]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ category: 'General' });
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const deleteItem = (id: string) => {
    if (confirm('Delete this boutique item?')) {
      setInventory(inventory.filter(i => i.id !== id));
    }
  };

  const handleWordExport = () => {
    const headers = ["Name", "SKU", "Category", "Buying Price", "Selling Price", "Stock"];
    const rows = inventory.map(item => [
      item.name,
      item.sku,
      item.category,
      formatCurrency(item.buyingPrice),
      formatCurrency(item.sellingPrice),
      item.stock.toString()
    ]);
    exportToWord("Boutique Inventory Report", headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-[#1f2937] border-none pl-12 pr-4 py-3 rounded-xl text-sm outline-none ring-1 ring-gray-800 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleWordExport} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center">
            <i className="fa-solid fa-file-word mr-2 text-sky-400"></i> Word
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center">
            <i className="fa-solid fa-plus mr-2"></i> Add Item
          </button>
        </div>
      </div>

      <div className="bg-[#1f2937] rounded-2xl border border-gray-800 overflow-hidden print:border-none">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#111827]/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-800 print:bg-white print:text-black">
              <th className="px-6 py-4">Item Name / SKU</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Buying</th>
              <th className="px-6 py-4">Selling</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 print:divide-gray-300">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors print:text-black">
                <td className="px-6 py-4">
                  <p className="font-bold text-white print:text-black">{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.sku}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-gray-800 text-[10px] font-bold text-gray-400 print:bg-transparent print:text-black">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 print:text-black">{formatCurrency(item.buyingPrice)}</td>
                <td className="px-6 py-4 text-emerald-400 font-bold print:text-black">{formatCurrency(item.sellingPrice)}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center font-bold ${item.stock < 5 ? 'text-rose-400' : 'text-gray-300 print:text-black'}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 no-print ${item.stock < 5 ? 'bg-rose-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                    {item.stock}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3 no-print">
                  <button onClick={() => openEdit(item)} className="text-gray-500 hover:text-blue-400"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => deleteItem(item.id)} className="text-gray-500 hover:text-rose-400"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1f2937] w-full max-w-md rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase text-white tracking-tighter">
                {editingItem ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Item Name</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Buying Price</label>
                  {/* Fix: Use Number() to convert string input value to number for buyingPrice */}
                  <input type="number" value={formData.buyingPrice || ''} onChange={e => setFormData({ ...formData, buyingPrice: Number(e.target.value) })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Selling Price</label>
                  {/* Fix: Use Number() to convert string input value to number for sellingPrice */}
                  <input type="number" value={formData.sellingPrice || ''} onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Stock</label>
                  {/* Fix: Use Number() to convert string input value to number for stock */}
                  <input type="number" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Category</label>
                  <select value={formData.category || 'General'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white">
                    {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#111827] flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-sm text-white shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;