/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Settings2, 
  HelpCircle, 
  Database, 
  ShieldCheck, 
  Play, 
  ChevronRight,
  Info
} from "lucide-react";
import RegistrationForm from "./components/RegistrationForm";
import AdminPanel from "./components/AdminPanel";
import SuccessScreen from "./components/SuccessScreen";
import AdminPasswordForm from "./components/AdminPasswordForm";
import cynthiaLogo from "./assets/images/cynthia_logo_1782246937952.jpg";
import { SubmissionConfig } from "./types";

const LOCAL_STORAGE_KEY = "asd_tesseramento_config";

export default function App() {
  const [config, setConfig] = useState<SubmissionConfig>({
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || "",
    useSimulation: !import.meta.env.VITE_APPS_SCRIPT_URL,
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Carica la configurazione salvata all'avvio
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (e) {
        console.error("Errore caricamento configurazione:", e);
      }
    } else if (import.meta.env.VITE_APPS_SCRIPT_URL) {
      setConfig({
        appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL,
        useSimulation: false,
      });
    }
  }, []);

  const handleSaveConfig = (newConfig: SubmissionConfig) => {
    setConfig(newConfig);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      {/* Top Banner Informativo per l'amministratore dell'ASD */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cynthia-gold-500" />
          <span>
            {config.useSimulation ? (
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Modalità Simulazione Attiva (Test rapido senza Google Sheets)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-cynthia-gold-500">
                <span className="w-2 h-2 rounded-full bg-cynthia-gold-500 animate-pulse" />
                Integrazione Google Sheets Attiva
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 hidden sm:inline">Sei l'amministratore dell'ASD?</span>
          <button
            onClick={() => {
              if (showAdmin) {
                setShowAdmin(false);
                setIsAdminAuthenticated(false);
              } else {
                setShowAdmin(true);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-semibold transition-all border border-slate-700 cursor-pointer text-[11px]"
            title="Configura l'integrazione con Google Sheets e Drive"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {showAdmin ? "Nascondi Setup" : "Setup Google Sheets & Drive"}
          </button>
        </div>
      </div>

      {/* Header principale della ASD */}
      <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
          {/* Logo Cynthia 1920 */}
          <div className="w-9 h-9 flex items-center justify-center select-none shrink-0">
            <img 
              src={cynthiaLogo} 
              alt="Cynthia 1920 Logo" 
              className="w-9 h-9 object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display text-slate-900 tracking-tight leading-tight">
              S.S.D. Cynthia 1920
            </h1>
            <p className="text-[9px] md:text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Segreteria Digitale Portale Tesseramento
            </p>
          </div>
        </div>
      </header>

      {/* Area Contenuto */}
      <main className="flex-1 px-4 py-8 md:py-12 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {showAdmin ? (
          !isAdminAuthenticated ? (
            <AdminPasswordForm 
              onSuccess={() => setIsAdminAuthenticated(true)}
              onClose={() => setShowAdmin(false)}
            />
          ) : (
            <AdminPanel
              config={config}
              onSaveConfig={handleSaveConfig}
              onClose={() => {
                setShowAdmin(false);
                setIsAdminAuthenticated(false);
              }}
            />
          )
        ) : isSubmitted ? (
          <SuccessScreen onReset={handleResetForm} />
        ) : (
          <div className="space-y-6">
            {/* Quick alert if no Google Sheets configured yet */}
            {config.useSimulation && !config.appsScriptUrl && (
              <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 animate-fade-in shadow-sm">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Database Google Sheets non ancora collegato</p>
                  <p className="leading-relaxed">
                    Al momento stai provando l'app in <strong>Modalità Simulazione</strong>. Puoi compilare l'intero form, caricare file di prova e visualizzare il successo finale. 
                    Se vuoi collegare l'app a un foglio <strong>Google Sheets</strong> e salvare i file reali su <strong>Google Drive</strong>, clicca sul pulsante <strong>"Setup Google Sheets & Drive"</strong> in alto a destra per configurare l'integrazione in meno di 5 minuti.
                  </p>
                </div>
              </div>
            )}

            <RegistrationForm
              config={config}
              onSuccess={() => setIsSubmitted(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© 2026 S.S.D. Cynthia 1920. Tutti i diritti riservati.</p>
          <p className="text-[10px] text-slate-400 leading-normal max-w-lg mx-auto">
            In conformità con le disposizioni FIGC, LND e il Regolamento Generale sulla Protezione dei Dati (GDPR). Tutti i caricamenti di documenti d'identità e certificati medici sono trattati in modo sicuro e cifrati per la salvaguardia della privacy dei tesserati.
          </p>
        </div>
      </footer>
    </div>
  );
}
