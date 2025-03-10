class Game {
    constructor(eventBus, sceneManager, inputManager, audioManager, uiManager, performanceMonitor, qualitySettings) {
        this.eventBus = eventBus;
        this.sceneManager = sceneManager;
        this.inputManager = inputManager;
        this.audioManager = audioManager;
        this.uiManager = uiManager;
        this.performanceMonitor = performanceMonitor;
        this.qualitySettings = qualitySettings;
        
        this.clock = new THREE.Clock();
        this.player = null;
        this.treasures = [];
        this.isRunning = false;
        this.playerName = 'Giocatore';
    }

    init() {
        console.log('Inizializzazione del gioco...');
        
        // Inizializza i manager
        this.sceneManager.init();
        this.inputManager.init();
        this.audioManager.init();
        
        // Aggiungi listener per gli eventi
        this.setupEventListeners();
        
        // Avvia il loop di gioco
        this.animate();
    }

    setupEventListeners() {
        // Ascolta l'evento di avvio del gioco
        this.eventBus.on('game.start', () => {
            this.startGame();
        });
        
        // Ascolta l'evento di fine del gioco
        this.eventBus.on('game.over', () => {
            this.endGame();
        });
    }

    startGame(playerName) {
        if (playerName) {
            this.playerName = playerName;
        }
        
        console.log(`Avvio del gioco per ${this.playerName}...`);
        
        // Mostra l'interfaccia di gioco
        this.uiManager.showGameUI();
        
        // Crea il giocatore
        this.createPlayer();
        
        // Crea i tesori
        this.createTreasures();
        
        // Abilita gli input
        this.inputManager.enable();
        
        // Imposta il gioco come in esecuzione
        this.isRunning = true;
        
        // Emetti l'evento di avvio del gioco
        this.eventBus.emit('game.started');
    }

    endGame() {
        console.log('Fine del gioco');
        
        // Disabilita gli input
        this.inputManager.disable();
        
        // Imposta il gioco come non in esecuzione
        this.isRunning = false;
        
        // Mostra la schermata di fine gioco
        this.uiManager.showGameOver();
        
        // Emetti l'evento di fine del gioco
        this.eventBus.emit('game.ended');
    }

    createPlayer() {
        // Crea il giocatore
        const spawnPoint = new THREE.Vector3(0, 5, 0);
        this.player = new Player(this.sceneManager.scene, this.eventBus, spawnPoint);
        
        // Imposta il giocatore come attore principale
        this.sceneManager.setMainActor(this.player);
        
        // Aggiorna la barra della salute
        this.eventBus.emit('player.health.updated', {
            health: this.player.health,
            maxHealth: this.player.maxHealth
        });
    }

    createTreasures() {
        // Crea alcuni tesori di esempio
        const treasurePositions = [
            new THREE.Vector3(10, 0, 10),
            new THREE.Vector3(-10, 0, -10),
            new THREE.Vector3(20, 0, -20),
            new THREE.Vector3(-20, 0, 20)
        ];
        
        treasurePositions.forEach((position, index) => {
            const value = Math.floor(Math.random() * 5) + 1; // Valore casuale tra 1 e 5
            const treasure = new Treasure(this.sceneManager.scene, this.eventBus, position, value);
            this.treasures.push(treasure);
        });
    }

    update(deltaTime) {
        if (!this.isRunning) return;
        
        // Aggiorna il giocatore
        if (this.player) {
            this.player.update(deltaTime, this.inputManager.getInputState());
        }
        
        // Aggiorna i tesori
        this.treasures.forEach(treasure => {
            treasure.update(deltaTime, this.clock.elapsedTime);
        });
        
        // Controlla le collisioni
        this.checkCollisions();
    }

    checkCollisions() {
        if (!this.player) return;
        
        // Controlla le collisioni con i tesori
        this.treasures.forEach(treasure => {
            if (treasure.isCollectable()) {
                const distance = this.player.getPosition().distanceTo(treasure.getPosition());
                if (distance < 2) {
                    treasure.collect(this.player);
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calcola il delta time
        const deltaTime = this.clock.getDelta();
        
        // Aggiorna il gioco
        this.update(deltaTime);
        
        // Aggiorna la scena
        this.sceneManager.update(deltaTime);
        
        // Renderizza la scena
        this.sceneManager.render();
        
        // Aggiorna il monitor delle prestazioni
        this.performanceMonitor.update(performance.now());
    }
}

// Esponi la classe globalmente
window.Game = Game; 