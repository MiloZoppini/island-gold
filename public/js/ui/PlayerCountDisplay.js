class PlayerCountDisplay {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'player-count';
        this.element.innerHTML = `
            <i class="fas fa-users"></i>
            <span class="count">0</span>
        `;
        document.body.appendChild(this.element);
        
        this.countElement = this.element.querySelector('.count');
    }

    update(count) {
        this.countElement.textContent = count;
        
        // Aggiorna la classe in base al numero di giocatori
        this.element.classList.remove('low', 'medium', 'high');
        
        if (count < 4) {
            this.element.classList.add('low');
        } else if (count < 8) {
            this.element.classList.add('medium');
        } else {
            this.element.classList.add('high');
        }
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 