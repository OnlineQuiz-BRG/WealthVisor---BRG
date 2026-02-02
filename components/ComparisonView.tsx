
import React from 'react';
import { Scenario } from '../types';
import { formatCurrency, calculateInflationAdjusted } from '../utils/math';

interface Props {
  scenarios: Scenario[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const ComparisonView: React.FC<Props> = ({ scenarios, onClose, onRemove }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Scenario Comparison</h2>
            <p className="text-sm text-slate-500">Compare your saved investment strategies side-by-side</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 min-w-max pb-4">
            {scenarios.map((s) => {
              const years = s.result.amortization.length / 12;
              const inflationAdjusted = calculateInflationAdjusted(s.result.maturityValue, s.state.inflationRate, years);
              const taxAmount = (s.result.totalInterest > 0 ? s.result.totalInterest : 0) * (s.state.taxRate / 100);
              const postTaxValue = s.result.maturityValue - taxAmount;

              return (
                <div key={s.id} className="w-80 flex-shrink-0 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col relative group">
                  <button 
                    onClick={() => onRemove(s.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>

                  <div className="p-5 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {s.state.investmentType.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Principal</span>
                        <p className="font-bold text-slate-800">{formatCurrency(s.state.principal)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Rate</span>
                        <p className="font-bold text-slate-800">{s.state.annualRate}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tenure</span>
                        <p className="font-bold text-slate-800">{s.state.tenureYears}y</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly</span>
                        <p className="font-bold text-slate-800">{formatCurrency(s.state.monthlyContribution)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Maturity</span>
                        <p className="text-xl font-extrabold text-blue-600">{formatCurrency(s.result.maturityValue)}</p>
                      </div>
                      
                      {s.state.taxEnabled && (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Net (Post-Tax)</span>
                          <p className="text-lg font-bold text-slate-800">{formatCurrency(postTaxValue)}</p>
                        </div>
                      )}

                      {s.state.inflationEnabled && (
                        <div>
                          <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Real (Inflation Adjusted)</span>
                          <p className="text-lg font-bold text-slate-800">{formatCurrency(inflationAdjusted)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {scenarios.length === 0 && (
              <div className="w-full text-center py-20 text-slate-400 italic">
                No scenarios saved for comparison. Close this and save a scenario first!
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
