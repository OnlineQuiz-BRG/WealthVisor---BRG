
import React from 'react';
import { User, UserRole } from '../types';

interface Props {
  users: User[];
  onDelete: (id: string) => void;
  onUpdatePassword: (id: string, newPass: string) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<Props> = ({ users, onDelete, onUpdatePassword, onClose }) => {
  const handleResetPassword = (u: User) => {
    const newPass = prompt(`Reset password for ${u.email}:`, 'User@123');
    if (newPass) {
      onUpdatePassword(u.id, newPass);
      alert('Password updated for ' + u.email);
    }
  };

  const simulateSync = () => {
    alert('Syncing user database to Google Sheets... [Simulated]');
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Email,Role,Scenarios,Joined\n"
        + users.map(u => `${u.id},${u.email},${u.role},${u.scenarios.length},${new Date(u.createdAt).toISOString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wealthvisor_database.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[80vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Admin Command Center</h2>
            <p className="text-sm text-slate-500 font-medium">Manage user accounts and system access</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={simulateSync}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all flex items-center gap-2"
            >
              <i className="fas fa-file-excel"></i>
              SYNC TO SHEETS
            </button>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Total Users</span>
              <p className="text-3xl font-black text-blue-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest">Active Scenarios</span>
              <p className="text-3xl font-black text-emerald-900 mt-1">
                {users.reduce((acc, u) => acc + u.scenarios.length, 0)}
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
              <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">System Health</span>
              <p className="text-3xl font-black text-amber-900 mt-1">Optimal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Plans</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{u.email}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter ${
                        u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{u.scenarios.length}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(u)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all flex items-center justify-center"
                          title="Reset Password"
                        >
                          <i className="fas fa-key text-xs"></i>
                        </button>
                        {u.role !== UserRole.ADMIN && (
                          <button 
                            onClick={() => onDelete(u.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center"
                            title="Delete Account"
                          >
                            <i className="fas fa-user-slash text-xs"></i>
                          </button>
                        )}
                      </div>
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

export default AdminPanel;
