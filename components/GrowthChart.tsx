
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/math';

interface Props {
  result: CalculationResult;
}

const GrowthChart: React.FC<Props> = ({ result }) => {
  // Sample the data to 12 points per year for better performance on long tenures
  const chartData = result.amortization
    .filter((_, idx) => idx === 0 || idx % 12 === 11 || idx === result.amortization.length - 1)
    .map(row => ({
      year: (row.month / 12).toFixed(1),
      Principal: Math.round(row.totalInvested),
      Interest: Math.round(row.closingBalance - row.totalInvested),
      Total: Math.round(row.closingBalance)
    }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Growth Projection</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
          <Area 
            type="monotone" 
            dataKey="Principal" 
            stackId="1" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorPrincipal)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="Interest" 
            stackId="1" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorInterest)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
