class LeaderboardDisplay {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'leaderboard';
        this.element.innerHTML = `
            <h2>Classifica</h2>
            <div class="leaderboard-list"></div>
        `;
        document.body.appendChild(this.element);
        this.listElement = this.element.querySelector('.leaderboard-list');
    }

    update(scores) {
        // Ordina i punteggi in ordine decrescente
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);
        
        // Aggiorna la lista
        this.listElement.innerHTML = sortedScores.map((player, index) => `
            <div class="leaderboard-item ${player.id === window.playerId ? 'current-player' : ''}">
                <span class="position">${index + 1}</span>
                <span class="player-name">Giocatore ${player.id.slice(0, 4)}</span>
                <span class="score">${player.score}</span>
            </div>
        `).join('');
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 