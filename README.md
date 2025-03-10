# Island Gold

Un gioco multiplayer di caccia al tesoro in stile Minecraft costruito con Three.js.

## Descrizione

Island Gold è un gioco multiplayer in cui i giocatori esplorano un'isola alla ricerca di tesori. L'obiettivo è raccogliere più oro degli altri giocatori entro il tempo limite. Il gioco è costruito con Three.js per la grafica 3D e Socket.io per la funzionalità multiplayer.

## Caratteristiche

- Ambiente 3D in stile Minecraft con visuale in prima persona
- Modalità multiplayer in tempo reale
- Generazione procedurale dell'isola con terreno, alberi, rocce e acqua
- Sistema di raccolta tesori
- Classifica dei giocatori e sistema di punteggio
- Timer di gioco con reset automatico

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

## Tecnologie utilizzate

- Three.js: Rendering 3D
- Socket.io: Comunicazione in tempo reale
- Express: Server web
- Webpack: Bundling

## Deployment

Il gioco può essere facilmente distribuito su Render.com:

1. Crea un nuovo Web Service su Render.com
2. Collega il tuo repository GitHub
3. Imposta il comando di build su `npm install && npm run build`
4. Imposta il comando di avvio su `npm start`
5. Imposta la variabile d'ambiente `PORT` se necessario

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli. 