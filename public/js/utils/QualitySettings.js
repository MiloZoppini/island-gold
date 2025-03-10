class QualitySettings {
    constructor() {
        this.qualityLevels = {
            low: {
                shadowMapSize: 1024,
                shadowDistance: 100,
                drawDistance: 500,
                maxParticles: 100,
                antialiasing: false,
                anisotropy: 1,
                textureQuality: 'low',
                waterQuality: 'low',
                reflections: false,
                postProcessing: false
            },
            medium: {
                shadowMapSize: 2048,
                shadowDistance: 200,
                drawDistance: 1000,
                maxParticles: 500,
                antialiasing: true,
                anisotropy: 4,
                textureQuality: 'medium',
                waterQuality: 'medium',
                reflections: true,
                postProcessing: true
            },
            high: {
                shadowMapSize: 4096,
                shadowDistance: 400,
                drawDistance: 2000,
                maxParticles: 2000,
                antialiasing: true,
                anisotropy: 16,
                textureQuality: 'high',
                waterQuality: 'high',
                reflections: true,
                postProcessing: true
            }
        };

        // Imposta la qualità predefinita in base alle prestazioni del dispositivo
        this.currentQuality = this.detectOptimalQuality();
        this.settings = { ...this.qualityLevels[this.currentQuality] };
    }

    detectOptimalQuality() {
        // Rileva le capacità del dispositivo
        const gpu = this.getGPUTier();
        const memory = this.getAvailableMemory();
        const isMobile = this.isMobileDevice();

        // Determina la qualità ottimale
        if (isMobile || gpu === 'low' || memory < 2) {
            return 'low';
        } else if (gpu === 'high' && memory >= 4) {
            return 'high';
        } else {
            return 'medium';
        }
    }

    getGPUTier() {
        // Implementazione semplificata del rilevamento GPU
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'low';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'medium';

        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

        // Lista di GPU note
        const highEndGPUs = ['nvidia', 'radeon', 'intel iris'];
        const lowEndGPUs = ['intel hd graphics', 'intel uhd graphics'];

        if (highEndGPUs.some(gpu => renderer.includes(gpu))) {
            return 'high';
        } else if (lowEndGPUs.some(gpu => renderer.includes(gpu))) {
            return 'low';
        }

        return 'medium';
    }

    getAvailableMemory() {
        // Rileva la memoria disponibile in GB
        if (window.performance && window.performance.memory) {
            return window.performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
        }
        return 4; // Valore predefinito se non rilevabile
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    setQuality(level) {
        if (this.qualityLevels[level]) {
            this.currentQuality = level;
            this.settings = { ...this.qualityLevels[level] };
            return true;
        }
        return false;
    }

    getQuality() {
        return this.currentQuality;
    }

    getSetting(name) {
        return this.settings[name];
    }

    setSetting(name, value) {
        if (this.settings.hasOwnProperty(name)) {
            this.settings[name] = value;
            return true;
        }
        return false;
    }

    getSettings() {
        return { ...this.settings };
    }

    applyToRenderer(renderer) {
        if (!renderer) return;

        renderer.shadowMap.enabled = this.settings.shadowMapSize > 0;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.antialias = this.settings.antialiasing;
        
        if (this.settings.postProcessing) {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            renderer.outputEncoding = THREE.sRGBEncoding;
        } else {
            renderer.toneMapping = THREE.NoToneMapping;
            renderer.outputEncoding = THREE.LinearEncoding;
        }
    }

    applyToWater(water) {
        if (!water) return;

        const quality = this.settings.waterQuality;
        switch (quality) {
            case 'low':
                water.setSize(64);
                water.setDistortionScale(1);
                break;
            case 'medium':
                water.setSize(128);
                water.setDistortionScale(2);
                break;
            case 'high':
                water.setSize(256);
                water.setDistortionScale(4);
                break;
        }
    }
}

// Esponi la classe globalmente
window.QualitySettings = QualitySettings; 