/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script per l'Integrazione del Portale Tesseramento ASD
 * 
 * Istruzioni per l'installazione:
 * 1. Crea un nuovo Foglio Google Sheets.
 * 2. Clicca su "Estensioni" -> "Apps Script".
 * 3. Cancella il codice presente e incolla questo script.
 * 4. Salva il progetto (icona del disco in alto).
 * 5. Clicca su "Nuova implementazione" (pulsante blu in alto a destra).
 * 6. Seleziona tipo: "Applicazione web".
 * 7. Configura:
 *    - Descrizione: "Portale Tesseramento ASD"
 *    - Esegui come: "Tu" (la tua email)
 *    - Chi ha accesso: "Chiunque" (fondamentale per permettere l'invio pubblico dei dati)
 * 8. Clicca su "Implementa", concedi le autorizzazioni di sicurezza richieste dal tuo account Google.
 * 9. Copia l'URL dell'applicazione web fornito e incollalo nel pannello di configurazione della Web App!
 */

function doPost(e) {
  // Gestione delle richieste CORS preflight
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Nessun dato ricevuto"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. Apri il Foglio di calcolo attivo
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Se il foglio è vuoto, inizializza le intestazioni delle colonne
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp", 
        "Ruolo", 
        "Cognome Atleta", 
        "Nome Atleta", 
        "CF Atleta", 
        "Data Nascita", 
        "Luogo Nascita", 
        "Residenza Atleta", 
        "Telefono Atleta", 
        "Email Atleta", 
        "Link_Doc_Identità_Atleta", 
        "Link_Certificato_Medico", 
        "Info_Minorenne (SI/NO)", 
        "Cognome_Genitore1", 
        "Nome_Genitore1", 
        "CF_Genitore1", 
        "Residenza_Genitore1", 
        "Tel_Genitore1", 
        "Email_Genitore1", 
        "Link_Doc_Genitore1", 
        "Cognome_Genitore2", 
        "Nome_Genitore2", 
        "CF_Genitore2", 
        "Residenza_Genitore2", 
        "Tel_Genitore2", 
        "Email_Genitore2", 
        "Link_Doc_Genitore2"
      ];
      sheet.appendRow(headers);
      
      // Formatta la riga delle intestazioni (Grassetto e sfondo grigio chiaro)
      sheet.getRange(1, 1, 1, headers.length)
           .setFontWeight("bold")
           .setBackground("#f3f4f6")
           .setHorizontalAlignment("center");
      
      // Blocca la prima riga
      sheet.setFrozenRows(1);
    }
    
    // 2. Cerca o crea la cartella di Google Drive "Tesseramenti_2026_2027"
    var folderName = "Tesseramenti_2026_2027";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // Funzione interna per decodificare il Base64 e salvare il file in Drive
    function saveFile(fileObj, prefix, docType) {
      if (!fileObj || !fileObj.base64) return "";
      
      try {
        var parts = fileObj.base64.split(",");
        var base64Data = parts.length > 1 ? parts[1] : parts[0];
        var decoded = Utilities.base64Decode(base64Data);
        
        // Estrai l'estensione del file
        var ext = "pdf";
        if (fileObj.name && fileObj.name.indexOf('.') !== -1) {
          ext = fileObj.name.split('.').pop();
        } else if (fileObj.type) {
          ext = fileObj.type.split('/').pop();
          if (ext === "jpeg") ext = "jpg";
        }
        
        // Rinominazione automatica: COGNOME_NOME_TIPO-DOCUMENTO.estensione
        var fileName = prefix.toUpperCase().replace(/\\s+/g, "_") + "_" + docType + "." + ext;
        
        // Rimuovi eventuali file obsoleti con lo stesso nome per evitare duplicati
        var existingFiles = folder.getFilesByName(fileName);
        while (existingFiles.hasNext()) {
          existingFiles.next().setTrashed(true);
        }
        
        var blob = Utilities.newBlob(decoded, fileObj.type || 'application/octet-stream', fileName);
        var file = folder.createFile(blob);
        
        // Rendi il file visibile a chiunque abbia il link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) {
        return "Errore Upload: " + err.toString();
      }
    }
    
    // Estrazione dati dell'atleta
    var atleta = data.atleta;
    var isMinorenne = data.isMinorenne;
    var gen1 = data.genitore1;
    var gen2 = data.genitore2;
    
    var prefixAtleta = atleta.cognome + "_" + atleta.nome;
    
    // Salvataggio file dell'atleta
    var urlDocAtleta = saveFile(atleta.docIdentita, prefixAtleta, "DocumentoIdentita");
    var urlCertMedico = saveFile(atleta.certificatoMedico, prefixAtleta, "CertificatoMedico");
    
    // Salvataggio file dei genitori (se minorenne)
    var urlDocGen1 = "";
    var urlDocGen2 = "";
    if (isMinorenne) {
      if (gen1 && gen1.docIdentita) {
        urlDocGen1 = saveFile(gen1.docIdentita, gen1.cognome + "_" + gen1.nome, "DocumentoGenitore1");
      }
      if (gen2 && gen2.docIdentita) {
        urlDocGen2 = saveFile(gen2.docIdentita, gen2.cognome + "_" + gen2.nome, "DocumentoGenitore2");
      }
    }
    
    // Formattazione dell'indirizzo completo
    function formatIndirizzo(ind) {
      if (!ind) return "";
      return ind.via + " " + ind.civico + ", " + ind.cap + " - " + ind.comune + " (" + ind.provincia + ")";
    }
    
    var residenzaAtleta = formatIndirizzo(atleta.indirizzoCompleto);
    var residenzaGen1 = isMinorenne ? formatIndirizzo(gen1.indirizzoCompleto) : "";
    var residenzaGen2 = isMinorenne ? formatIndirizzo(gen2.indirizzoCompleto) : "";
    
    // 3. Creazione della riga del foglio Excel
    var rowData = [
      new Date(),                                   // Timestamp
      atleta.ruolo,                                 // Ruolo
      atleta.cognome.toUpperCase(),                 // Cognome Atleta
      atleta.nome.toUpperCase(),                    // Nome Atleta
      atleta.codiceFiscale.toUpperCase(),           // CF Atleta
      atleta.dataNascita,                           // Data Nascita
      atleta.luogoNascita.toUpperCase(),            // Luogo Nascita
      residenzaAtleta.toUpperCase(),                // Residenza Atleta
      atleta.telefono,                              // Telefono Atleta
      atleta.email.toLowerCase(),                   // Email Atleta
      urlDocAtleta,                                 // Link Documento Identità Atleta
      urlCertMedico,                                // Link Certificato Medico
      isMinorenne ? "SI" : "NO",                    // Atleta Minorenne
      
      // Dati Genitore 1 (se minorenne)
      isMinorenne ? gen1.cognome.toUpperCase() : "",
      isMinorenne ? gen1.nome.toUpperCase() : "",
      isMinorenne ? gen1.codiceFiscale.toUpperCase() : "",
      residenzaGen1.toUpperCase(),
      isMinorenne ? gen1.telefono : "",
      isMinorenne ? gen1.email.toLowerCase() : "",
      urlDocGen1,
      
      // Dati Genitore 2 (se minorenne)
      isMinorenne ? gen2.cognome.toUpperCase() : "",
      isMinorenne ? gen2.nome.toUpperCase() : "",
      isMinorenne ? gen2.codiceFiscale.toUpperCase() : "",
      residenzaGen2.toUpperCase(),
      isMinorenne ? gen2.telefono : "",
      isMinorenne ? gen2.email.toLowerCase() : "",
      urlDocGen2
    ];
    
    // Aggiungi la riga al foglio
    sheet.appendRow(rowData);
    
    // Rispondi con successo abilitando CORS
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Tesseramento registrato con successo!"
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Errore sul server Apps Script: " + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
