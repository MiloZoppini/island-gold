class SettingsMenu {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'settings-menu hidden';
        this.element.innerHTML = `
            <div class="settings-content">
                <h2>Impostazioni</h2>
                <div class="settings-section">
                    <h3>Grafica</h3>
                    <div class="setting-item">
                        <label for="quality">Qualità grafica:</label>
                        <select id="quality">
                            <option value="low">Bassa</option>
                            <option value="medium" selected>Media</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="draw-distance">Distanza di rendering:</label>
                        <input type="range" id="draw-distance" min="100" max="1000" step="100" value="500">
                        <span class="value">500m</span>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Audio</h3>
                    <div class="setting-item">
                        <label for="master-volume">Volume principale:</label>
                        <input type="range" id="master-volume" min="0" max="100" value="100">
                        <span class="value">100%</span>
                    </div>
                    <div class="setting-item">
                        <label for="music-volume">Volume musica:</label>
                        <input type="range" id="music-volume" min="0" max="100" value="50">
                        <span class="value">50%</span>
                    </div>
                    <div class="setting-item">
                        <label for="effects-volume">Volume effetti:</label>
                        <input type="range" id="effects-volume" min="0" max="100" value="75">
                        <span class="value">75%</span>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Controlli</h3>
                    <div class="setting-item">
                        <label for="mouse-sensitivity">Sensibilità mouse:</label>
                        <input type="range" id="mouse-sensitivity" min="1" max="10" step="0.5" value="5">
                        <span class="value">5</span>
                    </div>
                    <div class="setting-item">
                        <label for="invert-y">Inverti asse Y:</label>
                        <input type="checkbox" id="invert-y">
                    </div>
                </div>
                <div class="settings-buttons">
                    <button id="settings-apply" class="btn-primary">Applica</button>
                    <button id="settings-cancel" class="btn-secondary">Annulla</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.element);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Gestisci gli input range
        this.element.querySelectorAll('input[type="range"]').forEach(input => {
            const valueDisplay = input.nextElementSibling;
            input.addEventListener('input', () => {
                let value = input.value;
                if (input.id === 'draw-distance') {
                    value += 'm';
                } else if (input.id !== 'mouse-sensitivity') {
                    value += '%';
                }
                valueDisplay.textContent = value;
            });
        });

        // Gestisci i pulsanti
        this.element.querySelector('#settings-apply').addEventListener('click', () => {
            this.applySettings();
            this.hide();
        });

        this.element.querySelector('#settings-cancel').addEventListener('click', () => {
            this.hide();
        });
    }

    applySettings() {
        const settings = {
            graphics: {
                quality: this.element.querySelector('#quality').value,
                drawDistance: parseInt(this.element.querySelector('#draw-distance').value)
            },
            audio: {
                masterVolume: parseInt(this.element.querySelector('#master-volume').value) / 100,
                musicVolume: parseInt(this.element.querySelector('#music-volume').value) / 100,
                effectsVolume: parseInt(this.element.querySelector('#effects-volume').value) / 100
            },
            controls: {
                mouseSensitivity: parseFloat(this.element.querySelector('#mouse-sensitivity').value),
                invertY: this.element.querySelector('#invert-y').checked
            }
        };

        // Emetti un evento con le nuove impostazioni
        const event = new CustomEvent('settingsChanged', { detail: settings });
        document.dispatchEvent(event);
    }

    toggle() {
        this.element.classList.toggle('hidden');
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 