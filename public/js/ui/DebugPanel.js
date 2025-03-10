class DebugPanel {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'debug-panel hidden';
        this.element.innerHTML = `
            <h3>Debug Panel</h3>
            <div class="debug-content">
                <div class="debug-section">
                    <h4>Performance</h4>
                    <div id="fps">FPS: --</div>
                    <div id="ping">Ping: --ms</div>
                </div>
                <div class="debug-section">
                    <h4>Player</h4>
                    <div id="player-position">Position: x: --, y: --, z: --</div>
                    <div id="player-rotation">Rotation: --</div>
                </div>
                <div class="debug-section">
                    <h4>World</h4>
                    <div id="active-entities">Active Entities: --</div>
                    <div id="rendered-chunks">Rendered Chunks: --</div>
                </div>
                <div class="debug-section">
                    <h4>Network</h4>
                    <div id="connected-players">Connected Players: --</div>
                    <div id="packets-per-second">Packets/s: --</div>
                </div>
            </div>
        `;
        document.body.appendChild(this.element);

        this.stats = {
            fps: 0,
            ping: 0,
            playerPosition: { x: 0, y: 0, z: 0 },
            playerRotation: 0,
            activeEntities: 0,
            renderedChunks: 0,
            connectedPlayers: 0,
            packetsPerSecond: 0
        };

        this.lastUpdate = performance.now();
        this.frameCount = 0;
    }

    update(stats = {}) {
        Object.assign(this.stats, stats);
        
        // Aggiorna FPS
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastUpdate;
        
        if (delta >= 1000) {
            this.stats.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastUpdate = now;
        }

        // Aggiorna l'interfaccia
        this.updateUI();
    }

    updateUI() {
        const {
            fps,
            ping,
            playerPosition,
            playerRotation,
            activeEntities,
            renderedChunks,
            connectedPlayers,
            packetsPerSecond
        } = this.stats;

        // Aggiorna i valori nell'interfaccia
        this.element.querySelector('#fps').textContent = `FPS: ${fps}`;
        this.element.querySelector('#ping').textContent = `Ping: ${ping}ms`;
        this.element.querySelector('#player-position').textContent = 
            `Position: x: ${playerPosition.x.toFixed(2)}, y: ${playerPosition.y.toFixed(2)}, z: ${playerPosition.z.toFixed(2)}`;
        this.element.querySelector('#player-rotation').textContent = 
            `Rotation: ${playerRotation.toFixed(2)}`;
        this.element.querySelector('#active-entities').textContent = 
            `Active Entities: ${activeEntities}`;
        this.element.querySelector('#rendered-chunks').textContent = 
            `Rendered Chunks: ${renderedChunks}`;
        this.element.querySelector('#connected-players').textContent = 
            `Connected Players: ${connectedPlayers}`;
        this.element.querySelector('#packets-per-second').textContent = 
            `Packets/s: ${packetsPerSecond}`;
    }

    toggle(show) {
        if (show === undefined) {
            this.element.classList.toggle('hidden');
        } else {
            this.element.classList.toggle('hidden', !show);
        }
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 