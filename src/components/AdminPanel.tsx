/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  FileCode, 
  Copy, 
  Check, 
  HelpCircle, 
  ExternalLink, 
  Settings2, 
  Database, 
  Info, 
  Play, 
  Save, 
  CloudLightning 
} from "lucide-react";
import { GOOGLE_APPS_SCRIPT_CODE } from "../utils/appsScriptCode";
import { SubmissionConfig } from "../types";

interface AdminPanelProps {
  config: SubmissionConfig;
  onSaveConfig: (newConfig: SubmissionConfig) => void;
  onClose: () => void;
}

export default function AdminPanel({ config, onSaveConfig, onClose }: AdminPanelProps) {
  const [copied, setCopied] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState(config.appsScriptUrl);
  const [useSimulation, setUseSimulation] = useState(config.useSimulation);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Impossibile copiare il codice: ", err);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      appsScriptUrl: appsScriptUrl.trim(),
      useSimulation,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto my-6 animate-fade-in" id="admin-panel-container">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight">Pannello Amministratore & Integrazione</h2>
            <p className="text-xs text-slate-400">Configura il database Google Sheets e l'archiviazione Google Drive</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
        >
          Chiudi Pannello
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
        
        {/* Sezione Stato e Switch Simulazione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-emerald-600" />
              Stato Connessione
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Google Apps Script Web App URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  id="apps-script-url-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {saveSuccess ? "Salvato!" : "Salva Configurazione"}
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium animate-pulse">
                  Configurazione aggiornata!
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600" />
                Modalità di Invio
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Senza un URL reale di Google Apps Script, puoi attivare la **Simulazione di Invio** per testare il flusso completo di compilazione, convalida e schermata finale.
              </p>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 mt-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Usa Simulazione</span>
                <span className="text-[10px] text-slate-500">Invia dati fittizi senza connettere Google Sheets</span>
              </div>
              <button
                onClick={() => {
                  setUseSimulation(!useSimulation);
                  onSaveConfig({ appsScriptUrl, useSimulation: !useSimulation });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${useSimulation ? "bg-emerald-500" : "bg-slate-300"}
                `}
                id="toggle-simulation"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${useSimulation ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Istruzioni Step by Step */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Come configurare il tuo Google Sheets e Google Drive in 5 minuti:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-800">1</div>
              <h4 className="text-xs font-bold text-slate-800">Crea il Foglio</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Crea un nuovo file su Google Sheets. Questo sarà il tuo database.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-800">2</div>
              <h4 className="text-xs font-bold text-slate-800">Apri Apps Script</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Clicca su <strong>Estensioni</strong> &rarr; <strong>Apps Script</strong> nel menu del foglio.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-800">3</div>
              <h4 className="text-xs font-bold text-slate-800">Incolla il Codice</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Copia il codice fornito qui sotto e incollalo nell'editor di Google.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-800">4</div>
              <h4 className="text-xs font-bold text-slate-800">Implementa</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Clicca <strong>Nuova implementazione</strong> &rarr; <strong>Applicazione web</strong>.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs">5</div>
              <h4 className="text-xs font-bold text-slate-800">Copia l'URL</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Seleziona <em>"Chiunque"</em> come accesso, implementa e copia l'URL qui sopra.</p>
            </div>
          </div>
        </div>

        {/* Codice da copiare */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              Codice Google Apps Script
            </h3>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copiato!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copia Codice
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-4">
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-[250px] leading-relaxed">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800">Nota sull'Archiviazione dei File</h4>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Questo script crea automaticamente una cartella nominata <strong>"Tesseramenti_2026_2027"</strong> nel tuo account Google Drive personale. Tutti i documenti allegati verranno depositati lì dentro, rinominati secondo le direttive (es: COGNOME_NOME_CertificatoMedico.pdf), e i link generati saranno incollati nella riga corrispondente del Foglio Google.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
