class AudioManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.isMuted = false;
        this.masterVolume = 1.0;
        this.soundVolume = 0.7;
        this.musicVolume = 0.4;

        // Inizializza il contesto audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Nodo master per il volume
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Ascolta gli eventi di gioco per riprodurre i suoni appropriati
        this.eventBus.on('game.start', () => this.playMusic('gameTheme'));
        this.eventBus.on('game.over', () => this.playSound('gameOver'));
        this.eventBus.on('player.damage', () => this.playSound('damage'));
        this.eventBus.on('player.heal', () => this.playSound('heal'));
        this.eventBus.on('player.collect', () => this.playSound('collect'));
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
            console.log(`Suono '${name}' caricato con successo`);
        } catch (error) {
            console.error(`Errore nel caricamento del suono '${name}':`, error);
        }
    }

    async loadMusic(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.music.set(name, audioBuffer);
            console.log(`Musica '${name}' caricata con successo`);
        } catch (error) {
            console.error(`Errore nel caricamento della musica '${name}':`, error);
        }
    }

    playSound(name, options = {}) {
        if (this.isMuted || !this.sounds.has(name)) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.get(name);

        // Crea un nodo gain per il volume del suono
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.soundVolume * (options.volume || 1.0);

        // Collega i nodi
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Imposta le opzioni
        if (options.loop) source.loop = true;
        if (options.playbackRate) source.playbackRate.value = options.playbackRate;

        // Riproduci il suono
        source.start(0);

        return source;
    }

    playMusic(name, fadeInDuration = 2) {
        if (this.isMuted || !this.music.has(name)) return;

        // Se c'è già della musica in riproduzione, sfumala
        if (this.currentMusic) {
            this.stopMusic(1);
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.music.get(name);
        source.loop = true;

        // Crea un nodo gain per il volume della musica
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // Inizia da volume 0

        // Collega i nodi
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Fade in
        gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
            this.musicVolume,
            this.audioContext.currentTime + fadeInDuration
        );

        source.start(0);
        this.currentMusic = { source, gainNode };
    }

    stopMusic(fadeOutDuration = 2) {
        if (!this.currentMusic) return;

        const { gainNode, source } = this.currentMusic;

        // Fade out
        gainNode.gain.linearRampToValueAtTime(
            gainNode.gain.value,
            this.audioContext.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + fadeOutDuration
        );

        // Ferma la sorgente dopo il fade out
        source.stop(this.audioContext.currentTime + fadeOutDuration);

        this.currentMusic = null;
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        this.masterGain.gain.value = this.masterVolume;
    }

    setSoundVolume(value) {
        this.soundVolume = Math.max(0, Math.min(1, value));
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.currentMusic) {
            this.currentMusic.gainNode.gain.value = this.musicVolume;
        }
    }

    mute() {
        this.isMuted = true;
        this.masterGain.gain.value = 0;
    }

    unmute() {
        this.isMuted = false;
        this.masterGain.gain.value = this.masterVolume;
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    async init() {
        // Carica i suoni di base
        await Promise.all([
            this.loadSound('damage', 'audio/damage.mp3'),
            this.loadSound('heal', 'audio/heal.mp3'),
            this.loadSound('collect', 'audio/collect.mp3'),
            this.loadSound('gameOver', 'audio/game-over.mp3'),
            this.loadMusic('gameTheme', 'audio/game-theme.mp3')
        ]);
    }
}

// Esponi la classe globalmente
window.AudioManager = AudioManager; 