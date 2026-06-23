/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, Home, Users } from "lucide-react";

interface SuccessScreenProps {
  onReset: () => void;
}

export default function SuccessScreen({ onReset }: SuccessScreenProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 md:p-12 space-y-6 animate-fade-in" id="success-screen-container">
      
      {/* Icona successo animata */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="p-4 bg-cynthia-blue-50 rounded-full border border-cynthia-blue-100 text-cynthia-blue-600"
        >
          <CheckCircle2 className="w-16 h-16 text-cynthia-blue-500" />
        </motion.div>
      </div>

      {/* Testo di Conferma */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 tracking-tight">
          Tesseramento Ricevuto!
        </h1>
        <p className="text-cynthia-blue-700 font-semibold bg-cynthia-blue-50 border border-cynthia-blue-100/50 px-4 py-2 rounded-xl inline-block text-sm">
          Dati inviati con successo alla segreteria. Grazie per la collaborazione!
        </p>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto pt-2">
          La segreteria dell'associazione esaminerà la tua richiesta e i documenti caricati. Riceverai una notifica di conferma del tesseramento FIGC/LND via email non appena la pratica sarà completata.
        </p>
      </div>

      {/* Dettagli processo successivo */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 text-xs max-w-md mx-auto">
        <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Users className="w-4 h-4 text-cynthia-gold-600" />
          Prossimi Passaggi:
        </h4>
        <ul className="space-y-2 text-slate-600">
          <li className="flex gap-2">
            <span className="font-bold text-cynthia-blue-600">1.</span>
            <span>La segreteria scarica e archivia i tuoi documenti su <strong>Google Drive</strong>.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-cynthia-blue-600">2.</span>
            <span>I tuoi dati vengono iscritti nel registro di <strong>Google Sheets</strong> per la ratifica del Consiglio Direttivo.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-cynthia-blue-600">3.</span>
            <span>Inoltro formale sul portale federale FIGC e attivazione della copertura assicurativa sportiva.</span>
          </li>
        </ul>
      </div>

      {/* Pulsante per nuova registrazione */}
      <div className="pt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 mx-auto hover:-translate-y-0.5 duration-150 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Nuovo Inserimento / Esci
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
