const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');

// Carica la configurazione del gioco
const gameConfig = JSON.parse(fs.readFileSync('./gameConfig.json', 'utf8'));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Imposta la cartella pubblica
app.use(express.static(path.join(__dirname, 'public')));

// Rotte
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Stato del gioco
const gameState = {
  players: {},
  treasures: [],
  gameTime: gameConfig.rules.durata_partita
};

// Genera tesori casuali sulla mappa
function generateTreasures() {
  const { width, depth } = gameConfig.world.size;
  const treasureCount = gameConfig.objective.tesori.quantità;
  
  for (let i = 0; i < treasureCount; i++) {
    const treasureType = Math.random() < 0.6 ? 'piccolo' : (Math.random() < 0.8 ? 'medio' : 'grande');
    const value = gameConfig.objective.tesori.valore[treasureType];
    
    gameState.treasures.push({
      id: `treasure-${i}`,
      position: {
        x: Math.random() * width - width/2,
        y: 5, // Leggermente sopra il terreno
        z: Math.random() * depth - depth/2
      },
      type: treasureType,
      value: value,
      collected: false
    });
  }
}

// Inizializza il gioco
generateTreasures();

// Gestione connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Nuovo giocatore connesso:', socket.id);

  // Gestisci l'ingresso di un giocatore
  socket.on('player:join', (data) => {
    console.log('Giocatore entrato:', data);
    socket.broadcast.emit('player:joined', {
      id: socket.id,
      ...data
    });
  });

  // Gestisci il movimento del giocatore
  socket.on('player:move', (data) => {
    socket.broadcast.emit('player:moved', {
      id: socket.id,
      ...data
    });
  });

  // Gestisci la raccolta dei tesori
  socket.on('treasure:collect', (data) => {
    io.emit('treasure:collected', {
      playerId: socket.id,
      ...data
    });
  });

  // Gestisci l'ingresso nella lobby
  socket.on('lobby:join', () => {
    socket.join('lobby');
    io.to('lobby').emit('lobby:update', {
      count: io.sockets.adapter.rooms.get('lobby').size
    });
  });

  // Gestisci l'uscita dalla lobby
  socket.on('lobby:leave', () => {
    socket.leave('lobby');
    if (io.sockets.adapter.rooms.get('lobby')) {
      io.to('lobby').emit('lobby:update', {
        count: io.sockets.adapter.rooms.get('lobby').size
      });
    }
  });

  // Gestisci la disconnessione
  socket.on('disconnect', () => {
    console.log('Giocatore disconnesso:', socket.id);
    io.emit('player:left', socket.id);
  });
});

// Timer di gioco
let gameTimer = null;

function startGameTimer() {
  let timeRemaining = gameConfig.rules.durata_partita;
  
  gameTimer = setInterval(() => {
    timeRemaining--;
    gameState.gameTime = timeRemaining;
    
    // Invia aggiornamento del tempo a tutti i giocatori
    io.emit('timeUpdate', timeRemaining);
    
    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(gameTimer);
  
  // Trova il vincitore
  let winner = null;
  let highestScore = -1;
  
  Object.values(gameState.players).forEach(player => {
    if (player.score > highestScore) {
      highestScore = player.score;
      winner = player.id;
    }
  });
  
  // Invia risultati a tutti i giocatori
  io.emit('gameOver', {
    winner: winner,
    scores: Object.values(gameState.players).map(p => ({
      id: p.id,
      score: p.score
    }))
  });
  
  // Resetta il gioco dopo un po'
  setTimeout(resetGame, 10000);
}

function resetGame() {
  // Resetta lo stato del gioco
  gameState.treasures = [];
  gameState.gameTime = gameConfig.rules.durata_partita;
  
  // Resetta i punteggi dei giocatori
  Object.values(gameState.players).forEach(player => {
    player.score = 0;
    player.inventory = [];
  });
  
  // Genera nuovi tesori
  generateTreasures();
  
  // Informa i giocatori del reset
  io.emit('gameReset', {
    config: gameConfig,
    state: gameState
  });
  
  // Riavvia il timer
  startGameTimer();
}

// Avvia il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`Island Gold v${gameConfig.game.version} avviato!`);
  
  // Avvia il timer di gioco
  startGameTimer();
}); 