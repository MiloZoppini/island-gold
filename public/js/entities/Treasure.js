class Treasure {
    constructor(scene, eventBus, position, value = 1) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.value = value;
        this.mesh = null;
        this.collider = null;
        this.isCollected = false;
        this.glowMaterial = null;
        this.originalPosition = position.clone();
        this.floatAmplitude = 0.2;
        this.floatSpeed = 2;
        this.rotationSpeed = 1;

        this.setupTreasure(position);
        this.setupGlow();
    }

    setupTreasure(position) {
        // Crea la geometria del tesoro (per ora un cubo dorato)
        const geometry = new window.THREE.BoxGeometry(1, 1, 1);
        const material = new window.THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 1,
            roughness: 0.3,
            emissive: 0xFFD700,
            emissiveIntensity: 0.2
        });

        this.mesh = new window.THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Aggiungi il tesoro alla scena
        this.scene.add(this.mesh);

        // Crea la collider box
        this.collider = new window.THREE.Box3().setFromObject(this.mesh);

        // Aggiungi una reference al tesoro nel mesh per il raycasting
        this.mesh.treasure = this;
    }

    setupGlow() {
        // Crea un materiale per l'effetto glow
        this.glowMaterial = new window.THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new window.THREE.Color(0xFFD700) }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    intensity = intensity * (0.5 + 0.5 * sin(time * 2.0));
                    gl_FragColor = vec4(color, intensity);
                }
            `,
            transparent: true,
            blending: window.THREE.AdditiveBlending,
            side: window.THREE.BackSide
        });

        // Crea una mesh leggermente più grande per l'effetto glow
        const glowGeometry = new window.THREE.BoxGeometry(1.2, 1.2, 1.2);
        const glowMesh = new window.THREE.Mesh(glowGeometry, this.glowMaterial);
        this.mesh.add(glowMesh);
    }

    update(deltaTime, time) {
        if (this.isCollected) return;

        // Aggiorna l'effetto glow
        if (this.glowMaterial) {
            this.glowMaterial.uniforms.time.value = time;
        }

        // Fai fluttuare il tesoro
        const floatOffset = Math.sin(time * this.floatSpeed) * this.floatAmplitude;
        this.mesh.position.y = this.originalPosition.y + floatOffset;

        // Ruota il tesoro
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;

        // Aggiorna la collider box
        this.collider.setFromObject(this.mesh);
    }

    collect(player) {
        if (this.isCollected) return;

        this.isCollected = true;

        // Emetti particelle
        this.emitCollectParticles();

        // Riproduci suono
        this.eventBus.emit('audio.play', 'collect');

        // Aggiorna il punteggio del giocatore
        this.eventBus.emit('player.collect', this.value);

        // Animazione di raccolta
        this.playCollectAnimation().then(() => {
            this.cleanup();
        });
    }

    emitCollectParticles() {
        // Emetti un evento per creare particelle al punto di raccolta
        this.eventBus.emit('particles.emit', {
            position: this.mesh.position.clone(),
            count: 20,
            color: 0xFFD700,
            duration: 1
        });
    }

    async playCollectAnimation() {
        return new Promise((resolve) => {
            // Scala il tesoro fino a farlo scomparire
            const duration = 0.5;
            const startScale = this.mesh.scale.clone();
            const startY = this.mesh.position.y;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                // Scala e sposta verso l'alto
                const scale = 1 - progress;
                this.mesh.scale.copy(startScale).multiplyScalar(scale);
                this.mesh.position.y = startY + progress * 2;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    cleanup() {
        // Rimuovi il tesoro dalla scena
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            if (this.glowMaterial) {
                this.glowMaterial.dispose();
            }
        }
    }

    // Metodi per il raycasting e l'interazione
    onHover() {
        if (!this.isCollected) {
            document.body.style.cursor = 'pointer';
        }
    }

    onClick(player) {
        if (!this.isCollected) {
            // Verifica la distanza dal giocatore
            const distance = this.mesh.position.distanceTo(player.getPosition());
            if (distance <= 3) { // Distanza massima per la raccolta
                this.collect(player);
            } else {
                // Mostra un messaggio che indica che il tesoro è troppo lontano
                this.eventBus.emit('notification', {
                    message: 'Avvicinati per raccogliere il tesoro!',
                    type: 'info'
                });
            }
        }
    }

    getValue() {
        return this.value;
    }

    isCollectable() {
        return !this.isCollected;
    }

    getPosition() {
        return this.mesh.position.clone();
    }
}

// Esponi la classe globalmente
window.Treasure = Treasure; 