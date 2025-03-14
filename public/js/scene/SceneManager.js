class SceneManager {
    constructor(eventBus, qualitySettings) {
        this.eventBus = eventBus;
        this.qualitySettings = qualitySettings;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mainActor = null;
        this.water = null;
        this.sky = null;
        this.sun = null;
        this.lights = {
            ambient: null,
            directional: null,
            hemisphere: null
        };
        this.objects = new Map();
        this.isPaused = false;
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupEnvironment();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene = new window.THREE.Scene();
        this.scene.fog = new window.THREE.FogExp2(0x88ccee, 0.002);
    }

    setupCamera() {
        this.camera = new window.THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            this.qualitySettings.getSetting('drawDistance')
        );
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new window.THREE.WebGLRenderer({
            antialias: this.qualitySettings.getSetting('antialiasing'),
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = window.THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = window.THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = window.THREE.sRGBEncoding;

        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Luce ambientale
        this.lights.ambient = new window.THREE.AmbientLight(0x404040);
        this.scene.add(this.lights.ambient);

        // Luce direzionale (sole)
        this.lights.directional = new window.THREE.DirectionalLight(0xffffff, 1);
        this.lights.directional.position.set(100, 100, 0);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = this.qualitySettings.getSetting('shadowMapSize');
        this.lights.directional.shadow.mapSize.height = this.qualitySettings.getSetting('shadowMapSize');
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 500;
        this.scene.add(this.lights.directional);

        // Luce emisferica
        this.lights.hemisphere = new window.THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(this.lights.hemisphere);
    }

    setupEnvironment() {
        // Cielo
        this.sky = new window.THREE.Sky();
        this.sky.scale.setScalar(10000);
        this.scene.add(this.sky);

        // Sole
        this.sun = new window.THREE.Vector3();
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 2;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;

        // Acqua
        const waterGeometry = new window.THREE.PlaneGeometry(10000, 10000);
        this.water = new window.THREE.Water(waterGeometry, {
            textureWidth: this.qualitySettings.getSetting('waterQuality') === 'high' ? 1024 : 512,
            textureHeight: this.qualitySettings.getSetting('waterQuality') === 'high' ? 1024 : 512,
            waterNormals: new window.THREE.TextureLoader().load('textures/waternormals.jpg', (texture) => {
                texture.wrapS = texture.wrapT = window.THREE.RepeatWrapping;
            }),
            sunDirection: new window.THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: this.scene.fog !== undefined
        });
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -1;
        this.scene.add(this.water);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        this.eventBus.on('quality.changed', () => {
            this.updateQualitySettings();
        });
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    updateQualitySettings() {
        // Aggiorna le impostazioni del renderer
        this.qualitySettings.applyToRenderer(this.renderer);

        // Aggiorna le impostazioni dell'acqua
        this.qualitySettings.applyToWater(this.water);

        // Aggiorna le ombre
        if (this.lights.directional) {
            this.lights.directional.shadow.mapSize.width = this.qualitySettings.getSetting('shadowMapSize');
            this.lights.directional.shadow.mapSize.height = this.qualitySettings.getSetting('shadowMapSize');
        }

        // Aggiorna la distanza di visualizzazione
        if (this.camera) {
            this.camera.far = this.qualitySettings.getSetting('drawDistance');
            this.camera.updateProjectionMatrix();
        }
    }

    setMainActor(actor) {
        this.mainActor = actor;
    }

    addObject(id, object) {
        this.objects.set(id, object);
        this.scene.add(object);
    }

    removeObject(id) {
        const object = this.objects.get(id);
        if (object) {
            this.scene.remove(object);
            this.objects.delete(id);
        }
    }

    update(deltaTime) {
        if (this.isPaused) return;

        // Aggiorna l'acqua
        if (this.water) {
            this.water.material.uniforms['time'].value += deltaTime;
        }

        // Aggiorna la posizione del sole
        if (this.sun && this.sky) {
            const theta = Math.PI * (0.45 + 0.25);
            const phi = 2 * Math.PI * (0.25 - 0.5);
            this.sun.x = Math.cos(phi);
            this.sun.y = Math.sin(phi) * Math.sin(theta);
            this.sun.z = Math.sin(phi) * Math.cos(theta);
            this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
            this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();
        }

        // Aggiorna gli oggetti della scena
        this.objects.forEach(object => {
            if (object.update) {
                object.update(deltaTime);
            }
        });
    }

    render() {
        if (this.isPaused) return;

        if (this.mainActor && this.mainActor.camera) {
            this.renderer.render(this.scene, this.mainActor.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    pauseGame() {
        this.isPaused = true;
    }

    resumeGame() {
        this.isPaused = false;
    }

    setCinematicView() {
        // Imposta una vista cinematografica per la modalità preview
        if (this.camera) {
            this.camera.position.set(100, 30, 100);
            this.camera.lookAt(0, 0, 0);
        }
    }

    processRaycast(raycaster, isClicking) {
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        for (const intersect of intersects) {
            const object = intersect.object;
            
            // Gestisci l'hover
            if (object.onHover) {
                object.onHover(intersect);
            }
            
            // Gestisci il click
            if (isClicking && object.onClick) {
                object.onClick(intersect);
            }
        }
    }

    async initMap() {
        const terrainGenerator = new TerrainGenerator();
        this.map = new Map(this.scene, terrainGenerator);
        await this.map.initialize();
    }
}

// Esponi la classe globalmente
window.SceneManager = SceneManager; 