/**
 * Wrapper per la classe Water di Three.js
 * Questo file fornisce funzionalità aggiuntive per l'acqua
 */

class WaterEffect {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.water = null;
        this.options = Object.assign({
            textureWidth: 512,
            textureHeight: 512,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            size: 1000,
            alpha: 0.8
        }, options);
    }

    /**
     * Crea l'acqua nella scena
     * @param {number} y - Posizione Y dell'acqua
     * @returns {THREE.Mesh} Mesh dell'acqua
     */
    create(y = 0) {
        // Verifica che Water sia disponibile
        if (typeof Water === 'undefined') {
            console.error('La classe Water non è disponibile. Assicurati che Three.js sia caricato correttamente.');
            return null;
        }

        // Crea la geometria dell'acqua
        const waterGeometry = new window.THREE.PlaneGeometry(
            this.options.size, 
            this.options.size, 
            32, 
            32
        );

        // Ruota la geometria per essere orizzontale
        waterGeometry.rotateX(-Math.PI / 2);

        // Crea la texture per le normali dell'acqua
        const waterNormals = new window.THREE.TextureLoader().load('textures/waternormals.jpg', function(texture) {
            texture.wrapS = texture.wrapT = window.THREE.RepeatWrapping;
        });

        // Crea l'acqua utilizzando la classe Water di Three.js
        this.water = new window.Water(
            waterGeometry,
            {
                textureWidth: this.options.textureWidth,
                textureHeight: this.options.textureHeight,
                waterNormals: waterNormals,
                sunDirection: new window.THREE.Vector3(0, 1, 0),
                sunColor: 0xffffff,
                waterColor: this.options.waterColor,
                distortionScale: this.options.distortionScale,
                fog: this.scene.fog !== undefined,
                alpha: this.options.alpha
            }
        );

        // Posiziona l'acqua
        this.water.position.y = y;

        // Aggiungi l'acqua alla scena
        this.scene.add(this.water);

        return this.water;
    }

    /**
     * Aggiorna l'acqua
     * @param {number} time - Tempo corrente
     */
    update(time) {
        if (this.water) {
            this.water.material.uniforms['time'].value = time / 1000;
        }
    }

    /**
     * Imposta la dimensione della texture dell'acqua
     * @param {number} size - Dimensione della texture
     */
    setSize(size) {
        if (this.water) {
            this.water.material.uniforms['textureWidth'].value = size;
            this.water.material.uniforms['textureHeight'].value = size;
        }
    }

    /**
     * Imposta la scala di distorsione dell'acqua
     * @param {number} scale - Scala di distorsione
     */
    setDistortionScale(scale) {
        if (this.water) {
            this.water.material.uniforms['distortionScale'].value = scale;
        }
    }

    /**
     * Imposta il colore dell'acqua
     * @param {number} color - Colore dell'acqua
     */
    setWaterColor(color) {
        if (this.water) {
            this.water.material.uniforms['waterColor'].value.set(color);
        }
    }

    /**
     * Imposta l'opacità dell'acqua
     * @param {number} alpha - Opacità dell'acqua
     */
    setAlpha(alpha) {
        if (this.water) {
            this.water.material.uniforms['alpha'].value = alpha;
        }
    }
}

// Esponi la classe globalmente
window.WaterEffect = WaterEffect; 