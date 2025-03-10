class Player {
    constructor(scene, eventBus, position = new THREE.Vector3()) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.mesh = null;
        this.camera = null;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.speed = 10;
        this.jumpForce = 15;
        this.gravity = 30;
        this.health = 100;
        this.maxHealth = 100;
        this.isOnGround = false;
        this.canJump = true;
        this.isRunning = false;
        this.isCrouching = false;
        this.treasuresCollected = 0;

        this.setupPlayer(position);
        this.setupCamera();
        this.setupEventListeners();
    }

    setupPlayer(position) {
        // Crea il modello del giocatore (per ora un cilindro semplice)
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Aggiungi il giocatore alla scena
        this.scene.add(this.mesh);

        // Aggiungi una collider box per le collisioni
        this.collider = new THREE.Box3().setFromObject(this.mesh);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Posiziona la camera leggermente sopra e dietro il giocatore
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(this.mesh.position);

        // Aggiungi la camera come figlio del giocatore
        this.mesh.add(this.camera);
    }

    setupEventListeners() {
        // Ascolta gli eventi di danno
        this.eventBus.on('player.damage', (amount) => {
            this.damage(amount);
        });

        // Ascolta gli eventi di cura
        this.eventBus.on('player.heal', (amount) => {
            this.heal(amount);
        });

        // Ascolta gli eventi di raccolta tesori
        this.eventBus.on('player.collect', (value) => {
            this.collectTreasure(value);
        });
    }

    update(deltaTime, inputState) {
        this.updateMovement(deltaTime, inputState);
        this.updatePhysics(deltaTime);
        this.updateCamera(inputState);
        this.checkCollisions();
    }

    updateMovement(deltaTime, inputState) {
        // Calcola la direzione del movimento
        this.direction.z = Number(inputState.forward) - Number(inputState.backward);
        this.direction.x = Number(inputState.right) - Number(inputState.left);
        this.direction.normalize();

        // Applica la rotazione della camera al movimento
        const angle = this.rotation.y;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        const moveX = this.direction.x * cos - this.direction.z * sin;
        const moveZ = this.direction.x * sin + this.direction.z * cos;

        // Aggiorna la velocità orizzontale
        const currentSpeed = this.isRunning ? this.speed * 1.5 : this.speed;
        this.velocity.x = moveX * currentSpeed;
        this.velocity.z = moveZ * currentSpeed;

        // Gestisci il salto
        if (inputState.up && this.canJump && this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
            this.canJump = false;
            this.eventBus.emit('player.jump');
        }

        // Gestisci l'accovacciamento
        this.isCrouching = inputState.down;
        if (this.isCrouching) {
            this.mesh.scale.y = 0.5;
        } else {
            this.mesh.scale.y = 1;
        }
    }

    updatePhysics(deltaTime) {
        // Applica la gravità
        if (!this.isOnGround) {
            this.velocity.y -= this.gravity * deltaTime;
        }

        // Aggiorna la posizione
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;

        // Aggiorna la collider box
        this.collider.setFromObject(this.mesh);
    }

    updateCamera(inputState) {
        // Aggiorna la rotazione della camera in base al movimento del mouse
        if (inputState.mouseDelta) {
            this.rotation.y -= inputState.mouseDelta.x * 0.002;
            this.rotation.x -= inputState.mouseDelta.y * 0.002;

            // Limita la rotazione verticale
            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

            // Applica la rotazione
            this.camera.rotation.copy(this.rotation);
        }
    }

    checkCollisions() {
        // Implementa qui la logica per le collisioni con il terreno e gli oggetti
        // Per ora, impostiamo un pavimento artificiale
        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isOnGround = true;
            this.canJump = true;
        }
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Emetti un evento di aggiornamento della salute
        this.eventBus.emit('player.health.updated', {
            health: this.health,
            maxHealth: this.maxHealth
        });

        // Se la salute arriva a 0, il giocatore muore
        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Emetti un evento di aggiornamento della salute
        this.eventBus.emit('player.health.updated', {
            health: this.health,
            maxHealth: this.maxHealth
        });
    }

    collectTreasure(value = 1) {
        this.treasuresCollected += value;
        
        // Emetti un evento di aggiornamento del punteggio
        this.eventBus.emit('score.updated', this.treasuresCollected);
    }

    die() {
        // Emetti un evento di morte del giocatore
        this.eventBus.emit('player.died');
        
        // Disabilita i controlli
        this.enabled = false;
    }

    respawn(position) {
        // Ripristina la salute
        this.health = this.maxHealth;
        
        // Ripristina la posizione
        this.mesh.position.copy(position);
        this.velocity.set(0, 0, 0);
        
        // Ripristina lo stato
        this.isOnGround = false;
        this.canJump = true;
        this.enabled = true;
        
        // Emetti un evento di respawn
        this.eventBus.emit('player.respawned');
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    setPosition(position) {
        this.mesh.position.copy(position);
        this.collider.setFromObject(this.mesh);
    }

    getRotation() {
        return this.rotation.clone();
    }

    setRotation(rotation) {
        this.rotation.copy(rotation);
        this.camera.rotation.copy(rotation);
    }

    getHealth() {
        return this.health;
    }

    getTreasuresCollected() {
        return this.treasuresCollected;
    }

    cleanup() {
        // Rimuovi il modello dalla scena
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        // Rimuovi i listener degli eventi
        this.eventBus.off('player.damage');
        this.eventBus.off('player.heal');
        this.eventBus.off('player.collect');
    }
}

export default Player; 