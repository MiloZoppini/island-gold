class UIManager {
    constructor() {
        this.components = {
            debugPanel: null,
            healthDisplay: null,
            instructionsPanel: null,
            landingPage: null,
            leaderboardDisplay: null,
            notifications: null,
            playerCountDisplay: null,
            settingsMenu: null
        };
        
        this.currentScreen = null;
        this.isDebugMode = false;
    }

    init() {
        // Inizializza tutti i componenti UI
        this.components.debugPanel = new DebugPanel();
        this.components.healthDisplay = new HealthDisplay();
        this.components.instructionsPanel = new InstructionsPanel();
        this.components.landingPage = new LandingPage();
        this.components.leaderboardDisplay = new LeaderboardDisplay();
        this.components.notifications = new Notifications();
        this.components.playerCountDisplay = new PlayerCountDisplay();
        this.components.settingsMenu = new SettingsMenu();

        // Nascondi tutti i componenti all'inizio
        this.hideAllScreens();
        
        // Mostra la landing page
        this.showScreen('landingPage');

        // Aggiungi listener per i tasti di scelta rapida
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    showScreen(screenName) {
        if (this.currentScreen) {
            this.components[this.currentScreen].hide();
        }
        
        this.components[screenName].show();
        this.currentScreen = screenName;
    }

    hideAllScreens() {
        Object.values(this.components).forEach(component => {
            if (component && component.hide) {
                component.hide();
            }
        });
    }

    toggleDebugMode() {
        this.isDebugMode = !this.isDebugMode;
        this.components.debugPanel.toggle(this.isDebugMode);
    }

    showNotification(message, type = 'info', duration = 3000) {
        this.components.notifications.show(message, type, duration);
    }

    updatePlayerCount(count) {
        this.components.playerCountDisplay.update(count);
    }

    updateLeaderboard(scores) {
        this.components.leaderboardDisplay.update(scores);
    }

    handleKeyPress(event) {
        switch(event.key) {
            case 'Escape':
                this.components.settingsMenu.toggle();
                break;
            case 'Tab':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleDebugMode();
                }
                break;
        }
    }

    updateHealth(value) {
        this.components.healthDisplay.update(value);
    }
} 