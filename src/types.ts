/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Ruolo {
  GIOCATORE = "GIOCATORE",
  DIRIGENTE = "DIRIGENTE",
  ALLENATORE = "ALLENATORE"
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface AnagraficaAtleta {
  ruolo: Ruolo;
  cognome: string;
  nome: string;
  codiceFiscale: string;
  dataNascita: string;
  luogoNascita: string;
  provinciaNascita: string;
  indirizzoCompleto: {
    via: string;
    civico: string;
    cap: string;
    comune: string;
    provincia: string;
  };
  telefono: string;
  email: string;
  
  // File uploads
  docIdentita: FileData | null;
  certificatoMedico: FileData | null;
}

export interface GenitoreData {
  cognome: string;
  nome: string;
  codiceFiscale: string;
  indirizzoCompleto: {
    via: string;
    civico: string;
    cap: string;
    comune: string;
    provincia: string;
  };
  telefono: string;
  email: string;
  docIdentita: FileData | null;
}

export interface TesseramentoFormData {
  atleta: AnagraficaAtleta;
  isMinorenne: boolean;
  genitore1: GenitoreData;
  genitore2: GenitoreData;
}

export interface SubmissionConfig {
  appsScriptUrl: string;
  useSimulation: boolean;
}
