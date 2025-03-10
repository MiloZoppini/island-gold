/**
 * Gestione dell'interfaccia utente
 * Questo file si occupa di gestire l'interfaccia utente del gioco
 */

class GameUI {
  constructor() {
    // Elementi dell'interfaccia
    this.loadingScreen = document.getElementById('loading-screen');
    this.startScreen = document.getElementById('start-screen');
    this.gameUI = document.getElementById('game-ui');
    this.gameOverScreen = document.getElementById('game-over');
    
    // Elementi del HUD
    this.scoreElement = document.getElementById('player-score');
    this.timeElement = document.getElementById('game-time');
    this.playerCountElement = document.getElementById('player-count');
    
    // Elementi della schermata di fine gioco
    this.winnerDisplay = document.getElementById('winner-display');
    this.finalScores = document.getElementById('final-scores');
    
    // Barra di progresso del caricamento
    this.progressBar = document.querySelector('.progress-fill');
    this.loadingText = document.querySelector('.loading-text');
  }

  /**
   * Inizializza l'interfaccia utente
   */
  init() {
    // Nascondi l'interfaccia di gioco e la schermata di fine gioco
    this.gameUI.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    
    // Mostra la schermata di caricamento
    this.loadingScreen.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
    
    // Imposta i valori iniziali
    this.scoreElement.textContent = '0';
    this.timeElement.textContent = this.formatTime(gameConfig.rules.durata_partita);
    this.playerCountElement.textContent = '1';
  }

  /**
   * Aggiorna la barra di progresso del caricamento
   */
  updateLoadingProgress(progress, message = null) {
    // Aggiorna la barra di progresso
    this.progressBar.style.width = `${progress * 100}%`;
    
    // Aggiorna il messaggio di caricamento se fornito
    if (message) {
      this.loadingText.textContent = message;
    }
    
    // Se il caricamento è completo, mostra la schermata iniziale
    if (progress >= 1) {
      setTimeout(() => {
        this.loadingScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
      }, 500);
    }
  }

  /**
   * Aggiorna il timer di gioco
   */
  updateGameTime(timeRemaining) {
    this.timeElement.textContent = this.formatTime(timeRemaining);
    
    // Cambia il colore del timer quando il tempo sta per scadere
    if (timeRemaining <= 60) {
      this.timeElement.style.color = '#ff0000';
    } else {
      this.timeElement.style.color = '#ffd700';
    }
  }

  /**
   * Formatta il tempo in minuti:secondi
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Aggiorna il punteggio del giocatore
   */
  updateScore(score) {
    this.scoreElement.textContent = score;
  }

  /**
   * Aggiorna il contatore dei giocatori
   */
  updatePlayerCount(count) {
    this.playerCountElement.textContent = count;
  }

  /**
   * Mostra la schermata di fine gioco
   */
  showGameOver(gameOverData) {
    // Nascondi l'interfaccia di gioco
    this.gameUI.classList.add('hidden');
    
    // Mostra la schermata di fine gioco
    this.gameOverScreen.classList.remove('hidden');
    
    // Mostra il vincitore
    const winnerId = gameOverData.winner;
    const isWinner = winnerId === socket.id;
    
    if (isWinner) {
      this.winnerDisplay.textContent = 'Hai vinto la partita!';
      this.winnerDisplay.style.color = '#ffd700';
    } else {
      this.winnerDisplay.textContent = 'Hai perso la partita.';
      this.winnerDisplay.style.color = '#ffffff';
    }
    
    // Mostra i punteggi finali
    this.finalScores.innerHTML = '';
    
    // Ordina i punteggi dal più alto al più basso
    const sortedScores = [...gameOverData.scores].sort((a, b) => b.score - a.score);
    
    sortedScores.forEach(playerScore => {
      const isCurrentPlayer = playerScore.id === socket.id;
      const isWinner = playerScore.id === winnerId;
      
      const scoreEntry = document.createElement('div');
      scoreEntry.className = 'score-entry';
      
      if (isWinner) {
        scoreEntry.classList.add('winner');
      }
      
      scoreEntry.textContent = `${isCurrentPlayer ? 'Tu' : `Giocatore ${playerScore.id.substr(0, 4)}`}: ${playerScore.score} oro`;
      
      this.finalScores.appendChild(scoreEntry);
    });
  }

  /**
   * Mostra un messaggio di notifica
   */
  showNotification(message, duration = 3000) {
    // Crea un elemento di notifica
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Aggiungi la notifica al DOM
    document.body.appendChild(notification);
    
    // Anima l'entrata della notifica
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Rimuovi la notifica dopo la durata specificata
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Rimuovi l'elemento dopo l'animazione di uscita
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, duration);
  }

  /**
   * Mostra un messaggio quando un tesoro viene raccolto
   */
  showTreasureCollected(treasureData, isCurrentPlayer) {
    const message = isCurrentPlayer
      ? `Hai trovato ${treasureData.value} oro!`
      : `Un altro giocatore ha trovato dell'oro!`;
    
    this.showNotification(message);
  }
} 