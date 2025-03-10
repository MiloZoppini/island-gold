/**
 * Gestione del giocatore
 * Questo file si occupa di gestire il giocatore e i suoi controlli
 */

class Player {
  constructor(camera, scene, world) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    
    this.id = null;
    this.controls = null;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.isJumping = false;
    
    this.height = gameConfig.player.height;
    this.speed = gameConfig.player.speed;
    this.jumpForce = gameConfig.player.jumpForce;
    this.position = new THREE.Vector3(0, this.height, 0);
    this.rotation = 0;
    
    this.playerModel = null;
    this.otherPlayers = {};
    
    this.score = 0;
    this.inventory = [];
    
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Inizializza il giocatore
   */
  init(playerId) {
    this.id = playerId;
    
    // Imposta la posizione iniziale della camera
    this.camera.position.set(0, this.height, 0);
    
    // Crea i controlli in prima persona
    this.controls = new THREE.PointerLockControls(this.camera, document.body);
    
    // Aggiungi il listener per il blocco del puntatore
    document.getElementById('start-button').addEventListener('click', () => {
      this.controls.lock();
    });
    
    document.getElementById('play-again-button').addEventListener('click', () => {
      this.controls.lock();
    });
    
    // Gestisci eventi di blocco/sblocco
    this.controls.addEventListener('lock', () => {
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('game-ui').classList.remove('hidden');
      document.getElementById('game-over').classList.add('hidden');
    });
    
    this.controls.addEventListener('unlock', () => {
      if (!document.getElementById('game-over').classList.contains('hidden')) {
        return;
      }
      document.getElementById('start-screen').classList.remove('hidden');
      document.getElementById('game-ui').classList.add('hidden');
    });
    
    // Aggiungi i controlli alla scena
    this.scene.add(this.controls.getObject());
    
    // Imposta gli event listener per i controlli da tastiera
    this.setupKeyboardControls();
    
    // Crea il modello del giocatore (visibile solo agli altri)
    this.createPlayerModel();
  }

  /**
   * Configura i controlli da tastiera
   */
  setupKeyboardControls() {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'Space':
          if (this.canJump) {
            this.velocity.y = this.jumpForce;
            this.canJump = false;
            this.isJumping = true;
          }
          break;
      }
    };
    
    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  /**
   * Crea il modello del giocatore (visibile solo agli altri)
   */
  createPlayerModel() {
    // Crea un modello semplice per il giocatore (stile Minecraft)
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.MeshLambertMaterial({ color: 0xFFCC99 })
    );
    head.position.y = 1.4;
    head.castShadow = true;
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.2, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x3333FF })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    
    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0xFFCC99 })
    );
    leftArm.position.set(-0.4, 0.6, 0);
    leftArm.castShadow = true;
    
    const rightArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0xFFCC99 })
    );
    rightArm.position.set(0.4, 0.6, 0);
    rightArm.castShadow = true;
    
    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    leftLeg.position.set(-0.2, -0.5, 0);
    leftLeg.castShadow = true;
    
    const rightLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    rightLeg.position.set(0.2, -0.5, 0);
    rightLeg.castShadow = true;
    
    // Raggruppa tutte le parti
    this.playerModel = new THREE.Group();
    this.playerModel.add(head);
    this.playerModel.add(body);
    this.playerModel.add(leftArm);
    this.playerModel.add(rightArm);
    this.playerModel.add(leftLeg);
    this.playerModel.add(rightLeg);
    
    // Nascondi il modello del giocatore locale
    this.playerModel.visible = false;
    
    this.scene.add(this.playerModel);
  }

  /**
   * Aggiorna la posizione e la rotazione del giocatore
   */
  update(deltaTime) {
    if (!this.controls.isLocked) return;
    
    // Applica la gravità
    this.velocity.y -= gameConfig.world.gravity * deltaTime;
    
    // Calcola la direzione di movimento
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();
    
    // Muovi il giocatore
    if (this.moveForward || this.moveBackward) {
      this.velocity.z = this.direction.z * this.speed;
    } else {
      this.velocity.z = 0;
    }
    
    if (this.moveLeft || this.moveRight) {
      this.velocity.x = this.direction.x * this.speed;
    } else {
      this.velocity.x = 0;
    }
    
    // Applica il movimento
    this.controls.moveRight(this.velocity.x * deltaTime);
    this.controls.moveForward(this.velocity.z * deltaTime);
    
    // Aggiorna la posizione verticale
    this.controls.getObject().position.y += this.velocity.y * deltaTime;
    
    // Controlla le collisioni con il terreno
    const playerPos = this.controls.getObject().position.clone();
    const terrainHeight = this.world.getTerrainHeight(playerPos.x, playerPos.z);
    
    if (playerPos.y < terrainHeight + this.height) {
      this.controls.getObject().position.y = terrainHeight + this.height;
      this.velocity.y = 0;
      this.canJump = true;
      this.isJumping = false;
    }
    
    // Aggiorna la posizione del modello del giocatore
    this.position.copy(this.controls.getObject().position);
    this.rotation = this.controls.getObject().rotation.y;
    
    // Controlla la raccolta dei tesori
    this.checkTreasureCollection();
    
    // Invia la posizione aggiornata al server
    this.sendPositionUpdate();
  }

  /**
   * Controlla se il giocatore è vicino a un tesoro
   */
  checkTreasureCollection() {
    const playerPos = this.controls.getObject().position.clone();
    
    // Crea un raggio dalla posizione del giocatore verso il basso
    this.raycaster.set(playerPos, new THREE.Vector3(0, -1, 0));
    
    // Controlla le intersezioni con i tesori
    const treasures = this.scene.children.filter(obj => obj.userData.isTreasure && !obj.userData.collected);
    const intersects = this.raycaster.intersectObjects(treasures);
    
    if (intersects.length > 0) {
      const treasure = intersects[0].object;
      const distance = intersects[0].distance;
      
      // Se il giocatore è abbastanza vicino, raccogli il tesoro
      if (distance < gameConfig.player.interactionDistance) {
        this.collectTreasure(treasure.userData.id);
      }
    }
  }

  /**
   * Raccoglie un tesoro
   */
  collectTreasure(treasureId) {
    // Invia al server l'informazione che il tesoro è stato raccolto
    socket.emit('collectTreasure', treasureId);
  }

  /**
   * Invia la posizione aggiornata al server
   */
  sendPositionUpdate() {
    socket.emit('updatePosition', {
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      rotation: this.rotation
    });
  }

  /**
   * Aggiorna il punteggio del giocatore
   */
  updateScore(newScore) {
    this.score = newScore;
    document.getElementById('player-score').textContent = newScore;
  }

  /**
   * Aggiunge un altro giocatore alla scena
   */
  addOtherPlayer(playerData) {
    if (playerData.id === this.id) return;
    
    // Clona il modello del giocatore
    const playerModel = this.playerModel.clone();
    playerModel.visible = true;
    
    // Imposta la posizione iniziale
    playerModel.position.set(
      playerData.position.x,
      playerData.position.y,
      playerData.position.z
    );
    
    playerModel.rotation.y = playerData.rotation || 0;
    
    // Aggiungi alla scena
    this.scene.add(playerModel);
    
    // Salva il riferimento
    this.otherPlayers[playerData.id] = {
      model: playerModel,
      data: playerData
    };
    
    // Aggiorna il contatore dei giocatori
    this.updatePlayerCount();
  }

  /**
   * Aggiorna la posizione di un altro giocatore
   */
  updateOtherPlayer(playerData) {
    if (playerData.id === this.id || !this.otherPlayers[playerData.id]) return;
    
    const player = this.otherPlayers[playerData.id];
    
    // Aggiorna la posizione
    player.model.position.set(
      playerData.position.x,
      playerData.position.y,
      playerData.position.z
    );
    
    // Aggiorna la rotazione
    player.model.rotation.y = playerData.rotation || 0;
    
    // Aggiorna i dati
    player.data = { ...player.data, ...playerData };
  }

  /**
   * Rimuove un altro giocatore dalla scena
   */
  removeOtherPlayer(playerId) {
    if (!this.otherPlayers[playerId]) return;
    
    // Rimuovi il modello dalla scena
    this.scene.remove(this.otherPlayers[playerId].model);
    
    // Rimuovi il riferimento
    delete this.otherPlayers[playerId];
    
    // Aggiorna il contatore dei giocatori
    this.updatePlayerCount();
  }

  /**
   * Aggiorna il contatore dei giocatori
   */
  updatePlayerCount() {
    const count = Object.keys(this.otherPlayers).length + 1; // +1 per il giocatore locale
    document.getElementById('player-count').textContent = count;
  }
} 