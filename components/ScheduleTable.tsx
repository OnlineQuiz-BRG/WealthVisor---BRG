
import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/math';

interface Props {
  result: CalculationResult;
  onAddInjection: (month: number) => void;
}

const ScheduleTable: React.FC<Props> = ({ result, onAddInjection }) => {
  const [showAll, setShowAll] = useState(false);
  const data = showAll ? result.amortization : result.amortization.slice(0, 12);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Amortization Schedule</h3>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 text-sm font-bold hover:underline"
        >
          {showAll ? 'Show Less' : 'View Full Schedule'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4">Opening</th>
              <th className="px-6 py-4">Injection/EMI</th>
              <th className="px-6 py-4">Interest</th>
              <th className="px-6 py-4">Closing</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-6 py-4 text-xs font-bold text-slate-500">M{row.month}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">{formatCurrency(row.openingBalance)}</td>
                <td className={`px-6 py-4 text-xs font-bold ${row.contribution >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {row.contribution >= 0 ? '+' : ''}{formatCurrency(row.contribution)}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-emerald-500">{formatCurrency(row.interest)}</td>
                <td className="px-6 py-4 text-xs font-extrabold text-slate-900">{formatCurrency(row.closingBalance)}</td>
                <td className="px-6 py-4 text-xs">
                  <button 
                    onClick={() => onAddInjection(row.month)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Add Lump-sum Injection"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!showAll && result.amortization.length > 12 && (
          <div className="p-4 bg-slate-50/50 text-center text-xs text-slate-400 font-medium">
            Showing first 12 months only
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTable;
