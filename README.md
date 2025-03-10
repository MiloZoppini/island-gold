# Island Gold - Caccia al Tesoro Multiplayer

Un gioco 3D multiplayer di caccia al tesoro ambientato su un'isola generata proceduralmente.

## Caratteristiche

- **Mondo 3D Immersivo**: Esplora un'isola generata proceduralmente con terreno realistico, acqua, vegetazione e rocce.
- **Multiplayer in Tempo Reale**: Competi con altri giocatori per trovare i tesori nascosti.
- **Grafica Avanzata**: Effetti di acqua realistica, illuminazione dinamica, particelle e altro.
- **Audio Coinvolgente**: Effetti sonori e musica di sottofondo per un'esperienza immersiva.
- **Interfaccia Utente Intuitiva**: HUD chiaro e reattivo con indicatori di salute, punteggio e notifiche.

## Tecnologie Utilizzate

- **Three.js**: Per la grafica 3D
- **Socket.io**: Per la comunicazione in tempo reale
- **Express**: Per il server web
- **SimplexNoise**: Per la generazione procedurale del terreno

## Come Giocare

1. Visita [Island Gold](https://teaser-island-server.onrender.com)
2. Inserisci il tuo nome
3. Clicca su "Inizia Gioco"
4. Usa WASD per muoverti, il mouse per guardare intorno
5. Raccogli i tesori avvicinandoti ad essi
6. Vince chi raccoglie più tesori!

## Sviluppo

Il progetto è strutturato in modo modulare con:

- Sistema di eventi per la comunicazione tra componenti
- Gestione degli input da tastiera e mouse
- Sistema audio per effetti sonori e musica
- Interfaccia utente modulare
- Generazione procedurale della mappa
- Sistema del giocatore con fisica e controlli
- Sistema dei tesori con effetti visivi

## Versione

Versione attuale: 1.0.1

## Descrizione

Island Gold è un gioco multiplayer in cui i giocatori esplorano un'isola alla ricerca di tesori. L'obiettivo è raccogliere più oro degli altri giocatori entro il tempo limite. Il gioco è costruito con Three.js per la grafica 3D e Socket.io per la funzionalità multiplayer.

## Requisiti

- Node.js (v14 o superiore)
- NPM (v6 o superiore)

## Installazione

1. Clona il repository:
   ```
   git clone https://github.com/tuousername/island-gold.git
   cd island-gold
   ```

2. Installa le dipendenze:
   ```
   npm install
   ```

3. Avvia il server di sviluppo:
   ```
   npm run dev
   ```

4. Apri il browser e vai a `http://localhost:3000`

## Build per la produzione

Per creare una build ottimizzata per la produzione:

```
npm run build
npm start
```

## Controlli

- W, A, S, D: Movimento
- Mouse: Guarda intorno
- Barra spaziatrice: Salta
- Avvicinati ai tesori per raccoglierli

## Deployment

Il gioco può essere facilmente distribuito su Render.com:

1. Crea un nuovo Web Service su Render.com
2. Collega il tuo repository GitHub
3. Imposta il comando di build su `npm install && npm run build`
4. Imposta il comando di avvio su `npm start`
5. Imposta la variabile d'ambiente `PORT` se necessario

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli. 