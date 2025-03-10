class GameSocket {
    constructor() {
        this.socket = io();
        this.playerId = null;
        this.playerNickname = 'Giocatore' + Math.floor(Math.random() * 1000);
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Connesso al server');
            this.playerId = this.socket.id;
            
            // Invia il nickname al server
            this.socket.emit('player:join', {
                nickname: this.playerNickname
            });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnesso dal server');
        });

        this.socket.on('game:start', (data) => {
            console.log('Partita iniziata:', data);
            if (this.onMatchStart) {
                this.onMatchStart(data);
            }
        });

        this.socket.on('game:over', (data) => {
            console.log('Partita terminata:', data);
            if (this.onGameOver) {
                this.onGameOver(data);
            }
        });

        this.socket.on('player:joined', (data) => {
            console.log('Nuovo giocatore:', data);
            if (this.onPlayerJoined) {
                this.onPlayerJoined(data);
            }
        });

        this.socket.on('player:left', (data) => {
            console.log('Giocatore uscito:', data);
            if (this.onPlayerLeft) {
                this.onPlayerLeft(data);
            }
        });

        this.socket.on('player:moved', (data) => {
            if (this.onPlayerMoved) {
                this.onPlayerMoved(data);
            }
        });

        this.socket.on('treasure:collected', (data) => {
            console.log('Tesoro raccolto:', data);
            if (this.onTreasureCollected) {
                this.onTreasureCollected(data.playerId, data.position, data.type);
            }
        });

        this.socket.on('treasure:update', (data) => {
            if (this.onTreasureUpdate) {
                this.onTreasureUpdate(data);
            }
        });

        this.socket.on('score:update', (data) => {
            if (this.onScoreUpdate) {
                this.onScoreUpdate(data.playerId, data.score);
            }
        });
    }

    // Metodi per inviare eventi al server
    emitPlayerMove(position, rotation) {
        this.socket.emit('player:move', {
            position: position,
            rotation: rotation
        });
    }

    emitTreasureCollected(playerId, position, type) {
        this.socket.emit('treasure:collect', {
            playerId: playerId,
            position: position,
            type: type
        });
    }

    emitJoinLobby() {
        this.socket.emit('lobby:join');
    }

    emitLeaveLobby() {
        this.socket.emit('lobby:leave');
    }

    emitReadyToPlay() {
        this.socket.emit('player:ready');
    }
} 