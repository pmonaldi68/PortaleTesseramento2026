# Portale Tesseramento - S.S.D. Cynthia 1920 ⚽

Questo è il portale web moderno per la digitalizzazione delle richieste di tesseramento e l'upload dei documenti della **S.S.D. Cynthia 1920**.
Il sistema integra un modulo guidato e sicuro, progettato per comunicare direttamente con **Google Sheets** (per la gestione anagrafica) e **Google Drive** (per l'archiviazione sicura di documenti d'identità e certificati medici).

---

## 🚀 Come Pubblicare Gratuita su GitHub Pages

L'applicazione è configurata per essere ospitata gratuitamente su **GitHub Pages** (essendo una Single Page Application statica). Segui questi passaggi per caricarla online in meno di 5 minuti:

### 1. Crea un nuovo repository su GitHub
1. Accedi al tuo account su [GitHub](https://github.com).
2. Clicca su **New** (Nuovo repository).
3. Nomina il repository (es: `tesseramento-cynthia`).
4. Imposta il repository come **Public** o **Private** (puoi usare GitHub Pages anche su repository privati).
5. Non aggiungere un file README, .gitignore o licenza (sono già inclusi nel tuo codice). Clicca su **Create repository**.

### 2. Carica il codice su GitHub
Dalla cartella principale del progetto sul tuo computer, apri un terminale ed esegui i seguenti comandi:

```bash
# Inizializza Git
git init

# Aggiungi tutti i file
git add .

# Esegui il primo commit
git commit -m "Primo rilascio portale tesseramento Cynthia 1920"

# Rinomina il branch principale in main
git branch -M main

# Associa il tuo repository remoto (sostituisci con il tuo link GitHub reale!)
git remote add origin https://github.com/IL_TUO_USERNAME/tesseramento-cynthia.git

# Invia il codice su GitHub
git push -u origin main
```

---

## 🛠️ Come Configurare GitHub Pages

Per compilare ed effettuare il deploy automatico dell'app ogni volta che aggiorni il codice, useremo **GitHub Actions**.

### 1. Crea il file di configurazione Workflow
Nel tuo progetto, crea una cartella denominata `.github/workflows/` e inserisci al suo interno un file denominato `deploy.yml` con il seguente contenuto:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-and-deploy:
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install and Build
        run: |
          npm install
          npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

### 2. Attiva GitHub Pages sul repository
1. Su GitHub, vai alla pagina del tuo repository e clicca su **Settings** (Impostazioni) in alto a destra.
2. Nella barra laterale sinistra, clicca su **Pages**.
3. Sotto la voce **Build and deployment &rarr; Source**, assicurati che sia selezionato **Deploy from a branch**.
4. Sotto **Branch**, seleziona `gh-pages` (verrà creato automaticamente dalla GitHub Action al primo push) e la cartella `/ (root)`. Clicca su **Save**.
5. Nel giro di 1-2 minuti, l'app sarà visibile al link: `https://IL_TUO_USERNAME.github.io/tesseramento-cynthia/`.

---

## 🔐 Sicurezza e Configurazione (Google Sheets & Drive)

Per impostare l'URL di Google Apps Script (in modo da evitare la simulazione di test), hai due comode opzioni:

### Opzione A: Pannello di Controllo protetto (Consigliata)
1. Apri l'applicazione pubblicata nel browser.
2. Clicca sul tasto nero **"Configura"** in alto a destra.
3. Inserisci la password predefinita: `cynthia1920`.
4. Disattiva la *Modalità Simulazione*.
5. Incolla il link del tuo **Google Apps Script** e clicca su **Salva Configurazione**.
*Nota: Questa configurazione viene salvata in modo sicuro nel LocalStorage del browser della segreteria.*

### Opzione B: Configurazione tramite variabili d'ambiente (Permanente per tutti)
Se preferisci che l'app punti sempre al tuo Google Sheets senza dover configurare manualmente il browser, crea un file `.env` (o `.env.production`) nella cartella principale del progetto prima di compilare:

```env
VITE_APPS_SCRIPT_URL="INSERISCI_QUI_IL_TUO_URL_DI_GOOGLE_APPS_SCRIPT"
```

---

## 🎨 Caratteristiche Grafiche Integrate
- **Colori Sociali Ufficiali**: Cynthia Blue (`#1d4ed8`) & Gold (`#c5a85c`).
- **Logo Storico**: Integrato l'emblema originale dell'arciere con scudo bianco-azzurro e bordo dorato.
- **Interfaccia Responsiva**: Progettata per una compilazione perfetta sia da smartphone (con foto diretta della fotocamera dei documenti) che da desktop.
