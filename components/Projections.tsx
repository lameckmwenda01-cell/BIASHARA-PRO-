
import React, { useMemo, useState } from 'react';
import { AppState } from '../types';
import { formatCurrency } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface ProjectionsProps {
  state: AppState;
}

const Projections: React.FC<ProjectionsProps> = ({ state }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const monthlyProfit = useMemo(() => {
    const totalProfits = state.sales.reduce((a, b) => a + b.profit, 0);
    const totalExpenses = state.expenses.reduce((a, b) => a + b.amount, 0);
    return totalProfits - totalExpenses;
  }, [state]);

  const projectionData = useMemo(() => {
    // Basic compounding interest formula with monthly contributions
    // Assume 10% annual growth
    const data = [];
    const annualRate = 0.10;
    const monthlyRate = annualRate / 12;
    let balance = 0;

    for (let year = 0; year <= 30; year++) {
      if (year > 0) {
        // Simple approximation: add annual profit and grow
        const annualProfit = monthlyProfit * 12;
        balance = (balance + annualProfit) * (1 + annualRate);
      }
      data.push({
        year: `Yr ${year}`,
        value: Math.round(balance)
      });
    }
    return data;
  }, [monthlyProfit]);

  const fetchAiInsight = async () => {
    if (!process.env.API_KEY) {
      setAiAnalysis("API Key not found. Please ensure it's configured in the environment.");
      return;
    }
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As a world-class financial advisor, analyze this business's 30-year trajectory.
        Current Monthly Net Profit: ${formatCurrency(monthlyProfit)}
        Inventory Value: ${formatCurrency(state.inventory.reduce((a,b)=>a+(b.buyingPrice*b.stock), 0))}
        Active Debts/Loans: ${formatCurrency(state.debts.length + state.loans.length)} records.
        
        Provide a concise 3-paragraph vision for the next 30 years assuming 10% annual compounding growth. 
        Focus on expansion milestones and wealth building.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiAnalysis(response.text || "Insight generation failed.");
    } catch (err) {
      setAiAnalysis("Error communicating with AI Advisor. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-emerald-400 tracking-tighter uppercase mb-1">Financial Freedom Clock</h3>
          <p className="text-xs text-emerald-500/60 max-w-md">Calculated based on current monthly net profit of {formatCurrency(monthlyProfit)} reinvested at 10% APR.</p>
        </div>
        <div className="text-center mt-4 md:mt-0">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estimated 30-Year Portfolio</p>
          <p className="text-4xl font-black text-white">{formatCurrency(projectionData[30].value)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1f2937] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fa-solid fa-arrow-trend-up mr-3 text-emerald-500"></i>
            Compound Growth Projection (30 Years)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Capital']}
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fa-solid fa-wand-magic-sparkles mr-3 text-sky-500"></i>
            AI Strategic Outlook
          </h3>
          <div className="flex-1 text-sm text-gray-400 leading-relaxed overflow-y-auto">
            {aiAnalysis ? (
              <div className="space-y-4 whitespace-pre-line animate-fade-in">
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-4 text-sky-500 text-2xl">
                  <i className="fa-solid fa-brain"></i>
                </div>
                <p className="mb-6 opacity-50">Generate a professional financial roadmap based on your current business data.</p>
                <button 
                  onClick={fetchAiInsight}
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Consulting Gemini...' : 'Generate AI Strategy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projections;
