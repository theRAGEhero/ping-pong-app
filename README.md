# Ping Pong Match Organizer

Un'applicazione web avanzata per organizzare partite di ping pong, partecipare a tornei e trovare tavoli da ping pong nella tua zona.

## Funzionalità

### 🏓 Gestione Partite
- Crea e unisciti a partite di ping pong
- Visualizza partite disponibili nella tua zona
- Filtra partite per livello, data e luogo
- Registra i risultati delle partite

### 🏆 Sistema Tornei
- Partecipa a tornei di ping pong organizzati
- Iscrizione ai tornei con visualizzazione della disponibilità
- Tabelloni dei tornei con tracciamento automatico
- Vari formati di torneo (eliminazione diretta, gironi, ecc.)

### 🌍 Mappa dei Tavoli
- Integrazione con OpenStreetMap per localizzare tavoli da ping pong
- Visualizza tavoli pubblici e privati nella tua zona
- Informazioni dettagliate sui tavoli (accessibilità, costi, ecc.)
- Visualizza partite e tornei sulla mappa

### ⭐ Sistema di Gamification
- Guadagna punti esperienza (XP) partecipando a partite e tornei
- Sali di livello e sblocca nuove funzionalità
- Achievement per premiare i progressi e le attività
- Sfide settimanali con ricompense in XP
- Classifica globale dei giocatori

### 👤 Profilo Utente
- Profilo personalizzato con statistiche e achievement
- Cronologia partite e risultati
- Tracciamento del progresso nel sistema di gamification
- Gestione delle notifiche per partite e tornei

## Tecnologie Utilizzate

- **Frontend**: HTML, CSS, JavaScript, React (tramite CDN)
- **Storage**: LocalStorage (per la versione dimostrativa)
- **Mappe**: Integrazione con OpenStreetMap via Leaflet
- **UI/UX**: Design reattivo con supporto per modalità scura

## Come Usare l'Applicazione

1. **Registrazione/Login**:
   - Registrati con un nome utente, email e password
   - Seleziona il tuo livello di gioco

2. **Partite**:
   - Visualizza le partite disponibili nella pagina "Partite"
   - Crea una nuova partita con il pulsante "Crea nuova partita"
   - Unisciti alle partite esistenti con il pulsante "Unisciti"
   - Registra i risultati delle partite completate

3. **Tornei**:
   - Esplora i tornei disponibili nella pagina "Tornei"
   - Iscriviti ai tornei con posti disponibili
   - Visualizza i tabelloni e segui i risultati
   - Partecipa ai match quando programmati

4. **Mappa Tavoli**:
   - Esplora la mappa per trovare tavoli da ping pong
   - Filtra per tavoli pubblici/privati
   - Visualizza informazioni dettagliate sui tavoli
   - Trova partite e tornei sulla mappa

5. **Gamification**:
   - Guadagna XP partecipando a partite e tornei
   - Completa achievement per ottenere bonus XP
   - Partecipa alle sfide settimanali
   - Controlla la tua posizione in classifica

## Installazione Locale

Per eseguire l'applicazione in locale:

1. Clona il repository:
   ```
   git clone https://github.com/yourusername/ping-pong-app.git
   ```

2. Apri il file `index.html` nel tuo browser:
   ```
   cd ping-pong-app
   open index.html
   ```

3. In alternativa, usa un server locale:
   ```
   python -m http.server
   ```
   E visita `http://localhost:8000`

## Sviluppo Futuro

- **Backend**: Implementazione di un backend con database per persistenza dei dati
- **Autenticazione**: Sistema di login più robusto con OAuth
- **Matchmaking**: Sistema automatico per trovare avversari del tuo livello
- **Mobile App**: Versione nativa per dispositivi iOS e Android
- **Integrazione social**: Condivisione dei risultati su piattaforme social
- **Statistiche avanzate**: Analisi dettagliata delle performance di gioco

## Contribuire

Siamo aperti a contributi e miglioramenti! Se vuoi contribuire:

1. Forka il repository
2. Crea un branch per la tua funzionalità
3. Invia una Pull Request

## Riconoscimenti

- Design ispirato ai migliori standard di UI/UX
- Icone fornite da FontAwesome e Heroicons
- Integrazione con OpenStreetMap
- Librerie: React, Leaflet, Chart.js

## Licenza

Questo progetto è rilasciato sotto la licenza MIT.
