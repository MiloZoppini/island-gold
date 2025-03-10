/**
 * Gestione dei tesori
 * Questo file si occupa di creare e gestire i tesori nel gioco
 */

class TreasureManager {
  constructor(scene) {
    this.scene = scene;
    this.treasures = {};
    this.treasureModels = {};
    
    // Precarica i modelli dei tesori
    this.preloadTreasureModels();
  }

  /**
   * Precarica i modelli dei tesori
   */
  preloadTreasureModels() {
    // Per semplicità, usiamo forme geometriche di base
    // In un gioco completo, caricheremmo modelli 3D
    
    // Tesoro piccolo (moneta d'oro)
    const smallTreasureGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const smallTreasureMaterial = new THREE.MeshStandardMaterial({
      color: gameConfig.treasures.types.piccolo.color,
      metalness: 0.8,
      roughness: 0.2
    });
    this.treasureModels.piccolo = new THREE.Mesh(smallTreasureGeometry, smallTreasureMaterial);
    this.treasureModels.piccolo.rotation.x = Math.PI / 2;
    
    // Tesoro medio (lingotto d'oro)
    const mediumTreasureGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.4);
    const mediumTreasureMaterial = new THREE.MeshStandardMaterial({
      color: gameConfig.treasures.types.medio.color,
      metalness: 0.8,
      roughness: 0.2
    });
    this.treasureModels.medio = new THREE.Mesh(mediumTreasureGeometry, mediumTreasureMaterial);
    
    // Tesoro grande (forziere)
    const chestBaseGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.8);
    const chestLidGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const chestMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0.3,
      roughness: 0.8
    });
    const chestGoldMaterial = new THREE.MeshStandardMaterial({
      color: gameConfig.treasures.types.grande.color,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const chestBase = new THREE.Mesh(chestBaseGeometry, chestMaterial);
    const chestLid = new THREE.Mesh(chestLidGeometry, chestMaterial);
    chestLid.position.y = 0.6;
    
    // Aggiungi dettagli dorati al forziere
    const chestDecoration = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.1, 0.1),
      chestGoldMaterial
    );
    chestDecoration.position.set(0, 0, 0.35);
    
    const chest = new THREE.Group();
    chest.add(chestBase);
    chest.add(chestLid);
    chest.add(chestDecoration);
    
    this.treasureModels.grande = chest;
  }

  /**
   * Inizializza i tesori sulla mappa
   */
  initTreasures(treasuresData) {
    // Rimuovi eventuali tesori esistenti
    this.clearTreasures();
    
    // Crea i nuovi tesori
    treasuresData.forEach(treasureData => {
      this.createTreasure(treasureData);
    });
  }

  /**
   * Crea un tesoro sulla mappa
   */
  createTreasure(treasureData) {
    // Salta se il tesoro è già stato raccolto
    if (treasureData.collected) return;
    
    // Clona il modello appropriato
    let treasureModel;
    
    if (treasureData.type === 'piccolo') {
      treasureModel = this.treasureModels.piccolo.clone();
    } else if (treasureData.type === 'medio') {
      treasureModel = this.treasureModels.medio.clone();
    } else {
      treasureModel = this.treasureModels.grande.clone();
    }
    
    // Imposta la posizione
    treasureModel.position.set(
      treasureData.position.x,
      treasureData.position.y,
      treasureData.position.z
    );
    
    // Scala il modello in base al tipo
    const scale = gameConfig.treasures.types[treasureData.type].scale;
    treasureModel.scale.set(scale, scale, scale);
    
    // Aggiungi metadati
    treasureModel.userData = {
      id: treasureData.id,
      type: treasureData.type,
      value: treasureData.value,
      collected: false,
      isTreasure: true,
      originalY: treasureData.position.y
    };
    
    // Aggiungi ombre
    treasureModel.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Aggiungi alla scena
    this.scene.add(treasureModel);
    
    // Salva il riferimento
    this.treasures[treasureData.id] = treasureModel;
    
    return treasureModel;
  }

  /**
   * Rimuove tutti i tesori dalla scena
   */
  clearTreasures() {
    Object.values(this.treasures).forEach(treasure => {
      this.scene.remove(treasure);
    });
    
    this.treasures = {};
  }

  /**
   * Marca un tesoro come raccolto
   */
  collectTreasure(treasureId, playerId) {
    const treasure = this.treasures[treasureId];
    if (!treasure || treasure.userData.collected) return;
    
    // Marca come raccolto
    treasure.userData.collected = true;
    
    // Animazione di raccolta
    this.animateTreasureCollection(treasure, playerId);
  }

  /**
   * Anima la raccolta di un tesoro
   */
  animateTreasureCollection(treasure, playerId) {
    // Animazione semplice: il tesoro si alza e scompare
    const duration = 1; // secondi
    const startTime = Date.now();
    
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Alza il tesoro
      treasure.position.y += 0.1;
      
      // Ruota il tesoro
      treasure.rotation.y += 0.1;
      
      // Riduci l'opacità
      treasure.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (!child.material.originalOpacity) {
            child.material.originalOpacity = child.material.opacity;
          }
          
          child.material.transparent = true;
          child.material.opacity = child.material.originalOpacity * (1 - progress);
        }
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Rimuovi il tesoro dalla scena
        this.scene.remove(treasure);
      }
    };
    
    animate();
  }

  /**
   * Aggiorna i tesori (animazioni, ecc.)
   */
  update(deltaTime) {
    // Aggiorna tutti i tesori non raccolti
    Object.values(this.treasures).forEach(treasure => {
      if (treasure.userData.collected) return;
      
      // Fai fluttuare il tesoro
      const time = Date.now() * 0.001;
      const hoverHeight = gameConfig.treasures.hoverHeight;
      const hoverAmplitude = gameConfig.treasures.hoverAmplitude;
      const hoverSpeed = gameConfig.treasures.hoverSpeed;
      
      treasure.position.y = treasure.userData.originalY + 
                           hoverHeight + 
                           Math.sin(time * hoverSpeed) * hoverAmplitude;
      
      // Fai ruotare il tesoro
      treasure.rotation.y += gameConfig.treasures.rotationSpeed * deltaTime;
    });
  }
} 