/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  FileCheck, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  Copy 
} from "lucide-react";
import { 
  Ruolo, 
  TesseramentoFormData, 
  FileData, 
  SubmissionConfig 
} from "../types";
import { 
  validateCodiceFiscale, 
  validateEmail, 
  validateTelefono, 
  validateCAP, 
  calcolaEta 
} from "../utils/validation";
import FileUpload from "./FileUpload";

interface RegistrationFormProps {
  config: SubmissionConfig;
  onSuccess: () => void;
}

const initialFormState: TesseramentoFormData = {
  atleta: {
    ruolo: Ruolo.GIOCATORE,
    cognome: "",
    nome: "",
    codiceFiscale: "",
    dataNascita: "",
    luogoNascita: "",
    provinciaNascita: "",
    indirizzoCompleto: {
      via: "",
      civico: "",
      cap: "",
      comune: "",
      provincia: "",
    },
    telefono: "",
    email: "",
    docIdentita: null,
    certificatoMedico: null,
  },
  isMinorenne: false,
  genitore1: {
    cognome: "",
    nome: "",
    codiceFiscale: "",
    indirizzoCompleto: {
      via: "",
      civico: "",
      cap: "",
      comune: "",
      provincia: "",
    },
    telefono: "",
    email: "",
    docIdentita: null,
  },
  genitore2: {
    cognome: "",
    nome: "",
    codiceFiscale: "",
    indirizzoCompleto: {
      via: "",
      civico: "",
      cap: "",
      comune: "",
      provincia: "",
    },
    telefono: "",
    email: "",
    docIdentita: null,
  },
};

export default function RegistrationForm({ config, onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<TesseramentoFormData>(initialFormState);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcola automaticamente se l'atleta è minorenne quando cambiano ruolo o data di nascita
  useEffect(() => {
    const eta = calcolaEta(formData.atleta.dataNascita);
    const isMinore = formData.atleta.ruolo === Ruolo.GIOCATORE && eta < 18 && formData.atleta.dataNascita !== "";
    setFormData((prev) => ({
      ...prev,
      isMinorenne: isMinore,
    }));
  }, [formData.atleta.dataNascita, formData.atleta.ruolo]);

  const steps = [
    { id: "ruolo", label: "Selezione Ruolo" },
    { id: "anagrafica", label: "Dati Personali" },
    { id: "documenti", label: "Documenti e Certificati" },
    ...(formData.isMinorenne ? [{ id: "genitori", label: "Dati Esercenti Potestà" }] : []),
    { id: "riepilogo", label: "Riepilogo e Invio" },
  ];

  // Helper per copiare l'indirizzo dell'atleta al genitore
  const copyAddressToGenitore = (genNum: 1 | 2) => {
    const indirizzoAtleta = { ...formData.atleta.indirizzoCompleto };
    setFormData((prev) => {
      const target = genNum === 1 ? "genitore1" : "genitore2";
      return {
        ...prev,
        [target]: {
          ...prev[target],
          indirizzoCompleto: indirizzoAtleta,
        },
      };
    });
  };

  // Validazione di ogni singolo step
  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    const a = formData.atleta;

    if (stepIndex === 0) {
      // Step Ruolo: sempre valido dato che ha un valore di default
      return true;
    }

    if (stepIndex === 1) {
      // Step Anagrafica Atleta
      if (!a.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";
      if (!a.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
      
      if (!a.codiceFiscale.trim()) {
        newErrors.codiceFiscale = "Il Codice Fiscale è obbligatorio";
      } else if (!validateCodiceFiscale(a.codiceFiscale)) {
        newErrors.codiceFiscale = "Codice Fiscale non valido (deve essere di 16 caratteri alfanumerici)";
      }

      if (!a.dataNascita) {
        newErrors.dataNascita = "La data di nascita è obbligatoria";
      } else {
        const eta = calcolaEta(a.dataNascita);
        if (eta < 5) {
          newErrors.dataNascita = "L'atleta deve avere almeno 5 anni per il tesseramento";
        }
      }

      if (!a.luogoNascita.trim()) {
        newErrors.luogoNascita = "Il comune di nascita è obbligatorio";
      }
      if (!a.provinciaNascita.trim()) {
        newErrors.provinciaNascita = "La provincia di nascita è obbligatoria";
      } else if (a.provinciaNascita.trim().length !== 2) {
        newErrors.provinciaNascita = "Usa la sigla di 2 lettere (es. MI)";
      }
      
      // Indirizzo
      if (!a.indirizzoCompleto.via.trim()) newErrors.via = "La via/piazza è obbligatoria";
      if (!a.indirizzoCompleto.civico.trim()) newErrors.civico = "Il n° civico è obbligatorio";
      if (!a.indirizzoCompleto.cap.trim()) {
        newErrors.cap = "Il CAP è obbligatorio";
      } else if (!validateCAP(a.indirizzoCompleto.cap)) {
        newErrors.cap = "Il CAP deve essere di 5 cifre numeriche";
      }
      if (!a.indirizzoCompleto.comune.trim()) newErrors.comune = "Il comune è obbligatorio";
      if (!a.indirizzoCompleto.provincia.trim()) {
        newErrors.provincia = "La provincia è obbligatoria";
      } else if (a.indirizzoCompleto.provincia.trim().length !== 2) {
        newErrors.provincia = "Usa la sigla di 2 lettere (es. MI)";
      }

      // Contatti
      if (!a.telefono.trim()) {
        newErrors.telefono = "Il telefono è obbligatorio";
      } else if (!validateTelefono(a.telefono)) {
        newErrors.telefono = "Numero di telefono non valido";
      }

      if (!a.email.trim()) {
        newErrors.email = "L'email è obbligatoria";
      } else if (!validateEmail(a.email)) {
        newErrors.email = "Indirizzo email non valido";
      }
    }

    if (stepIndex === 2) {
      // Step Documenti Atleta
      if (!a.docIdentita) {
        newErrors.docIdentita = "Il Documento d'Identità dell'atleta è obbligatorio";
      }
      if (!a.certificatoMedico) {
        newErrors.certificatoMedico = "Il Certificato Medico è obbligatorio";
      }
    }

    // Se l'atleta è minorenne, c'è lo step dei genitori
    if (formData.isMinorenne && stepIndex === 3) {
      const g1 = formData.genitore1;
      const g2 = formData.genitore2;

      // Validazione Genitore 1
      if (!g1.cognome.trim()) newErrors.g1_cognome = "Il cognome del Genitore 1 è obbligatorio";
      if (!g1.nome.trim()) newErrors.g1_nome = "Il nome del Genitore 1 è obbligatorio";
      if (!g1.codiceFiscale.trim()) {
        newErrors.g1_codiceFiscale = "Il Codice Fiscale del Genitore 1 è obbligatorio";
      } else if (!validateCodiceFiscale(g1.codiceFiscale)) {
        newErrors.g1_codiceFiscale = "Codice Fiscale Genitore 1 non valido";
      }
      
      if (!g1.indirizzoCompleto.via.trim()) newErrors.g1_via = "Indirizzo obbligatorio";
      if (!g1.indirizzoCompleto.civico.trim()) newErrors.g1_civico = "Civico obbligatorio";
      if (!g1.indirizzoCompleto.cap.trim() || !validateCAP(g1.indirizzoCompleto.cap)) {
        newErrors.g1_cap = "CAP non valido (5 cifre)";
      }
      if (!g1.indirizzoCompleto.comune.trim()) newErrors.g1_comune = "Comune obbligatorio";
      if (!g1.indirizzoCompleto.provincia.trim() || g1.indirizzoCompleto.provincia.trim().length !== 2) {
        newErrors.g1_provincia = "Provincia non valida";
      }

      if (!g1.telefono.trim() || !validateTelefono(g1.telefono)) {
        newErrors.g1_telefono = "Telefono del Genitore 1 non valido o mancante";
      }
      if (!g1.email.trim() || !validateEmail(g1.email)) {
        newErrors.g1_email = "Email del Genitore 1 non valida o mancante";
      }
      if (!g1.docIdentita) {
        newErrors.g1_docIdentita = "Il Documento d'Identità del Genitore 1 è obbligatorio";
      }

      // Validazione Genitore 2
      if (!g2.cognome.trim()) newErrors.g2_cognome = "Il cognome del Genitore 2 è obbligatorio";
      if (!g2.nome.trim()) newErrors.g2_nome = "Il nome del Genitore 2 è obbligatorio";
      if (!g2.codiceFiscale.trim()) {
        newErrors.g2_codiceFiscale = "Il Codice Fiscale del Genitore 2 è obbligatorio";
      } else if (!validateCodiceFiscale(g2.codiceFiscale)) {
        newErrors.g2_codiceFiscale = "Codice Fiscale Genitore 2 non valido";
      }

      if (!g2.indirizzoCompleto.via.trim()) newErrors.g2_via = "Indirizzo obbligatorio";
      if (!g2.indirizzoCompleto.civico.trim()) newErrors.g2_civico = "Civico obbligatorio";
      if (!g2.indirizzoCompleto.cap.trim() || !validateCAP(g2.indirizzoCompleto.cap)) {
        newErrors.g2_cap = "CAP non valido (5 cifre)";
      }
      if (!g2.indirizzoCompleto.comune.trim()) newErrors.g2_comune = "Comune obbligatorio";
      if (!g2.indirizzoCompleto.provincia.trim() || g2.indirizzoCompleto.provincia.trim().length !== 2) {
        newErrors.g2_provincia = "Provincia non valida";
      }

      if (!g2.telefono.trim() || !validateTelefono(g2.telefono)) {
        newErrors.g2_telefono = "Telefono del Genitore 2 non valido o mancante";
      }
      if (!g2.email.trim() || !validateEmail(g2.email)) {
        newErrors.g2_email = "Email del Genitore 2 non valida o mancante";
      }
      if (!g2.docIdentita) {
        newErrors.g2_docIdentita = "Il Documento d'Identità del Genitore 2 è obbligatorio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scrolla al primo errore visibile
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const firstErrorEl = document.getElementById(errorKeys[0]);
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Invio reale dei dati o simulazione
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    if (config.useSimulation) {
      // Simula invio dati
      setTimeout(() => {
        setSubmitting(false);
        onSuccess();
      }, 2000);
    } else {
      // Invio reale alla Web App di Google Apps Script
      if (!config.appsScriptUrl) {
        setSubmitError("L'URL di Google Apps Script non è configurato. Contatta l'amministratore dell'ASD o attiva la simulazione nel pannello in alto.");
        setSubmitting(false);
        return;
      }

      try {
        const response = await fetch(config.appsScriptUrl, {
          method: "POST",
          mode: "no-cors", // Necessario per superare le limitazioni di sicurezza di alcune configurazioni Google Web App
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Con no-cors non possiamo leggere il body della risposta direttamente in modo pulito (restituisce un'opaque response),
        // ma la richiesta parte comunque con successo. Trattiamo l'invio andato a buon fine se non lancia eccezioni.
        setSubmitting(false);
        onSuccess();
      } catch (err: any) {
        console.error("Errore durante l'invio:", err);
        setSubmitError(`Errore durante il salvataggio dei dati: ${err.message || "Errore sconosciuto"}`);
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden" id="form-container">
      
      {/* Intestazione Wizard */}
      <div className="bg-slate-50/70 border-b border-slate-200/60 px-6 py-6 text-center">
        <h1 className="text-lg md:text-xl font-bold font-display tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-slate-800" />
          Tesseramento Stagione 2026/2027
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Inserisci i dati richiesti e allega la documentazione per completare la tua iscrizione alla nostra ASD.
        </p>

        {/* Barra di Progresso */}
        <div className="mt-6 flex items-center justify-between max-w-md mx-auto text-[10px] md:text-xs">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 z-10
                ${idx < currentStep 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : idx === currentStep 
                    ? "bg-slate-950 border-slate-950 text-white shadow-sm ring-4 ring-slate-950/10 scale-110 font-bold" 
                    : "bg-white border-slate-200 text-slate-400"
                }
              `}>
                {idx < currentStep ? "✓" : idx + 1}
              </div>
              <span className={`mt-1.5 text-[9px] text-center font-medium transition-colors hidden sm:block
                ${idx === currentStep ? "text-slate-900 font-bold" : "text-slate-400"}
              `}>
                {step.label}
              </span>
              
              {/* Linee di collegamento */}
              {idx < steps.length - 1 && (
                <div className={`absolute top-3 left-[calc(50%+12px)] right-[calc(-50%+12px)] h-0.5 -z-0 transition-colors duration-300
                  ${idx < currentStep ? "bg-emerald-600" : "bg-slate-200"}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 0: SELEZIONE RUOLO */}
          {currentStep === 0 && (
            <motion.div
              key="step-ruolo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-slate-800">Seleziona il tuo ruolo nell'ASD</h2>
                <p className="text-xs text-slate-500">La scelta del ruolo adatterà dinamicamente i campi richiesti nel form di iscrizione.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[
                  {
                    ruolo: Ruolo.GIOCATORE,
                    title: "Atleta / Giocatore",
                    desc: "Tesseramento per i calciatori che disputeranno i campionati di categoria della stagione.",
                    icon: User,
                  },
                  {
                    ruolo: Ruolo.ALLENATORE,
                    title: "Allenatore / Staff",
                    desc: "Tesseramento per tecnici, preparatori, fisioterapisti e staff tecnico delle squadre.",
                    icon: FileCheck,
                  },
                  {
                    ruolo: Ruolo.DIRIGENTE,
                    title: "Dirigente Accompagnatore",
                    desc: "Tesseramento per dirigenti di società, responsabili e assistenti ufficiali di gara.",
                    icon: Users,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.atleta.ruolo === item.ruolo;
                  return (
                    <button
                      key={item.ruolo}
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        atleta: { ...prev.atleta, ruolo: item.ruolo },
                      }))}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-200 cursor-pointer group hover:shadow-sm
                        ${isSelected 
                          ? "border-slate-950 bg-slate-50/50 ring-1 ring-slate-950/5" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                        }
                      `}
                    >
                      <div className="space-y-3">
                        <div className={`p-3 rounded-xl w-fit transition-colors
                          ${isSelected 
                            ? "bg-slate-950 text-white" 
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                      </div>
 
                      <div className="mt-4 flex items-center justify-end w-full">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all
                          ${isSelected 
                            ? "border-slate-950 bg-slate-950 text-white" 
                            : "border-slate-300"
                          }
                        `}>
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 1: ANAGRAFICA ATLETA */}
          {currentStep === 1 && (
            <motion.div
              key="step-anagrafica"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Dati Anagrafici Atleta ({formData.atleta.ruolo})</h2>
                <p className="text-xs text-slate-500">I campi contrassegnati con l'asterisco (*) sono strettamente obbligatori.</p>
              </div>

              {/* Nome & Cognome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" id="cognome-label">
                    Cognome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., ROSSI"
                    value={formData.atleta.cognome}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      atleta: { ...prev.atleta, cognome: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase
                      ${errors.cognome ? "border-red-500" : "border-slate-300"}
                    `}
                    id="cognome"
                  />
                  {errors.cognome && <p className="text-[11px] text-red-500">{errors.cognome}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" id="nome-label">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., MARIO"
                    value={formData.atleta.nome}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      atleta: { ...prev.atleta, nome: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase
                      ${errors.nome ? "border-red-500" : "border-slate-300"}
                    `}
                    id="nome"
                  />
                  {errors.nome && <p className="text-[11px] text-red-500">{errors.nome}</p>}
                </div>
              </div>

              {/* Codice Fiscale */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700" id="codiceFiscale-label">
                  Codice Fiscale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.g., RSSMRA80A01H501U"
                  maxLength={16}
                  value={formData.atleta.codiceFiscale}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    atleta: { ...prev.atleta, codiceFiscale: e.target.value.toUpperCase() },
                  }))}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                    ${errors.codiceFiscale ? "border-red-500" : "border-slate-300"}
                  `}
                  id="codiceFiscale"
                />
                {errors.codiceFiscale ? (
                  <p className="text-[11px] text-red-500">{errors.codiceFiscale}</p>
                ) : (
                  <p className="text-[10px] text-slate-400">Inserisci i 16 caratteri alfanumerici del codice fiscale dell'atleta.</p>
                )}
              </div>

              {/* Data di Nascita & Luogo e Provincia di Nascita */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700" id="dataNascita-label">
                    Data di Nascita <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.atleta.dataNascita}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: { ...prev.atleta, dataNascita: e.target.value },
                      }))}
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        ${errors.dataNascita ? "border-red-500" : "border-slate-300"}
                      `}
                      id="dataNascita"
                    />
                  </div>
                  {errors.dataNascita ? (
                    <p className="text-[11px] text-red-500">{errors.dataNascita}</p>
                  ) : formData.isMinorenne && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Atleta Minorenne: sarà richiesta l'autorizzazione dei genitori.
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700" id="luogoNascita-label">
                    Comune di Nascita <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., MILANO"
                    value={formData.atleta.luogoNascita}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      atleta: { ...prev.atleta, luogoNascita: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase
                      ${errors.luogoNascita ? "border-red-500" : "border-slate-300"}
                    `}
                    id="luogoNascita"
                  />
                  {errors.luogoNascita && <p className="text-[11px] text-red-500">{errors.luogoNascita}</p>}
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700" id="provinciaNascita-label">
                    Provincia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., MI"
                    maxLength={2}
                    value={formData.atleta.provinciaNascita}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      atleta: { ...prev.atleta, provinciaNascita: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase text-center font-semibold
                      ${errors.provinciaNascita ? "border-red-500" : "border-slate-300"}
                    `}
                    id="provinciaNascita"
                  />
                  {errors.provinciaNascita && <p className="text-[11px] text-red-500">{errors.provinciaNascita}</p>}
                </div>
              </div>

              {/* Indirizzo Completo */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Indirizzo di Residenza Completo
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600" id="via-label">
                      Via/Piazza <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., VIA ROMA"
                      value={formData.atleta.indirizzoCompleto.via}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: {
                          ...prev.atleta,
                          indirizzoCompleto: { ...prev.atleta.indirizzoCompleto, via: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.via ? "border-red-500" : "border-slate-300"}
                      `}
                      id="via"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600" id="civico-label">
                      Civico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., 10"
                      value={formData.atleta.indirizzoCompleto.civico}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: {
                          ...prev.atleta,
                          indirizzoCompleto: { ...prev.atleta.indirizzoCompleto, civico: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.civico ? "border-red-500" : "border-slate-300"}
                      `}
                      id="civico"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600" id="cap-label">
                      CAP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., 20121"
                      maxLength={5}
                      value={formData.atleta.indirizzoCompleto.cap}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: {
                          ...prev.atleta,
                          indirizzoCompleto: { ...prev.atleta.indirizzoCompleto, cap: e.target.value.replace(/\D/g, "") },
                        },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none
                        ${errors.cap ? "border-red-500" : "border-slate-300"}
                      `}
                      id="cap"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600" id="comune-label">
                      Comune <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., MILANO"
                      value={formData.atleta.indirizzoCompleto.comune}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: {
                          ...prev.atleta,
                          indirizzoCompleto: { ...prev.atleta.indirizzoCompleto, comune: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.comune ? "border-red-500" : "border-slate-300"}
                      `}
                      id="comune"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600" id="provincia-label">
                      Provincia (Sigla) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., MI"
                      maxLength={2}
                      value={formData.atleta.indirizzoCompleto.provincia}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: {
                          ...prev.atleta,
                          indirizzoCompleto: { ...prev.atleta.indirizzoCompleto, provincia: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none font-semibold text-center
                        ${errors.provincia ? "border-red-500" : "border-slate-300"}
                      `}
                      id="provincia"
                    />
                  </div>
                </div>
              </div>

              {/* Telefono & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" id="telefono-label">
                    Telefono <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="E.g., 3451234567"
                      value={formData.atleta.telefono}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: { ...prev.atleta, telefono: e.target.value },
                      }))}
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        ${errors.telefono ? "border-red-500" : "border-slate-300"}
                      `}
                      id="telefono"
                    />
                  </div>
                  {errors.telefono && <p className="text-[11px] text-red-500">{errors.telefono}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700" id="email-label">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="E.g., mario.rossi@example.com"
                      value={formData.atleta.email}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        atleta: { ...prev.atleta, email: e.target.value },
                      }))}
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                        ${errors.email ? "border-red-500" : "border-slate-300"}
                      `}
                      id="email"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DOCUMENTI ATLETA */}
          {currentStep === 2 && (
            <motion.div
              key="step-documenti"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Allegati Richiesti (Atleta)</h2>
                <p className="text-xs text-slate-500">I file allegati devono essere in formato PDF o immagini chiare e leggibili (Max 5MB ciascuno).</p>
              </div>

              {/* File 1: Documento d'Identità */}
              <FileUpload
                id="docIdentita"
                label="Documento d'Identità dell'Atleta Fronte/Retro"
                description="Carta d'identità, passaporto o patente in corso di validità."
                required={true}
                value={formData.atleta.docIdentita}
                onChange={(file) => setFormData((prev) => ({
                  ...prev,
                  atleta: { ...prev.atleta, docIdentita: file },
                }))}
                error={errors.docIdentita}
              />

              {/* File 2: Certificato Medico (Solo per Giocatori) */}
              {formData.atleta.ruolo === Ruolo.GIOCATORE && (
                <FileUpload
                  id="certificatoMedico"
                  label="Certificato Medico"
                  description={`Certificato medico in corso di validità. Agonistico o Non Agonistico in base alla categoria dell'atleta.`}
                  required={true}
                  value={formData.atleta.certificatoMedico}
                  onChange={(file) => setFormData((prev) => ({
                    ...prev,
                    atleta: { ...prev.atleta, certificatoMedico: file },
                  }))}
                  error={errors.certificatoMedico}
                />
              )}
            </motion.div>
          )}

          {/* STEP 3: CONDIZIONALE PER MINORENNI */}
          {formData.isMinorenne && currentStep === 3 && (
            <motion.div
              key="step-genitori"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Esercenti la Responsabilità Genitoriale (Minorenni)
                </h2>
                <p className="text-xs text-slate-500">
                  Come richiesto dalle norme vigenti LND/FIGC, per i minori di 18 anni è obbligatorio inserire e allegare i dati di ENTRAMBI i genitori/tutori.
                </p>
              </div>

              {/* GENITORE 1 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Genitore / Esercente Potestà 1</span>
                  <button
                    type="button"
                    onClick={() => copyAddressToGenitore(1)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    Copia indirizzo Atleta
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g1_cognome-label">Cognome *</label>
                    <input
                      type="text"
                      placeholder="E.g., ROSSI"
                      value={formData.genitore1.cognome}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: { ...prev.genitore1,  cognome: e.target.value.toUpperCase() },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g1_cognome ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g1_cognome"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g1_nome-label">Nome *</label>
                    <input
                      type="text"
                      placeholder="E.g., LUIGI"
                      value={formData.genitore1.nome}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: { ...prev.genitore1,  nome: e.target.value.toUpperCase() },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g1_nome ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g1_nome"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700" id="g1_codiceFiscale-label">Codice Fiscale *</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 caratteri alfanumerici"
                    value={formData.genitore1.codiceFiscale}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      genitore1: { ...prev.genitore1,  codiceFiscale: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg font-mono focus:outline-none uppercase
                      ${errors.g1_codiceFiscale ? "border-red-500" : "border-slate-300"}
                    `}
                    id="g1_codiceFiscale"
                  />
                </div>

                {/* Indirizzo Genitore 1 */}
                <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="col-span-2 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g1_via-label">Indirizzo *</label>
                    <input
                      type="text"
                      placeholder="Via/Piazza"
                      value={formData.genitore1.indirizzoCompleto.via}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: {
                          ...prev.genitore1,
                          indirizzoCompleto: { ...prev.genitore1.indirizzoCompleto, via: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g1_via ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g1_via"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g1_civico-label">Civico *</label>
                    <input
                      type="text"
                      placeholder="Civico"
                      value={formData.genitore1.indirizzoCompleto.civico}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: {
                          ...prev.genitore1,
                          indirizzoCompleto: { ...prev.genitore1.indirizzoCompleto, civico: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g1_civico ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g1_civico"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g1_cap-label">CAP *</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="CAP"
                      value={formData.genitore1.indirizzoCompleto.cap}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: {
                          ...prev.genitore1,
                          indirizzoCompleto: { ...prev.genitore1.indirizzoCompleto, cap: e.target.value.replace(/\D/g, "") },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none
                        ${errors.g1_cap ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g1_cap"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g1_comune-label">Comune *</label>
                    <input
                      type="text"
                      placeholder="Comune"
                      value={formData.genitore1.indirizzoCompleto.comune}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: {
                          ...prev.genitore1,
                          indirizzoCompleto: { ...prev.genitore1.indirizzoCompleto, comune: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g1_comune ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g1_comune"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g1_provincia-label">Prov. *</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="MI"
                      value={formData.genitore1.indirizzoCompleto.provincia}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: {
                          ...prev.genitore1,
                          indirizzoCompleto: { ...prev.genitore1.indirizzoCompleto, provincia: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg text-center focus:outline-none
                        ${errors.g1_provincia ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g1_provincia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g1_telefono-label">Telefono Cel. *</label>
                    <input
                      type="tel"
                      placeholder="Telefono"
                      value={formData.genitore1.telefono}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: { ...prev.genitore1, telefono: e.target.value },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none
                        ${errors.g1_telefono ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g1_telefono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g1_email-label">Email *</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.genitore1.email}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore1: { ...prev.genitore1, email: e.target.value },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none
                        ${errors.g1_email ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g1_email"
                    />
                  </div>
                </div>

                <FileUpload
                  id="g1_docIdentita"
                  label="Documento d'Identità Genitore 1"
                  required={true}
                  value={formData.genitore1.docIdentita}
                  onChange={(file) => setFormData((prev) => ({
                    ...prev,
                    genitore1: { ...prev.genitore1, docIdentita: file },
                  }))}
                  error={errors.g1_docIdentita}
                />
              </div>

              {/* GENITORE 2 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Genitore / Esercente Potestà 2</span>
                  <button
                    type="button"
                    onClick={() => copyAddressToGenitore(2)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    Copia indirizzo Atleta
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g2_cognome-label">Cognome *</label>
                    <input
                      type="text"
                      placeholder="E.g., BIANCHI"
                      value={formData.genitore2.cognome}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: { ...prev.genitore2,  cognome: e.target.value.toUpperCase() },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g2_cognome ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g2_cognome"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g2_nome-label">Nome *</label>
                    <input
                      type="text"
                      placeholder="E.g., CARLA"
                      value={formData.genitore2.nome}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: { ...prev.genitore2,  nome: e.target.value.toUpperCase() },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g2_nome ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g2_nome"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700" id="g2_codiceFiscale-label">Codice Fiscale *</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 caratteri alfanumerici"
                    value={formData.genitore2.codiceFiscale}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      genitore2: { ...prev.genitore2,  codiceFiscale: e.target.value.toUpperCase() },
                    }))}
                    className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg font-mono focus:outline-none uppercase
                      ${errors.g2_codiceFiscale ? "border-red-500" : "border-slate-300"}
                    `}
                    id="g2_codiceFiscale"
                  />
                </div>

                {/* Indirizzo Genitore 2 */}
                <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="col-span-2 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g2_via-label">Indirizzo *</label>
                    <input
                      type="text"
                      placeholder="Via/Piazza"
                      value={formData.genitore2.indirizzoCompleto.via}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: {
                          ...prev.genitore2,
                          indirizzoCompleto: { ...prev.genitore2.indirizzoCompleto, via: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g2_via ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g2_via"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g2_civico-label">Civico *</label>
                    <input
                      type="text"
                      placeholder="Civico"
                      value={formData.genitore2.indirizzoCompleto.civico}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: {
                          ...prev.genitore2,
                          indirizzoCompleto: { ...prev.genitore2.indirizzoCompleto, civico: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g2_civico ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g2_civico"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g2_cap-label">CAP *</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="CAP"
                      value={formData.genitore2.indirizzoCompleto.cap}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: {
                          ...prev.genitore2,
                          indirizzoCompleto: { ...prev.genitore2.indirizzoCompleto, cap: e.target.value.replace(/\D/g, "") },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none
                        ${errors.g2_cap ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g2_cap"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g2_comune-label">Comune *</label>
                    <input
                      type="text"
                      placeholder="Comune"
                      value={formData.genitore2.indirizzoCompleto.comune}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: {
                          ...prev.genitore2,
                          indirizzoCompleto: { ...prev.genitore2.indirizzoCompleto, comune: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg focus:outline-none uppercase
                        ${errors.g2_comune ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g2_comune"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500" id="g2_provincia-label">Prov. *</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="MI"
                      value={formData.genitore2.indirizzoCompleto.provincia}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: {
                          ...prev.genitore2,
                          indirizzoCompleto: { ...prev.genitore2.indirizzoCompleto, provincia: e.target.value.toUpperCase() },
                        },
                      }))}
                      className={`w-full px-2.5 py-1 text-xs bg-white border rounded-lg text-center focus:outline-none
                        ${errors.g2_provincia ? "border-red-500" : "border-slate-200"}
                      `}
                      id="g2_provincia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g2_telefono-label">Telefono Cel. *</label>
                    <input
                      type="tel"
                      placeholder="Telefono"
                      value={formData.genitore2.telefono}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: { ...prev.genitore2, telefono: e.target.value },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none
                        ${errors.g2_telefono ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g2_telefono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700" id="g2_email-label">Email *</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.genitore2.email}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        genitore2: { ...prev.genitore2, email: e.target.value },
                      }))}
                      className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none
                        ${errors.g2_email ? "border-red-500" : "border-slate-300"}
                      `}
                      id="g2_email"
                    />
                  </div>
                </div>

                <FileUpload
                  id="g2_docIdentita"
                  label="Documento d'Identità Genitore 2"
                  required={true}
                  value={formData.genitore2.docIdentita}
                  onChange={(file) => setFormData((prev) => ({
                    ...prev,
                    genitore2: { ...prev.genitore2, docIdentita: file },
                  }))}
                  error={errors.g2_docIdentita}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: RIEPILOGO E INVIO */}
          {currentStep === steps.length - 1 && (
            <motion.div
              key="step-riepilogo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Riepilogo e Firma Digitale</h2>
                <p className="text-xs text-slate-500">Controlla attentamente tutti i dati inseriti prima di procedere con l'invio ufficiale.</p>
              </div>

              <div className="space-y-4 text-sm">
                
                {/* Riepilogo Atleta */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      Atleta ({formData.atleta.ruolo})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <p><span className="text-slate-500 font-medium">Nome Completo:</span> <strong className="text-slate-800">{formData.atleta.cognome} {formData.atleta.nome}</strong></p>
                    <p><span className="text-slate-500 font-medium">Codice Fiscale:</span> <strong className="text-slate-800 font-mono">{formData.atleta.codiceFiscale}</strong></p>
                    <p><span className="text-slate-500 font-medium">Data e Luogo Nascita:</span> <strong className="text-slate-800">{formData.atleta.dataNascita} a {formData.atleta.luogoNascita} ({formData.atleta.provinciaNascita})</strong></p>
                    <p><span className="text-slate-500 font-medium">Telefono:</span> <strong className="text-slate-800">{formData.atleta.telefono}</strong></p>
                    <p className="sm:col-span-2"><span className="text-slate-500 font-medium">Email:</span> <strong className="text-slate-800">{formData.atleta.email}</strong></p>
                    <p className="sm:col-span-2"><span className="text-slate-500 font-medium">Indirizzo:</span> <strong className="text-slate-800">{formData.atleta.indirizzoCompleto.via} {formData.atleta.indirizzoCompleto.civico}, {formData.atleta.indirizzoCompleto.cap} - {formData.atleta.indirizzoCompleto.comune} ({formData.atleta.indirizzoCompleto.provincia})</strong></p>
                  </div>
                </div>

                {/* Allegati Atleta */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Documenti Allegati
                  </span>
                  <div className={`grid grid-cols-1 ${formData.atleta.ruolo === Ruolo.GIOCATORE ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-3 text-xs`}>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="p-1 bg-emerald-100 text-emerald-800 rounded">✓</span>
                      <div>
                        <p className="font-semibold text-slate-800 truncate" title={formData.atleta.docIdentita?.name}>Doc. Identità Atleta</p>
                        <p className="text-[10px] text-slate-400">Pronto per Google Drive</p>
                      </div>
                    </div>
                    {formData.atleta.ruolo === Ruolo.GIOCATORE && (
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="p-1 bg-emerald-100 text-emerald-800 rounded">✓</span>
                        <div>
                          <p className="font-semibold text-slate-800 truncate" title={formData.atleta.certificatoMedico?.name}>Certificato Medico</p>
                          <p className="text-[10px] text-slate-400">Pronto per Google Drive</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sezione Genitori (Solo se minorenne) */}
                {formData.isMinorenne && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/20 border-amber-200/50 space-y-4">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      Esercenti Responsabilità Genitoriale
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 border-r border-slate-200/50 pr-4">
                        <p className="font-bold text-slate-800 border-b border-slate-200/50 pb-1">Genitore 1</p>
                        <p><span className="text-slate-500 font-medium">Nome:</span> <strong className="text-slate-800">{formData.genitore1.cognome} {formData.genitore1.nome}</strong></p>
                        <p><span className="text-slate-500 font-medium">CF:</span> <strong className="text-slate-800 font-mono">{formData.genitore1.codiceFiscale}</strong></p>
                        <p><span className="text-slate-500 font-medium">Tel:</span> <strong className="text-slate-800">{formData.genitore1.telefono}</strong></p>
                        <p><span className="text-slate-500 font-medium">Email:</span> <strong className="text-slate-800 truncate block">{formData.genitore1.email}</strong></p>
                        <p className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold text-slate-600 mt-2">
                          <span className="text-emerald-600 font-bold">✓</span> Doc. Identità Allegato
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 border-b border-slate-200/50 pb-1">Genitore 2</p>
                        <p><span className="text-slate-500 font-medium">Nome:</span> <strong className="text-slate-800">{formData.genitore2.cognome} {formData.genitore2.nome}</strong></p>
                        <p><span className="text-slate-500 font-medium">CF:</span> <strong className="text-slate-800 font-mono">{formData.genitore2.codiceFiscale}</strong></p>
                        <p><span className="text-slate-500 font-medium">Tel:</span> <strong className="text-slate-800">{formData.genitore2.telefono}</strong></p>
                        <p><span className="text-slate-500 font-medium">Email:</span> <strong className="text-slate-800 truncate block">{formData.genitore2.email}</strong></p>
                        <p className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold text-slate-600 mt-2">
                          <span className="text-emerald-600 font-bold">✓</span> Doc. Identità Allegato
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accettazione Privacy */}
                <div className="flex items-start gap-2 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    required
                    id="privacy-chk"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="privacy-chk" className="text-xs text-slate-600 leading-relaxed cursor-pointer" id="privacy-chk-label">
                    Dichiaro sotto la mia responsabilità che tutti i dati e i documenti allegati corrispondono a verità e acconsento al trattamento dei dati personali ai fini del tesseramento sportivo secondo il Regolamento GDPR 2016/679 dell'ASD.
                  </label>
                </div>

                {/* Errore di invio */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsanti Navigazione */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Indietro
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 rounded-lg transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 duration-150"
            >
              Avanti
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 rounded-lg transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 duration-150 disabled:opacity-75 disabled:hover:translate-y-0 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Salvataggio in corso...
                </>
              ) : (
                <>
                  Invia Tesseramento
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
