class UIManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            startScreen: document.getElementById('start-screen'),
            gameUI: document.getElementById('game-ui'),
            healthBar: document.getElementById('health-bar'),
            scoreDisplay: document.getElementById('score-display'),
            notificationArea: document.getElementById('notification-area'),
            debugPanel: document.getElementById('debug-panel')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Ascolta gli eventi di aggiornamento della salute
        this.eventBus.on('player.health.updated', (data) => {
            this.updateHealthBar(data.health, data.maxHealth);
        });

        // Ascolta gli eventi di aggiornamento del punteggio
        this.eventBus.on('score.updated', (score) => {
            this.updateScore(score);
        });

        // Ascolta gli eventi di notifica
        this.eventBus.on('notification', (data) => {
            this.showNotification(data.message, data.type, data.duration);
        });

        // Ascolta gli eventi di debug
        this.eventBus.on('debug.metrics', (metrics) => {
            this.updateDebugInfo(metrics);
        });
    }

    showLoadingScreen() {
        this.elements.loadingScreen.classList.remove('hidden');
        this.elements.startScreen.classList.add('hidden');
        this.elements.gameUI.classList.add('hidden');
    }

    showStartScreen() {
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.startScreen.classList.remove('hidden');
        this.elements.gameUI.classList.add('hidden');
    }

    showGameUI() {
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.startScreen.classList.add('hidden');
        this.elements.gameUI.classList.remove('hidden');
    }

    updateHealthBar(health, maxHealth) {
        if (!this.elements.healthBar) return;
        
        const percentage = (health / maxHealth) * 100;
        this.elements.healthBar.style.width = `${percentage}%`;
        
        // Cambia il colore in base alla salute
        if (percentage > 60) {
            this.elements.healthBar.style.backgroundColor = '#4CAF50';
        } else if (percentage > 30) {
            this.elements.healthBar.style.backgroundColor = '#FFC107';
        } else {
            this.elements.healthBar.style.backgroundColor = '#F44336';
        }
    }

    updateScore(score) {
        if (!this.elements.scoreDisplay) return;
        this.elements.scoreDisplay.textContent = `Punteggio: ${score}`;
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (!this.elements.notificationArea) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.elements.notificationArea.appendChild(notification);

        // Rimuovi la notifica dopo la durata specificata
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    updateDebugInfo(metrics) {
        if (!this.elements.debugPanel) return;

        const debugInfo = `
            FPS: ${metrics.fps}<br>
            Frame Time: ${metrics.frameTime.toFixed(2)}ms<br>
            Objects: ${metrics.objectCount}<br>
            Triangles: ${metrics.triangleCount}<br>
            Memory: ${(metrics.jsHeapSizeUsed / 1048576).toFixed(2)}MB
        `;

        this.elements.debugPanel.innerHTML = debugInfo;
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'instructions';
        instructions.innerHTML = `
            <h2>Istruzioni</h2>
            <p>Controlli:</p>
            <ul>
                <li>W/S - Avanti/Indietro</li>
                <li>A/D - Sinistra/Destra</li>
                <li>Mouse - Guarda intorno</li>
                <li>Click Sinistro - Spara</li>
                <li>Spazio - Salta</li>
                <li>Shift - Accovacciati</li>
            </ul>
            <button id="start-game-btn">Inizia Gioco</button>
        `;

        document.body.appendChild(instructions);

        const startButton = instructions.querySelector('#start-game-btn');
        startButton.addEventListener('click', () => {
            instructions.remove();
            this.eventBus.emit('game.start');
        });
    }

    hideInstructions() {
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.remove();
        }
    }
}

export default UIManager; 