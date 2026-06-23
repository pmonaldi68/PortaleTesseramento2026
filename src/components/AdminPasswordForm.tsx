/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";

interface AdminPasswordFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AdminPasswordForm({ onSuccess, onClose }: AdminPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === "cynthia1920") {
      onSuccess();
    } else {
      setError("Password errata. Riprova.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="max-w-md mx-auto my-12"
      id="admin-password-form-container"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header con i colori sociali Cynthia Blue & Gold */}
        <div className="bg-gradient-to-r from-cynthia-blue-700 to-cynthia-blue-600 px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/15 hover:bg-black/25 text-white/80 hover:text-white transition-colors"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-2 mt-2">
            <div className="p-3 bg-white/10 rounded-full border border-white/20 text-cynthia-gold-200">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display tracking-tight">Area Riservata Amministratore</h2>
              <p className="text-xs text-cynthia-blue-100">Inserisci la password di sicurezza per configurare i parametri</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cynthia-blue-600" />
              Password Amministratore
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full pl-3 pr-10 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-cynthia-blue-500/20 focus:border-cynthia-blue-600 transition-all
                  ${error ? "border-red-500 bg-red-50/10 focus:ring-red-500/20" : "border-slate-200 focus:ring-cynthia-blue-500/20"}
                `}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium animate-shake">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <div className="bg-cynthia-gold-50/50 border border-cynthia-gold-100 rounded-xl p-3 text-[11px] text-cynthia-gold-700 leading-relaxed">
            <span className="font-bold">Suggerimento per il test:</span> la password predefinita è <code className="bg-cynthia-gold-100/80 px-1.5 py-0.5 rounded font-mono text-xs font-bold text-cynthia-gold-800">cynthia1920</code>.
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-cynthia-blue-600 hover:bg-cynthia-blue-700 rounded-xl transition-all shadow-md shadow-cynthia-blue-600/10"
            >
              Accedi
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
