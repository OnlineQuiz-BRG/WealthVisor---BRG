
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, CalculatorMode, InvestmentType, CompoundFrequency, Scenario, InjectionRule, User, UserRole } from './types';
import { calculateFinance } from './utils/math';
import CalculationPanel from './components/CalculationPanel';
import SummaryCards from './components/SummaryCards';
import GrowthChart from './components/GrowthChart';
import ScheduleTable from './components/ScheduleTable';
import ComparisonView from './components/ComparisonView';
import AuthModule from './components/AuthModule';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  // Global User Registry (Simulated DB)
  const [registry, setRegistry] = useState<User[]>([]);
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const [state, setState] = useState<AppState>({
    mode: CalculatorMode.WEALTH_BUILDING,
    investmentType: InvestmentType.SIP,
    principal: 500000,
    annualRate: 12,
    tenureYears: 15,
    monthlyContribution: 5000,
    compoundFrequency: CompoundFrequency.MONTHLY,
    injectionRules: [],
    inflationRate: 6,
    taxRate: 15,
    loanPrepaymentStrategy: 'REDUCE_TENURE',
    taxEnabled: true,
    inflationEnabled: true
  });

  const [isComparing, setIsComparing] = useState(false);

  // Load user registry from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wv_user_registry');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRegistry(parsed);
      } catch (e) { console.error(e); }
    } else {
      // Create initial admin if none exists
      const initialAdmin: User = {
        id: 'admin_root',
        email: 'admin@wealthvisor.com',
        password: 'admin123',
        role: UserRole.ADMIN,
        scenarios: [],
        createdAt: Date.now()
      };
      setRegistry([initialAdmin]);
    }
  }, []);

  // Save registry whenever it changes
  useEffect(() => {
    if (registry.length > 0) {
      localStorage.setItem('wv_user_registry', JSON.stringify(registry));
    }
  }, [registry]);

  const calculationResult = useMemo(() => calculateFinance(state), [state]);

  const handleSaveScenario = (name: string) => {
    if (!currentUser) return;
    
    const newScenario: Scenario = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      state: { ...state },
      result: calculationResult,
      timestamp: Date.now()
    };

    const updatedRegistry = registry.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, scenarios: [newScenario, ...u.scenarios] };
      }
      return u;
    });

    setRegistry(updatedRegistry);
    setCurrentUser(updatedRegistry.find(u => u.id === currentUser.id) || null);
  };

  const removeScenario = (id: string) => {
    if (!currentUser) return;
    const updatedRegistry = registry.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, scenarios: u.scenarios.filter(s => s.id !== id) };
      }
      return u;
    });
    setRegistry(updatedRegistry);
    setCurrentUser(updatedRegistry.find(u => u.id === currentUser.id) || null);
  };

  const deleteUser = (id: string) => {
    const updated = registry.filter(u => u.id !== id);
    setRegistry(updated);
  };

  const handleAddInjection = (month: number) => {
    const amountStr = prompt(`Add extra amount for Month ${month}:`);
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) {
        const durationStr = prompt(`How many months should this injection continue?`, "1");
        const duration = parseInt(durationStr || "1");
        
        const newRule: InjectionRule = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          startMonth: month,
          endMonth: month + Math.max(0, duration - 1)
        };

        setState(prev => ({
          ...prev,
          injectionRules: [...prev.injectionRules, newRule]
        }));
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminPanelOpen(false);
  };

  if (!currentUser) {
    return <AuthModule onLogin={setCurrentUser} registry={registry} onUpdateRegistry={setRegistry} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Panel */}
      {isAdminPanelOpen && currentUser.role === UserRole.ADMIN && (
        <AdminPanel users={registry} onDelete={deleteUser} onClose={() => setIsAdminPanelOpen(false)} />
      )}

      {/* Comparison Overlay */}
      {isComparing && (
        <ComparisonView 
          scenarios={currentUser.scenarios} 
          onClose={() => setIsComparing(false)} 
          onRemove={removeScenario}
        />
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-compass text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 leading-tight">WealthVisor</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Universal Financial Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => setIsComparing(true)}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-columns"></i>
            <span className="hidden sm:inline">Comparison ({currentUser.scenarios.length})</span>
          </button>
          
          {currentUser.role === UserRole.ADMIN && (
            <button 
              onClick={() => setIsAdminPanelOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all"
              title="Admin Panel"
            >
              <i className="fas fa-shield-halved"></i>
            </button>
          )}

          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{currentUser.email}</p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{currentUser.role}</p>
            </div>
            <button 
              onClick={logout}
              className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center"
              title="Logout"
            >
              <i className="fas fa-power-off"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Side: Inputs */}
        <CalculationPanel 
          state={state} 
          setState={setState} 
          onSaveScenario={handleSaveScenario}
          onOpenComparison={() => setIsComparing(true)}
          savedCount={currentUser.scenarios.length}
        />

        {/* Right Side: Visuals */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50">
          {/* Summary */}
          <SummaryCards result={calculationResult} state={state} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <GrowthChart result={calculationResult} />
              <ScheduleTable result={calculationResult} onAddInjection={handleAddInjection} />
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center">
                  <i className="fas fa-bullseye text-blue-500 mr-2"></i>
                  Growth Milestones
                </h3>
                <div className="space-y-4">
                  {calculationResult.milestones.length > 0 ? (
                    calculationResult.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{m.label}</p>
                          <p className="text-sm font-extrabold text-slate-800">{m.preciseYear.toFixed(1)} Years</p>
                          {m.ruleOf72 && <p className="text-[10px] text-blue-500 mt-1 font-semibold">{m.ruleOf72}</p>}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i className="fas fa-check text-blue-600 text-xs"></i>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-8">No milestones reached in this tenure</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-200">
                <h3 className="text-lg font-bold mb-2">Smart Insight</h3>
                <p className="text-sm text-blue-100 mb-4 opacity-90 leading-relaxed">
                  Welcome {currentUser.role === UserRole.ADMIN ? 'Commander' : 'Investor'}. 
                  {state.taxEnabled ? 
                    ` At a ${state.taxRate}% tax rate, your actual earnings are reduced significantly. Injections help counter this.` :
                    ` Your currently modeled strategy has a maturity of ${(calculationResult.maturityValue / 1000000).toFixed(1)}M.`
                  }
                </p>
                <button 
                  onClick={() => setIsComparing(true)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-md border border-white/20"
                >
                  Manage My Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
