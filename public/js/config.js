/**
 * Configurazione del client per Island Gold
 * Questo file contiene le impostazioni di default che verranno sovrascritte
 * dalla configurazione ricevuta dal server
 */

const DEFAULT_CONFIG = {
  // Impostazioni del mondo
  world: {
    size: {
      width: 1000,
      height: 200,
      depth: 1000
    },
    gravity: 9.8,
    fogDistance: 300,
    skyColor: 0x87CEEB,
    groundColor: 0x3a9d23
  },
  
  // Impostazioni del giocatore
  player: {
    height: 1.8,
    speed: 5,
    jumpForce: 10,
    mass: 70,
    cameraHeight: 1.6,
    interactionDistance: 3
  },
  
  // Impostazioni dei tesori
  treasures: {
    types: {
      piccolo: {
        scale: 0.5,
        value: 1,
        color: 0xFFD700
      },
      medio: {
        scale: 0.8,
        value: 3,
        color: 0xFFD700
      },
      grande: {
        scale: 1.2,
        value: 5,
        color: 0xFFD700
      }
    },
    rotationSpeed: 0.01,
    hoverHeight: 0.5,
    hoverAmplitude: 0.2,
    hoverSpeed: 0.01
  },
  
  // Impostazioni di rendering
  rendering: {
    shadowMapEnabled: true,
    antialias: true,
    pixelRatio: window.devicePixelRatio,
    maxFPS: 60
  },
  
  // Impostazioni audio
  audio: {
    enabled: true,
    volume: 0.5,
    sounds: {
      background: 'assets/sounds/background.mp3',
      collect: 'assets/sounds/collect.mp3',
      jump: 'assets/sounds/jump.mp3',
      win: 'assets/sounds/win.mp3',
      lose: 'assets/sounds/lose.mp3'
    }
  },
  
  // Impostazioni di debug
  debug: {
    enabled: false,
    showFPS: false,
    showColliders: false
  }
};

// Questa variabile verrà aggiornata con la configurazione ricevuta dal server
let gameConfig = { ...DEFAULT_CONFIG };

const CONFIG = {
    // Impostazioni di gioco
    GAME: {
        DURATION: 300, // Durata della partita in secondi (5 minuti)
        MIN_PLAYERS: 2, // Numero minimo di giocatori per iniziare
        MAX_PLAYERS: 10, // Numero massimo di giocatori per partita
        TREASURE_SPAWN_INTERVAL: 15000, // Intervallo di spawn dei tesori (15 secondi)
    },
    
    // Impostazioni grafiche
    GRAPHICS: {
        DEFAULT_QUALITY: 'medium', // Qualità grafica predefinita
        DRAW_DISTANCE: 500, // Distanza di rendering predefinita
        SHADOW_MAP_SIZE: 2048, // Dimensione della shadow map
        FOV: 75, // Campo visivo della camera
        NEAR_PLANE: 0.1, // Piano vicino della camera
        FAR_PLANE: 2000, // Piano lontano della camera
    },
    
    // Impostazioni audio
    AUDIO: {
        MASTER_VOLUME: 1.0,
        MUSIC_VOLUME: 0.5,
        EFFECTS_VOLUME: 0.75,
    },
    
    // Impostazioni dei controlli
    CONTROLS: {
        MOUSE_SENSITIVITY: 0.5,
        MOVEMENT_SPEED: 10,
        JUMP_FORCE: 15,
        GRAVITY: 30,
    },
    
    // Impostazioni di rete
    NETWORK: {
        UPDATE_RATE: 60, // Frequenza di aggiornamento della rete (Hz)
        INTERPOLATION_DELAY: 100, // Ritardo di interpolazione (ms)
    },
    
    // Impostazioni del mondo
    WORLD: {
        SIZE: 1000, // Dimensione del mondo
        WATER_LEVEL: -0.5, // Livello dell'acqua
        ISLAND_RADIUS: 100, // Raggio dell'isola principale
        TERRAIN: {
            HEIGHT: 4, // Altezza massima del terreno
            SCALE: 100, // Scala del rumore del terreno
            OCTAVES: 4, // Numero di ottave per il rumore
            PERSISTENCE: 0.5, // Persistenza del rumore
            LACUNARITY: 2.0, // Lacunarità del rumore
        },
    },
    
    // Impostazioni dei tesori
    TREASURES: {
        TYPES: {
            NORMAL: { value: 1, color: 0xffcc00, probability: 0.7 },
            BLUE: { value: 3, color: 0x0088ff, probability: 0.2 },
            RED: { value: 5, color: 0xff3333, probability: 0.1 },
        },
        COLLECTION_RADIUS: 5, // Raggio di raccolta dei tesori
    },
}; 