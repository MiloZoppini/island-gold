class Weather {
    constructor(scene) {
        this.scene = scene;
        this.particleSystem = new ParticleSystem();
        this.rainIntensity = 0;
        this.fogIntensity = 0;
        this.rainParticles = null;
        this.fogParticles = null;
    }

    init() {
        // Inizializza la nebbia della scena
        this.scene.fog = new window.THREE.FogExp2(0x8395a7, 0.001);
        
        // Crea i sistemi di particelle per pioggia e nebbia
        this.rainParticles = this.particleSystem.createParticleSystem('rain', {
            count: 5000,
            size: 0.1,
            spread: { x: 500, y: 200, z: 500 },
            velocity: { x: 0, y: -20, z: 0 },
            lifetime: 1,
            color: 0xaaaaaa,
            opacity: 0.6
        });

        this.fogParticles = this.particleSystem.createParticleSystem('fog', {
            count: 1000,
            size: 5,
            spread: { x: 500, y: 10, z: 500 },
            velocity: { x: 0.1, y: 0.05, z: 0.1 },
            lifetime: 10,
            color: 0xcccccc,
            opacity: 0.3
        });

        this.scene.add(this.rainParticles);
        this.scene.add(this.fogParticles);

        // Inizialmente nascondi gli effetti
        this.setRainIntensity(0);
        this.setFogIntensity(0);
    }

    setRainIntensity(intensity) {
        this.rainIntensity = Math.max(0, Math.min(1, intensity));
        if (this.rainParticles) {
            this.rainParticles.visible = this.rainIntensity > 0;
            this.rainParticles.material.opacity = this.rainIntensity * 0.6;
        }
    }

    setFogIntensity(intensity) {
        this.fogIntensity = Math.max(0, Math.min(1, intensity));
        if (this.scene.fog) {
            this.scene.fog.density = 0.001 + (this.fogIntensity * 0.01);
        }
        if (this.fogParticles) {
            this.fogParticles.visible = this.fogIntensity > 0;
            this.fogParticles.material.opacity = this.fogIntensity * 0.3;
        }
    }

    update(delta, dayProgress) {
        // Aggiorna le particelle
        if (this.rainParticles && this.rainParticles.visible) {
            this.particleSystem.updateParticles(this.rainParticles, 'rain', delta);
        }
        if (this.fogParticles && this.fogParticles.visible) {
            this.particleSystem.updateParticles(this.fogParticles, 'fog', delta);
        }

        // Aggiorna intensità in base al tempo del giorno
        // Più probabilità di pioggia e nebbia durante la notte e l'alba
        const timeOfDay = Math.sin(dayProgress * Math.PI * 2);
        if (Math.random() < 0.001) { // Occasionalmente cambia il tempo
            if (timeOfDay < 0) { // Notte
                this.setRainIntensity(Math.random() * 0.8);
                this.setFogIntensity(Math.random() * 0.6);
            } else { // Giorno
                this.setRainIntensity(Math.random() * 0.3);
                this.setFogIntensity(Math.random() * 0.2);
            }
        }
    }
} 