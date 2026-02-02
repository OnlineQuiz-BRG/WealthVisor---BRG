
import React from 'react';
import { CalculationResult, AppState } from '../types';
import { formatCurrency, calculateInflationAdjusted } from '../utils/math';

interface Props {
  result: CalculationResult;
  state: AppState;
}

const SummaryCards: React.FC<Props> = ({ result, state }) => {
  const years = result.amortization.length / 12;
  const inflationAdjusted = calculateInflationAdjusted(result.maturityValue, state.inflationRate, years);
  const taxAmount = (result.totalInterest > 0 ? result.totalInterest : 0) * (state.taxRate / 100);
  const postTaxValue = result.maturityValue - taxAmount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">Total Invested</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{formatCurrency(result.totalInvested)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Principal + Contributions</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <span className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">Estimated Returns</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(result.totalInterest)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Accrued Interest Income</p>
      </div>

      <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${state.taxEnabled ? 'border-emerald-100 bg-emerald-50/20' : 'border-blue-100 bg-blue-50/30'}`}>
        <span className={`${state.taxEnabled ? 'text-emerald-600' : 'text-blue-600'} text-sm font-semibold mb-2 uppercase tracking-wider`}>
          {state.taxEnabled ? 'Net Maturity Value' : 'Maturity Value'}
        </span>
        <div className="flex flex-col">
          <span className={`text-3xl font-extrabold ${state.taxEnabled ? 'text-emerald-900' : 'text-blue-900'} leading-tight`}>
            {formatCurrency(state.taxEnabled ? postTaxValue : result.maturityValue)}
          </span>
          {state.taxEnabled && (
            <span className="text-xs text-emerald-700 font-medium">Pre-Tax: {formatCurrency(result.maturityValue)}</span>
          )}
        </div>
      </div>

      <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${state.inflationEnabled ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
        <span className={`${state.inflationEnabled ? 'text-amber-600' : 'text-slate-400'} text-sm font-semibold mb-2 uppercase tracking-wider`}>
          Future Power
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${state.inflationEnabled ? 'text-amber-900' : 'text-slate-400'}`}>
            {state.inflationEnabled ? formatCurrency(inflationAdjusted) : '---'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {state.inflationEnabled ? `In today's value (${state.inflationRate}% infl.)` : 'Inflation adjustment off'}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
