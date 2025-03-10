// Inizializzazione del gioco
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inizializzazione del gioco...');
    
    // Crea l'event bus
    const eventBus = new EventBus();
    
    // Crea le impostazioni di qualità
    const qualitySettings = new QualitySettings();
    
    // Crea il gestore della scena
    const sceneManager = new SceneManager(eventBus, qualitySettings);
    
    // Crea il gestore degli input
    const inputManager = new InputManager(eventBus);
    
    // Crea il gestore dell'audio
    const audioManager = new AudioManager(eventBus);
    
    // Crea il gestore dell'interfaccia utente
    const uiManager = new UIManager(eventBus);
    
    // Crea il monitor delle prestazioni
    const performanceMonitor = new PerformanceMonitor(eventBus);
    
    // Inizializza il gioco
    const game = new Game(
        eventBus,
        sceneManager,
        inputManager,
        audioManager,
        uiManager,
        performanceMonitor,
        qualitySettings
    );
    
    // Avvia il gioco
    game.init();
    
    // Mostra la schermata di caricamento
    uiManager.showLoadingScreen();
    
    // Simula il caricamento
    setTimeout(() => {
        // Nascondi la schermata di caricamento e mostra la schermata iniziale
        uiManager.showStartScreen();
        
        // Aggiungi l'evento di click al pulsante di avvio
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                const playerName = document.getElementById('player-name').value || 'Giocatore';
                game.startGame(playerName);
            });
        }
    }, 2000);
    
    // Esponi il gioco globalmente per il debug
    window.game = game;
}); 