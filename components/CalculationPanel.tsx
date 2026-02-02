
import React, { useState } from 'react';
import { AppState, CalculatorMode, InvestmentType, InjectionRule } from '../types';
import { formatCurrency } from '../utils/math';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onSaveScenario: (name: string) => void;
  onOpenComparison: () => void;
  savedCount: number;
}

const CalculationPanel: React.FC<Props> = ({ state, setState, onSaveScenario, onOpenComparison, savedCount }) => {
  const [scenarioName, setScenarioName] = useState('');
  
  // Local state for the injection form
  const [injAmount, setInjAmount] = useState<number>(0);
  const [injStart, setInjStart] = useState<number>(1);
  const [injDuration, setInjDuration] = useState<number>(1);

  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (mode: CalculatorMode) => {
    let defaultType = InvestmentType.SIP;
    if (mode === CalculatorMode.BASIC_SAVINGS) defaultType = InvestmentType.COMPOUND;
    if (mode === CalculatorMode.LOAN_MANAGEMENT) defaultType = InvestmentType.LOAN_STANDARD;
    
    setState(prev => ({ 
      ...prev, 
      mode, 
      investmentType: defaultType,
      // Retain injections across modes to allow strategic planning in all views
      injectionRules: prev.injectionRules
    }));
  };

  const handleSave = () => {
    const name = scenarioName.trim() || `Plan ${savedCount + 1}`;
    onSaveScenario(name);
    setScenarioName('');
  };

  const addInjectionRule = () => {
    if (injAmount === 0) return;
    
    const newRule: InjectionRule = {
      id: Math.random().toString(36).substr(2, 9),
      amount: injAmount,
      startMonth: injStart,
      endMonth: injStart + Math.max(0, injDuration - 1)
    };

    setState(prev => ({
      ...prev,
      injectionRules: [...prev.injectionRules, newRule]
    }));

    // Reset local form
    setInjAmount(0);
  };

  const removeInjectionRule = (id: string) => {
    setState(prev => ({
      ...prev,
      injectionRules: prev.injectionRules.filter(r => r.id !== id)
    }));
  };

  return (
    <div className="w-full lg:w-96 flex-shrink-0 bg-white border-r border-slate-100 p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)] hide-scrollbar">
      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {[
          { id: CalculatorMode.BASIC_SAVINGS, icon: 'piggy-bank', label: 'Basic' },
          { id: CalculatorMode.WEALTH_BUILDING, icon: 'chart-line', label: 'Wealth' },
          { id: CalculatorMode.LOAN_MANAGEMENT, icon: 'home', label: 'Loan' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleModeChange(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              state.mode === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`fas fa-${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Strategy Type Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Investment Strategy</label>
        <select 
          value={state.investmentType}
          onChange={(e) => updateState('investmentType', e.target.value as InvestmentType)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {state.mode === CalculatorMode.WEALTH_BUILDING && (
            <>
              <option value={InvestmentType.SIP}>Regular SIP (+ Extra)</option>
              <option value={InvestmentType.IRREGULAR_ONLY}>Irregular Injections Only</option>
              <option value={InvestmentType.LUMPSUM_SIP}>Lump-sum + SIP</option>
            </>
          )}
          {state.mode === CalculatorMode.BASIC_SAVINGS && (
            <>
              <option value={InvestmentType.COMPOUND}>Compound Interest</option>
              <option value={InvestmentType.SIMPLE}>Simple Interest</option>
            </>
          )}
          {state.mode === CalculatorMode.LOAN_MANAGEMENT && (
            <>
              <option value={InvestmentType.LOAN_PREPAYMENT}>Loan with Prepayments</option>
              <option value={InvestmentType.LOAN_STANDARD}>Standard Amortization</option>
            </>
          )}
        </select>
      </div>

      {/* Scenario Actions */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scenario Builder</h4>
        <input 
          type="text" 
          placeholder="Scenario Name (e.g. Retirement Plan)"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            SAVE CURRENT
          </button>
          <button 
            onClick={onOpenComparison}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center gap-1"
          >
            <i className="fas fa-copy"></i>
            {savedCount}
          </button>
        </div>
      </div>

      {/* Primary Inputs */}
      <section className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-semibold text-slate-700">Initial Investment</label>
            <input 
              type="number"
              value={state.principal}
              onChange={(e) => updateState('principal', Number(e.target.value))}
              className="w-32 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-400"
            />
          </div>
          <input
            type="range"
            min="0"
            max="10000000"
            step="10000"
            value={state.principal}
            onChange={(e) => updateState('principal', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-semibold text-slate-700">Annual Rate (%)</label>
            <input 
              type="number"
              step="0.1"
              value={state.annualRate}
              onChange={(e) => updateState('annualRate', Number(e.target.value))}
              className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-400"
            />
          </div>
          <input
            type="range"
            min="0.1"
            max="40"
            step="0.1"
            value={state.annualRate}
            onChange={(e) => updateState('annualRate', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-semibold text-slate-700">Tenure (Years)</label>
            <input 
              type="number"
              value={state.tenureYears}
              onChange={(e) => updateState('tenureYears', Number(e.target.value))}
              className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-400"
            />
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={state.tenureYears}
            onChange={(e) => updateState('tenureYears', Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* SIP UI - Strictly gated to Wealth Building mode */}
        {state.mode === CalculatorMode.WEALTH_BUILDING && state.investmentType !== InvestmentType.IRREGULAR_ONLY && (
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-slate-700">Monthly SIP</label>
              <input 
                type="number"
                value={state.monthlyContribution}
                onChange={(e) => updateState('monthlyContribution', Number(e.target.value))}
                className="w-24 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-400"
              />
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="1000"
              value={state.monthlyContribution}
              onChange={(e) => updateState('monthlyContribution', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}
      </section>

      {/* Strategic Injections Section - Now visible in Basic Savings mode as well */}
      <section className="pt-6 border-t border-slate-100 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
          <i className="fas fa-layer-group text-blue-500 mr-2"></i>
          Strategic Injections
        </h4>
        
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">Amount (₹)</label>
            <input 
              type="number"
              value={injAmount}
              onChange={(e) => setInjAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g. 500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase">Start Month</label>
              <input 
                type="number"
                min="1"
                value={injStart}
                onChange={(e) => setInjStart(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase">For Months</label>
              <input 
                type="number"
                min="1"
                value={injDuration}
                onChange={(e) => setInjDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
          
          <button 
            onClick={addInjectionRule}
            className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus-circle"></i>
            ADD INJECTION
          </button>
        </div>

        <div className="space-y-2">
          {state.injectionRules.map((rule) => (
            <div key={rule.id} className="group flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(rule.amount)}</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Month {rule.startMonth} to {rule.endMonth} ({rule.endMonth - rule.startMonth + 1} mos)
                </span>
              </div>
              <button 
                onClick={() => removeInjectionRule(rule.id)}
                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Global Modifiers */}
      <section className="pt-6 border-t border-slate-100 space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Modifiers</h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-600 uppercase">Inflation Adjustment</label>
              <button 
                onClick={() => updateState('inflationEnabled', !state.inflationEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${state.inflationEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${state.inflationEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
            {state.inflationEnabled && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={state.inflationRate}
                  onChange={(e) => updateState('inflationRate', Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-600 uppercase">Capital Gains Tax</label>
              <button 
                onClick={() => updateState('taxEnabled', !state.taxEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${state.taxEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${state.taxEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
            {state.taxEnabled && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={state.taxRate}
                  onChange={(e) => updateState('taxRate', Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalculationPanel;
