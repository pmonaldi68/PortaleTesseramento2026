/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Valida il Codice Fiscale italiano (16 caratteri alfanumerici)
 */
export function validateCodiceFiscale(cf: string): boolean {
  if (!cf) return false;
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return cfRegex.test(cf.trim());
}

/**
 * Valida un indirizzo email
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida un numero di telefono italiano (almeno 9 cifre)
 */
export function validateTelefono(tel: string): boolean {
  if (!tel) return false;
  const telRegex = /^[0-9+\s().-]{9,15}$/;
  return telRegex.test(tel.trim());
}

/**
 * Valida un codice di avviamento postale (CAP) italiano (5 cifre)
 */
export function validateCAP(cap: string): boolean {
  if (!cap) return false;
  const capRegex = /^[0-9]{5}$/;
  return capRegex.test(cap.trim());
}

/**
 * Calcola l'età data la data di nascita rispetto alla data odierna
 */
export function calcolaEta(dataNascita: string): number {
  if (!dataNascita) return 0;
  const nascita = new Date(dataNascita);
  const oggi = new Date();
  
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const m = oggi.getMonth() - nascita.getMonth();
  
  if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
    eta--;
  }
  
  return eta;
}
