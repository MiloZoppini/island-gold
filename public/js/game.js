/**
 * File principale del gioco
 * Questo file coordina tutti i componenti del gioco
 */

// Variabili globali
let socket;
let scene, camera, renderer;
let world, player, treasureManager, ui;
let clock;
let isGameInitialized = false;

// Inizializza il gioco
function init() {
  // Inizializza l'interfaccia utente
  ui = new GameUI();
  ui.init();
  
  // Inizializza il socket
  initSocket();
  
  // Inizializza Three.js
  initThree();
  
  // Inizializza il clock per il deltaTime
  clock = new THREE.Clock();
  
  // Avvia il loop di rendering
  animate();
}

// Inizializza la connessione socket
function initSocket() {
  socket = io();
  
  // Gestisci l'inizializzazione del gioco
  socket.on('gameInit', (data) => {
    // Aggiorna la configurazione del gioco
    gameConfig = { ...gameConfig, ...data.config };
    
    // Inizializza il mondo di gioco
    world = new GameWorld(scene, renderer);
    world.init();
    
    // Inizializza il giocatore
    player = new Player(camera, scene, world);
    player.init(data.playerId);
    
    // Inizializza il gestore dei tesori
    treasureManager = new TreasureManager(scene);
    treasureManager.initTreasures(data.state.treasures);
    
    // Aggiungi gli altri giocatori
    Object.values(data.state.players).forEach(playerData => {
      if (playerData.id !== data.playerId) {
        player.addOtherPlayer(playerData);
      }
    });
    
    // Aggiorna l'interfaccia
    ui.updateGameTime(data.state.gameTime);
    
    // Segna il gioco come inizializzato
    isGameInitialized = true;
    
    // Aggiorna la barra di caricamento
    ui.updateLoadingProgress(1, 'Caricamento completato!');
  });
  
  // Gestisci l'ingresso di un nuovo giocatore
  socket.on('playerJoined', (playerData) => {
    if (isGameInitialized) {
      player.addOtherPlayer(playerData);
    }
  });
  
  // Gestisci il movimento di un altro giocatore
  socket.on('playerMoved', (playerData) => {
    if (isGameInitialized) {
      player.updateOtherPlayer(playerData);
    }
  });
  
  // Gestisci l'uscita di un giocatore
  socket.on('playerLeft', (playerId) => {
    if (isGameInitialized) {
      player.removeOtherPlayer(playerId);
    }
  });
  
  // Gestisci la raccolta di un tesoro
  socket.on('treasureCollected', (data) => {
    if (isGameInitialized) {
      // Aggiorna il tesoro
      treasureManager.collectTreasure(data.treasureId, data.playerId);
      
      // Se è il giocatore corrente, aggiorna il punteggio
      if (data.playerId === player.id) {
        player.updateScore(data.playerScore);
        ui.updateScore(data.playerScore);
        ui.showTreasureCollected({ value: 1 }, true);
      } else {
        ui.showTreasureCollected({ value: 1 }, false);
      }
    }
  });
  
  // Gestisci l'aggiornamento del tempo
  socket.on('timeUpdate', (timeRemaining) => {
    if (isGameInitialized) {
      ui.updateGameTime(timeRemaining);
    }
  });
  
  // Gestisci la fine del gioco
  socket.on('gameOver', (gameOverData) => {
    if (isGameInitialized) {
      ui.showGameOver(gameOverData);
    }
  });
  
  // Gestisci il reset del gioco
  socket.on('gameReset', (data) => {
    if (isGameInitialized) {
      // Aggiorna la configurazione
      gameConfig = { ...gameConfig, ...data.config };
      
      // Resetta i tesori
      treasureManager.initTreasures(data.state.treasures);
      
      // Resetta il punteggio
      player.updateScore(0);
      ui.updateScore(0);
      
      // Aggiorna il timer
      ui.updateGameTime(data.state.gameTime);
    }
  });
  
  // Gestisci la disconnessione
  socket.on('disconnect', () => {
    console.log('Disconnesso dal server');
  });
}

// Inizializza Three.js
function initThree() {
  // Crea la scena
  scene = new THREE.Scene();
  
  // Crea la camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Crea il renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  
  // Aggiungi il renderer al DOM
  document.getElementById('game-container').appendChild(renderer.domElement);
  
  // Gestisci il ridimensionamento della finestra
  window.addEventListener('resize', onWindowResize, false);
}

// Gestisci il ridimensionamento della finestra
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Loop di rendering
function animate() {
  requestAnimationFrame(animate);
  
  // Calcola il deltaTime
  const deltaTime = Math.min(clock.getDelta(), 0.1);
  
  // Aggiorna il mondo se il gioco è inizializzato
  if (isGameInitialized) {
    world.update(deltaTime);
    player.update(deltaTime);
    treasureManager.update(deltaTime);
  }
  
  // Renderizza la scena
  renderer.render(scene, camera);
}

// Avvia il gioco quando la pagina è caricata
window.addEventListener('load', init); 