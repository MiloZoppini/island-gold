/**
 * Gestione del mondo di gioco
 * Questo file si occupa di creare e gestire l'ambiente 3D
 */

class GameWorld {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.water = null;
    this.terrain = null;
    this.lighting = null;
    this.weather = null;
    this.objects = [];
    this.terrainMesh = null;
    this.skybox = null;
    this.lights = {
      ambient: null,
      directional: null,
      hemispheric: null
    };
    this.waterNormals = null;
    this.terrainGenerator = new TerrainGenerator();
    this.terrainTypes = {
      sabbia: { color: 0xE0C9A6, roughness: 0.8, metalness: 0.1 },
      erba: { color: 0x3a9d23, roughness: 0.9, metalness: 0.0 },
      roccia: { color: 0x888888, roughness: 0.7, metalness: 0.2 },
      neve: { color: 0xFFFFFF, roughness: 0.6, metalness: 0.1 }
    };
  }

  /**
   * Inizializza il mondo di gioco
   */
  init() {
    // Inizializza il renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Inizializza la camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 30, 100);
    this.camera.lookAt(0, 0, 0);

    // Inizializza i sistemi
    this.lighting = new Lighting(this.scene);
    this.lighting.init();

    this.weather = new Weather(this.scene);
    this.weather.init();

    // Crea il terreno
    this.createTerrain();

    // Crea l'acqua
    this.createWater();

    // Gestisci il ridimensionamento della finestra
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  /**
   * Carica le texture necessarie
   */
  loadTextures() {
    // Carica la texture per le normali dell'acqua
    const textureLoader = new THREE.TextureLoader();
    this.waterNormals = textureLoader.load('assets/textures/waternormals.jpg');
    this.waterNormals.wrapS = this.waterNormals.wrapT = THREE.RepeatWrapping;
  }

  /**
   * Crea lo skybox
   */
  createSkybox() {
    // Crea una semplice sfera per il cielo
    const skyGeometry = new THREE.SphereGeometry(gameConfig.world.size.width / 2, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: gameConfig.world.skyColor,
      side: THREE.BackSide
    });
    
    this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skybox);
  }

  /**
   * Crea le luci della scena
   */
  createLights() {
    // Luce ambientale
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.lights.ambient);
    
    // Luce direzionale (sole)
    this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
    this.lights.directional.position.set(100, 200, 100);
    this.lights.directional.castShadow = true;
    
    // Configura le ombre
    const shadowSize = gameConfig.world.size.width / 2;
    this.lights.directional.shadow.camera.left = -shadowSize;
    this.lights.directional.shadow.camera.right = shadowSize;
    this.lights.directional.shadow.camera.top = shadowSize;
    this.lights.directional.shadow.camera.bottom = -shadowSize;
    this.lights.directional.shadow.camera.near = 1;
    this.lights.directional.shadow.camera.far = 500;
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;
    
    this.scene.add(this.lights.directional);
    
    // Luce emisferica per illuminare meglio il terreno
    this.lights.hemispheric = new THREE.HemisphereLight(0x87CEEB, 0x3a9d23, 0.6);
    this.scene.add(this.lights.hemispheric);
  }

  /**
   * Crea il terreno dell'isola
   */
  createTerrain() {
    const { width, depth } = gameConfig.world.size;
    
    // Crea una geometria per il terreno
    const geometry = new THREE.PlaneGeometry(width, depth, 128, 128);
    
    // Ruota il piano per renderlo orizzontale
    geometry.rotateX(-Math.PI / 2);
    
    // Opzioni per la generazione del terreno
    const terrainOptions = {
      scale: 0.003,
      amplitude: 40,
      octaves: 6,
      persistence: 0.5,
      lacunarity: 2.0,
      heightOffset: 0,
      islandFactor: 0.2
    };
    
    // Applica una deformazione per creare colline e valli
    const vertices = geometry.attributes.position.array;
    const colors = new Float32Array(vertices.length);
    
    // Crea un array per memorizzare i tipi di terreno
    const terrainTypeData = new Array(vertices.length / 3);
    
    for (let i = 0; i < vertices.length; i += 3) {
      // Ottieni le coordinate
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Calcola la distanza dal centro
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const maxDistance = Math.min(width, depth) / 2;
      
      // Genera l'altezza del terreno
      let height;
      
      if (distanceFromCenter < maxDistance * 0.9) {
        // Area dell'isola
        height = this.terrainGenerator.getHeight(x, z, terrainOptions);
      } else {
        // Spiaggia e acqua
        const beachFactor = Math.min(1.0, (distanceFromCenter - maxDistance * 0.9) / (maxDistance * 0.1));
        height = this.terrainGenerator.getHeight(x, z, terrainOptions) * (1 - beachFactor) - beachFactor * 2;
      }
      
      // Imposta l'altezza del vertice
      vertices[i + 1] = height;
      
      // Calcola la pendenza
      const slope = this.terrainGenerator.getSlope(x, z, terrainOptions);
      
      // Determina il tipo di terreno
      const terrainType = this.terrainGenerator.getTerrainType(height, slope);
      terrainTypeData[i / 3] = terrainType;
      
      // Imposta il colore in base al tipo di terreno
      const color = new THREE.Color(this.terrainTypes[terrainType].color);
      const colorIndex = i / 3 * 3;
      colors[colorIndex] = color.r;
      colors[colorIndex + 1] = color.g;
      colors[colorIndex + 2] = color.b;
      
      // Aggiungi variazione casuale al colore
      const variation = 0.1;
      colors[colorIndex] += (Math.random() - 0.5) * variation;
      colors[colorIndex + 1] += (Math.random() - 0.5) * variation;
      colors[colorIndex + 2] += (Math.random() - 0.5) * variation;
    }
    
    // Aggiorna la geometria
    geometry.computeVertexNormals();
    
    // Aggiungi i colori alla geometria
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Crea un materiale per il terreno
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Crea la mesh del terreno
    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.name = 'terrain';
    this.terrainMesh.userData.terrainTypeData = terrainTypeData;
    
    this.scene.add(this.terrainMesh);
    this.objects.push(this.terrainMesh);
  }

  /**
   * Genera l'altezza del terreno in base alla posizione
   */
  generateHeight(x, z) {
    return this.terrainGenerator.getHeight(x, z, {
      scale: 0.003,
      amplitude: 40,
      octaves: 6,
      persistence: 0.5,
      lacunarity: 2.0,
      heightOffset: 0,
      islandFactor: 0.2
    });
  }

  /**
   * Crea oggetti ambientali come alberi, rocce, ecc.
   */
  createEnvironmentObjects() {
    const { width, depth } = gameConfig.world.size;
    
    // Crea alcune rocce
    this.createRocks(80);
    
    // Crea alcuni alberi
    this.createTrees(60);
    
    // Crea acqua intorno all'isola
    this.createWater(width, depth);
  }

  /**
   * Crea rocce sparse sull'isola
   */
  createRocks(count) {
    const { width, depth } = gameConfig.world.size;
    
    // Tipi di rocce
    const rockTypes = [
      { geometry: new THREE.DodecahedronGeometry(1, 0), scale: [1.5, 2.5, 1.5] },
      { geometry: new THREE.IcosahedronGeometry(1, 0), scale: [2, 1.5, 2] },
      { geometry: new THREE.TetrahedronGeometry(1, 0), scale: [2.5, 3, 2.5] }
    ];
    
    for (let i = 0; i < count; i++) {
      // Posizione casuale sull'isola
      const x = (Math.random() - 0.5) * width * 0.8;
      const z = (Math.random() - 0.5) * depth * 0.8;
      
      // Trova l'altezza del terreno in questo punto
      const y = this.getTerrainHeight(x, z);
      
      // Salta se l'altezza è troppo bassa (acqua o spiaggia)
      if (y < 1) continue;
      
      // Scegli un tipo di roccia casuale
      const rockType = rockTypes[Math.floor(Math.random() * rockTypes.length)];
      
      // Crea una roccia con forma irregolare
      const rockGeometry = rockType.geometry.clone();
      
      // Scala casuale
      const baseScale = 1 + Math.random() * 2;
      const scaleX = baseScale * rockType.scale[0];
      const scaleY = baseScale * rockType.scale[1];
      const scaleZ = baseScale * rockType.scale[2];
      
      // Deforma leggermente la geometria per renderla più naturale
      const vertices = rockGeometry.attributes.position.array;
      for (let j = 0; j < vertices.length; j += 3) {
        vertices[j] = vertices[j] * scaleX + (Math.random() - 0.5) * 0.5;
        vertices[j + 1] = vertices[j + 1] * scaleY + (Math.random() - 0.5) * 0.5;
        vertices[j + 2] = vertices[j + 2] * scaleZ + (Math.random() - 0.5) * 0.5;
      }
      
      rockGeometry.computeVertexNormals();
      
      // Materiale della roccia
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
      });
      
      // Aggiungi variazione al colore
      const colorVariation = 0.2;
      const baseColor = new THREE.Color(0x888888);
      baseColor.r += (Math.random() - 0.5) * colorVariation;
      baseColor.g += (Math.random() - 0.5) * colorVariation;
      baseColor.b += (Math.random() - 0.5) * colorVariation;
      rockMaterial.color = baseColor;
      
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, y, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      rock.name = `rock-${i}`;
      
      this.scene.add(rock);
      this.objects.push(rock);
    }
  }

  /**
   * Crea alberi sull'isola
   */
  createTrees(count) {
    const { width, depth } = gameConfig.world.size;
    
    // Tipi di alberi
    const treeTypes = [
      {
        // Pino
        trunk: { geometry: new THREE.CylinderGeometry(0.5, 0.7, 5, 8), color: 0x8B4513, y: 2.5 },
        leaves: { geometry: new THREE.ConeGeometry(3, 6, 8), color: 0x2E8B57, y: 5.5 }
      },
      {
        // Quercia
        trunk: { geometry: new THREE.CylinderGeometry(0.7, 1, 4, 8), color: 0x8B4513, y: 2 },
        leaves: { geometry: new THREE.SphereGeometry(3, 8, 8), color: 0x3a9d23, y: 5 }
      },
      {
        // Palma
        trunk: { geometry: new THREE.CylinderGeometry(0.4, 0.6, 7, 8), color: 0xA0522D, y: 3.5 },
        leaves: { 
          geometry: new THREE.BufferGeometry(),
          color: 0x3a9d23,
          y: 7,
          custom: true
        }
      }
    ];
    
    for (let i = 0; i < count; i++) {
      // Posizione casuale sull'isola
      const x = (Math.random() - 0.5) * width * 0.7;
      const z = (Math.random() - 0.5) * depth * 0.7;
      
      // Trova l'altezza del terreno in questo punto
      const y = this.getTerrainHeight(x, z);
      
      // Salta se l'altezza è troppo bassa (acqua o spiaggia) o troppo alta (montagne)
      if (y < 1 || y > 20) continue;
      
      // Scegli un tipo di albero in base all'altezza
      let treeTypeIndex;
      if (y < 5) {
        // Palme vicino alla spiaggia
        treeTypeIndex = 2;
      } else if (y < 10) {
        // Querce a media altezza
        treeTypeIndex = 1;
      } else {
        // Pini in montagna
        treeTypeIndex = 0;
      }
      
      const treeType = treeTypes[treeTypeIndex];
      
      // Crea un gruppo per l'albero
      const tree = new THREE.Group();
      tree.position.set(x, y, z);
      
      // Aggiungi una leggera rotazione casuale
      tree.rotation.y = Math.random() * Math.PI * 2;
      
      // Crea il tronco
      const trunkGeometry = treeType.trunk.geometry.clone();
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: treeType.trunk.color,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = treeType.trunk.y;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      
      tree.add(trunk);
      
      // Crea le foglie
      if (treeType.leaves.custom) {
        // Crea foglie personalizzate per la palma
        const leafCount = 8;
        const leafGroup = new THREE.Group();
        leafGroup.position.y = treeType.leaves.y;
        
        for (let j = 0; j < leafCount; j++) {
          const angle = (j / leafCount) * Math.PI * 2;
          const leafLength = 3 + Math.random();
          
          const leafGeometry = new THREE.PlaneGeometry(leafLength, 0.5, 4, 1);
          const leafMaterial = new THREE.MeshStandardMaterial({
            color: treeType.leaves.color,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
          
          // Deforma la geometria per creare una foglia curva
          const vertices = leafGeometry.attributes.position.array;
          for (let k = 0; k < vertices.length; k += 3) {
            const x = vertices[k];
            // Curva la foglia verso il basso
            vertices[k + 1] = Math.pow(x / leafLength, 2) * -1;
          }
          
          leafGeometry.computeVertexNormals();
          
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          leaf.rotation.set(
            Math.random() * 0.2 - 0.1,
            angle,
            Math.PI / 4 + Math.random() * 0.2 - 0.1
          );
          leaf.castShadow = true;
          
          leafGroup.add(leaf);
        }
        
        tree.add(leafGroup);
      } else {
        // Crea foglie standard
        const leavesGeometry = treeType.leaves.geometry.clone();
        const leavesMaterial = new THREE.MeshStandardMaterial({
          color: treeType.leaves.color,
          roughness: 0.8,
          metalness: 0.1
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = treeType.leaves.y;
        leaves.castShadow = true;
        
        tree.add(leaves);
      }
      
      tree.name = `tree-${i}`;
      
      this.scene.add(tree);
      this.objects.push(tree);
    }
  }

  /**
   * Crea l'acqua intorno all'isola
   */
  createWater(width, depth) {
    // Crea un piano più grande del terreno per l'acqua
    const waterGeometry = new THREE.PlaneGeometry(width * 1.5, depth * 1.5, 32, 32);
    
    // Crea l'acqua con effetti avanzati
    this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: this.waterNormals,
        alpha: 0.8,
        sunDirection: this.lights.directional.position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x0077be,
        distortionScale: 3.7,
        fog: this.scene.fog !== undefined
      }
    );
    
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = -1; // Leggermente sotto il livello del terreno
    this.water.name = 'water';
    
    this.scene.add(this.water);
  }

  /**
   * Ottiene l'altezza del terreno in un punto specifico
   */
  getTerrainHeight(x, z) {
    return this.generateHeight(x, z);
  }

  /**
   * Aggiorna il mondo di gioco
   */
  update(delta, dayProgress) {
    // Aggiorna il sistema di illuminazione
    this.lighting.update(dayProgress);

    // Aggiorna gli effetti atmosferici
    this.weather.update(delta, dayProgress);

    // Aggiorna l'acqua
    if (this.water) {
      this.water.material.uniforms['time'].value += delta;
    }

    // Renderizza la scena
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
} 