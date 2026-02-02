
import React, { useState } from 'react';
import { AuthView, User, UserRole } from '../types';

interface Props {
  onLogin: (user: User) => void;
  registry: User[];
  onUpdateRegistry: (users: User[]) => void;
}

const AuthModule: React.FC<Props> = ({ onLogin, registry, onUpdateRegistry }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (view === 'LOGIN') {
      const user = registry.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password.');
      }
    } else if (view === 'SIGNUP') {
      if (registry.some(u => u.email === email)) {
        setError('Email already exists.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        role: email === 'admin@wealthvisor.com' ? UserRole.ADMIN : UserRole.USER,
        scenarios: [],
        createdAt: Date.now()
      };
      onUpdateRegistry([...registry, newUser]);
      onLogin(newUser);
    } else if (view === 'FORGOT') {
      const userIdx = registry.findIndex(u => u.email === email);
      if (userIdx > -1) {
        const newRegistry = [...registry];
        newRegistry[userIdx].password = password; // In simulation, we just update it
        onUpdateRegistry(newRegistry);
        setSuccess('Password updated successfully. You can now login.');
        setView('LOGIN');
      } else {
        setError('Email not found in our registry.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <i className="fas fa-compass text-white text-3xl"></i>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">
            {view === 'LOGIN' ? 'Welcome Back' : view === 'SIGNUP' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            {view === 'LOGIN' ? 'Access your financial intelligence' : view === 'SIGNUP' ? 'Join WealthVisor ecosystem' : 'Recover your account access'}
          </p>

          <form onSubmit={handleAction} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">{success}</div>}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                {view === 'FORGOT' ? 'New Password' : 'Password'}
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95">
              {view === 'LOGIN' ? 'SIGN IN' : view === 'SIGNUP' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
            {view === 'LOGIN' ? (
              <>
                <button onClick={() => setView('SIGNUP')} className="w-full text-sm font-bold text-blue-600 hover:text-blue-700">Don't have an account? Sign Up</button>
                <button onClick={() => setView('FORGOT')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Forgot Password?</button>
              </>
            ) : (
              <button onClick={() => setView('LOGIN')} className="w-full text-sm font-bold text-blue-600 hover:text-blue-700">Already have an account? Sign In</button>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Admin Preview: admin@wealthvisor.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModule;
