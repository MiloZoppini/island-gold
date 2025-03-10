class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.hemisphereLight = null;
    }

    init() {
        // Luce solare direzionale
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(100, 100, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);

        // Luce lunare direzionale (più debole e bluastra)
        this.moonLight = new THREE.DirectionalLight(0x4d5e7c, 0.3);
        this.moonLight.position.set(-100, 100, 0);
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 2048;
        this.moonLight.shadow.mapSize.height = 2048;
        this.moonLight.shadow.camera.near = 0.5;
        this.moonLight.shadow.camera.far = 500;
        this.moonLight.shadow.camera.left = -100;
        this.moonLight.shadow.camera.right = 100;
        this.moonLight.shadow.camera.top = 100;
        this.moonLight.shadow.camera.bottom = -100;
        this.scene.add(this.moonLight);

        // Luce ambientale
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);

        // Luce emisferica per simulare il cielo
        this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x4d5e7c, 0.5);
        this.scene.add(this.hemisphereLight);
    }

    update(dayProgress) {
        // Calcola la posizione del sole/luna
        const angle = dayProgress * Math.PI * 2;
        const height = Math.sin(angle);
        const horizontal = Math.cos(angle);

        // Aggiorna posizione del sole
        this.sunLight.position.set(
            horizontal * 100,
            height * 100,
            0
        );

        // Aggiorna posizione della luna (opposta al sole)
        this.moonLight.position.set(
            -horizontal * 100,
            -height * 100,
            0
        );

        // Aggiorna intensità delle luci in base al momento del giorno
        const sunIntensity = Math.max(0, height);
        const moonIntensity = Math.max(0, -height);

        this.sunLight.intensity = sunIntensity;
        this.moonLight.intensity = moonIntensity * 0.3;

        // Aggiorna colore della luce ambientale
        const dayColor = new THREE.Color(0x404040);
        const nightColor = new THREE.Color(0x1a1a2a);
        this.ambientLight.color.copy(dayColor).lerp(nightColor, moonIntensity);

        // Aggiorna intensità della luce emisferica
        this.hemisphereLight.intensity = 0.5 * sunIntensity + 0.2;
    }
} 