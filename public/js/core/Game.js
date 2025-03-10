class Game {
    constructor() {
        // Importa i moduli necessari
        this.GLTFLoader = THREE.GLTFLoader || window.GLTFLoader;
        this.PointerLockControls = THREE.PointerLockControls || window.PointerLockControls;
        this.Water = THREE.Water || window.Water;
        this.Sky = THREE.Sky || window.Sky;
        
        // Rendi l'istanza del gioco disponibile globalmente
        window.game = this;
        
        this.players = new Map();
        this.socket = null;
        this.clock = new THREE.Clock();
        this.loadedModels = {}; // Per memorizzare i modelli caricati
        this.isCollectingTreasure = false; // Flag per evitare eventi multipli di raccolta
        this.inLobby = true; // Flag per indicare se il giocatore è in lobby
        this.matchId = null; // ID della partita corrente
        this.gameStarted = false; // Flag per indicare se la partita è iniziata
        this.treasuresCollected = 0; // Contatore dei tesori raccolti
        this.treasures = []; // Array di tesori attivi
        this.gameTime = 300; // Tempo di gioco in secondi (5 minuti)
        this.gameTimer = null; // Timer per il countdown
        
        // Elementi UI
        this.loadingScreen = document.getElementById('loading-screen');
        this.startScreen = document.getElementById('start-screen');
        this.gameUI = document.getElementById('game-ui');
        this.startButton = document.getElementById('start-button');
        
        // Inizializza l'UI Manager
        this.ui = new UIManager();
        
        // Configura i gestori degli eventi Socket.IO
        this.setupSocketHandlers();
        
        // Inizializza la scena
        this.setupScene().then(() => {
            // Nascondi la schermata di caricamento
            this.loadingScreen.classList.add('hidden');
            // Mostra la schermata iniziale
            this.startScreen.classList.remove('hidden');
        }).catch(error => {
            console.error('Errore durante l\'inizializzazione:', error);
            this.ui.showNotification('Errore durante l\'inizializzazione del gioco', 'error');
        });
        
        // Gestisci il click sul pulsante Start
        this.startButton.addEventListener('click', () => this.startGame());
    }

    async setupScene() {
        try {
            // Renderer avanzato con post-processing
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                powerPreference: "high-performance",
                precision: "highp",
                stencil: false
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x87CEEB); // Colore di sfondo azzurro cielo
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
            this.renderer.physicallyCorrectLights = true;
            document.getElementById('game-container').appendChild(this.renderer.domElement);

            // Scene
            this.scene = new THREE.Scene();
            this.scene.fog = null;

            // Camera di fallback per il rendering iniziale
            this.fallbackCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
            this.fallbackCamera.position.set(0, 10, 20);
            this.fallbackCamera.lookAt(0, 0, 0);

            // Gestione del ridimensionamento della finestra
            window.addEventListener('resize', () => {
                if (this.localPlayer && this.localPlayer.camera) {
                    this.localPlayer.camera.aspect = window.innerWidth / window.innerHeight;
                    this.localPlayer.camera.updateProjectionMatrix();
                }
                this.fallbackCamera.aspect = window.innerWidth / window.innerHeight;
                this.fallbackCamera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // Inizializza il mondo di gioco
            this.world = new GameWorld(this.scene);
            
            // Avvia il loop di animazione
            this.animate();
            
            console.log('Scena inizializzata con successo');
        } catch (error) {
            console.error('Errore durante l\'inizializzazione della scena:', error);
            throw error;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Aggiorna il mondo di gioco
        if (this.world) {
            this.world.update(delta, time);
        }
        
        // Renderizza la scena
        if (this.localPlayer && this.localPlayer.camera) {
            this.renderer.render(this.scene, this.localPlayer.camera);
        } else {
            this.renderer.render(this.scene, this.fallbackCamera);
        }
    }

    setupSocketHandlers() {
        // Inizializza la connessione Socket.IO
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connesso al server');
            this.ui.showNotification('Connesso al server!', 'success');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnesso dal server');
            this.ui.showNotification('Disconnesso dal server', 'error');
        });
    }

    startGame() {
        try {
            // Nascondi la schermata iniziale
            this.startScreen.classList.add('hidden');
            // Mostra l'interfaccia di gioco
            this.gameUI.classList.remove('hidden');
            
            // Inizia la partita
            this.gameStarted = true;
            this.inLobby = false;
            
            // Emetti l'evento di inizio partita
            this.socket.emit('game:start');
            
            console.log('Gioco avviato con successo');
            this.ui.showNotification('Partita iniziata!', 'success');
        } catch (error) {
            console.error('Errore durante l\'avvio del gioco:', error);
            this.ui.showNotification('Errore durante l\'avvio del gioco', 'error');
        }
    }
}

// Avvia il gioco quando la pagina è caricata
window.addEventListener('load', () => {
    try {
        new Game();
    } catch (error) {
        console.error('Errore durante l\'inizializzazione del gioco:', error);
        // Mostra un messaggio di errore all'utente
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Errore durante il caricamento del gioco';
            loadingText.style.color = 'red';
        }
    }
}); 