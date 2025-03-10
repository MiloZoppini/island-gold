class HealthDisplay {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'health-display';
        this.element.innerHTML = `
            <div class="health-bar">
                <div class="health-fill"></div>
            </div>
            <div class="health-text">100</div>
        `;
        document.body.appendChild(this.element);
        
        this.healthFill = this.element.querySelector('.health-fill');
        this.healthText = this.element.querySelector('.health-text');
    }

    update(value) {
        // Assicurati che il valore sia tra 0 e 100
        const health = Math.max(0, Math.min(100, value));
        
        // Aggiorna la barra della salute
        this.healthFill.style.width = `${health}%`;
        
        // Aggiorna il testo
        this.healthText.textContent = Math.round(health);
        
        // Aggiorna il colore in base alla salute
        if (health > 70) {
            this.healthFill.style.backgroundColor = '#2ecc71'; // Verde
        } else if (health > 30) {
            this.healthFill.style.backgroundColor = '#f1c40f'; // Giallo
        } else {
            this.healthFill.style.backgroundColor = '#e74c3c'; // Rosso
        }
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 