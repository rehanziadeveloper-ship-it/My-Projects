import React, { useState } from 'react';
import { ChefHat, Bell, Shield, KeyRound, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    // Default PIN: 1234 or direct bypass for demo
    if (onLogin) onLogin(role);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md bg-stone-800 border border-stone-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 bg-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-orange-600/30">
            🍖
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Deewan-E-Khaas Staff</h2>
          <p className="text-xs text-stone-400 mt-1">Select your role to access floor terminal</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect('kitchen')}
            className="w-full p-4 rounded-2xl bg-stone-700/80 hover:bg-stone-700 active:scale-98 border border-stone-600 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Kitchen Display (KDS)</h3>
                <p className="text-xs text-stone-400">Live order tickets & cooking timers</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-white transition" />
          </button>

          <button
            onClick={() => handleRoleSelect('waiter')}
            className="w-full p-4 rounded-2xl bg-stone-700/80 hover:bg-stone-700 active:scale-98 border border-stone-600 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 group-hover:bg-red-600 group-hover:text-white transition">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Floor Waiter Terminal</h3>
                <p className="text-xs text-stone-400">Vibration & bell table call buzzer</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-white transition" />
          </button>

          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full p-4 rounded-2xl bg-stone-700/80 hover:bg-stone-700 active:scale-98 border border-stone-600 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Admin & QR Manager</h3>
                <p className="text-xs text-stone-400">Stock toggles & printable table QRs</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-white transition" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/chat?table=1"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
          >
            Go to Guest Chat (/chat?table=1) ➔
          </a>
        </div>
      </div>
    </div>
  );
}
