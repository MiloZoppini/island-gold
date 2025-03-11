class Map {
    constructor(scene, terrainGenerator) {
        this.scene = scene;
        this.terrainGenerator = terrainGenerator;
        this.size = 1000;
        this.resolution = 1;
        this.heightmap = null;
        this.terrain = null;
        this.spawnPoints = [];
        this.treasureSpots = [];
        
        // Usa Set invece di Map per gli oggetti
        this._objects = new Set();
    }

    async initialize() {
        console.log('Inizializzazione della mappa...');
        try {
            await this.generate();
            console.log('Mappa inizializzata con successo');
        } catch (error) {
            console.error('Errore durante l\'inizializzazione della mappa:', error);
            throw error;
        }
    }

    async generate() {
        console.log('Generazione della mappa...');
        try {
            // Genera il terreno
            await this.generateTerrain();
            
            // Genera i punti di spawn
            this.generateSpawnPoints();
            
            // Genera i punti per i tesori
            this.generateTreasureSpots();
            
            // Aggiungi dettagli al terreno
            await this.addTerrainDetails();
            
            console.log('Generazione della mappa completata');
        } catch (error) {
            console.error('Errore durante la generazione della mappa:', error);
            throw error;
        }
    }

    async generateTerrain() {
        console.log('Generazione del terreno...');
        try {
            // Genera l'heightmap usando il generatore di terreno
            const heightmapData = await this.terrainGenerator.generateHeightmap(
                this.size,
                this.size,
                this.resolution
            );
            
            // Converti l'heightmap in un array 2D se non lo è già
            this.heightmap = Array.isArray(heightmapData) ? heightmapData : 
                Array.from({ length: this.size }, (_, i) => 
                    Array.from({ length: this.size }, (_, j) => 
                        heightmapData[i * this.size + j]
                    )
                );

            // Crea la geometria del terreno
            const geometry = new window.THREE.PlaneGeometry(
                this.size,
                this.size,
                this.size / this.resolution,
                this.size / this.resolution
            );

            // Applica l'heightmap alla geometria
            const vertices = geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = Math.floor((i / 3) % (this.size / this.resolution));
                const z = Math.floor((i / 3) / (this.size / this.resolution));
                vertices[i + 1] = this.heightmap[z][x] * 100; // Scala l'altezza
            }

            // Aggiorna le normali
            geometry.computeVertexNormals();

            // Crea il materiale del terreno
            const material = new window.THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.8,
                metalness: 0.2
            });

            // Applica i colori in base all'altezza e alla pendenza
            const colors = new Float32Array(vertices.length);
            for (let i = 0; i < vertices.length; i += 3) {
                const height = vertices[i + 1];
                const slope = this.calculateSlope(vertices, i);
                const color = this.getTerrainColor(height, slope);
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }

            geometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3));

            // Crea la mesh del terreno
            this.terrain = new window.THREE.Mesh(geometry, material);
            this.terrain.rotation.x = -Math.PI / 2;
            this.terrain.receiveShadow = true;
            this.terrain.castShadow = true;

            // Aggiungi il terreno alla scena
            this.scene.add(this.terrain);
            
            console.log('Generazione del terreno completata');
        } catch (error) {
            console.error('Errore durante la generazione del terreno:', error);
            throw error;
        }
    }

    calculateSlope(vertices, index) {
        const width = this.size / this.resolution;
        const x = Math.floor((index / 3) % width);
        const z = Math.floor((index / 3) / width);
        
        if (x === 0 || x === width - 1 || z === 0 || z === width - 1) {
            return 0;
        }

        const height = vertices[index + 1];
        const heightLeft = vertices[index - 3 + 1];
        const heightRight = vertices[index + 3 + 1];
        const heightUp = vertices[index - (width * 3) + 1];
        const heightDown = vertices[index + (width * 3) + 1];

        const slopeX = Math.abs(heightRight - heightLeft) / (2 * this.resolution);
        const slopeZ = Math.abs(heightDown - heightUp) / (2 * this.resolution);

        return Math.sqrt(slopeX * slopeX + slopeZ * slopeZ);
    }

    getTerrainColor(height, slope) {
        // Colori base per i diversi tipi di terreno
        const waterColor = new window.THREE.Color(0x1E4D6B);
        const sandColor = new window.THREE.Color(0xC2B280);
        const grassColor = new window.THREE.Color(0x567D46);
        const rockColor = new window.THREE.Color(0x8B7355);
        const snowColor = new window.THREE.Color(0xFFFFFF);

        // Soglie di altezza
        const waterLevel = 0;
        const sandLevel = 5;
        const grassLevel = 20;
        const rockLevel = 50;
        const snowLevel = 80;

        // Determina il colore base in base all'altezza
        let color = new window.THREE.Color();
        if (height < waterLevel) {
            return waterColor;
        } else if (height < sandLevel) {
            color.lerpColors(sandColor, grassColor, (height - waterLevel) / (sandLevel - waterLevel));
        } else if (height < grassLevel) {
            color.lerpColors(grassColor, rockColor, (height - sandLevel) / (grassLevel - sandLevel));
        } else if (height < rockLevel) {
            color.lerpColors(rockColor, snowColor, (height - grassLevel) / (rockLevel - grassLevel));
        } else {
            return snowColor;
        }

        // Modifica il colore in base alla pendenza
        const slopeColor = new window.THREE.Color(0x808080);
        const maxSlope = 1.0;
        const slopeFactor = Math.min(slope / maxSlope, 1.0);
        color.lerp(slopeColor, slopeFactor * 0.5);

        // Aggiungi una leggera variazione casuale
        const variation = 0.1;
        color.r += (Math.random() - 0.5) * variation;
        color.g += (Math.random() - 0.5) * variation;
        color.b += (Math.random() - 0.5) * variation;

        return color;
    }

    getHeightAt(x, z) {
        // Converte le coordinate del mondo in indici dell'heightmap
        const halfSize = this.size / 2;
        const mapX = Math.floor((x + halfSize) / this.resolution);
        const mapZ = Math.floor((z + halfSize) / this.resolution);
        
        // Verifica che le coordinate siano all'interno dei limiti
        if (mapX < 0 || mapX >= this.size || mapZ < 0 || mapZ >= this.size) {
            return 0;
        }
        
        return this.heightmap[mapZ][mapX] * 100;
    }

    generateSpawnPoints() {
        console.log('Generazione dei punti di spawn...');
        // Trova punti adatti per lo spawn dei giocatori
        const numPoints = 10;
        const minDistance = 50;
        const minHeight = 5;
        const maxHeight = 30;

        this.spawnPoints = [];

        for (let i = 0; i < numPoints; i++) {
            let point = null;
            let attempts = 0;
            const maxAttempts = 100;

            while (!point && attempts < maxAttempts) {
                const x = Math.random() * this.size - this.size / 2;
                const z = Math.random() * this.size - this.size / 2;
                const height = this.getHeightAt(x, z);

                if (height >= minHeight && height <= maxHeight) {
                    // Verifica la distanza dagli altri punti di spawn
                    let isTooClose = false;
                    for (const existingPoint of this.spawnPoints) {
                        const distance = new window.THREE.Vector2(x - existingPoint.x, z - existingPoint.z).length();
                        if (distance < minDistance) {
                            isTooClose = true;
                            break;
                        }
                    }

                    if (!isTooClose) {
                        point = new window.THREE.Vector3(x, height, z);
                        this.spawnPoints.push(point);
                    }
                }

                attempts++;
            }
        }
        
        console.log(`Generati ${this.spawnPoints.length} punti di spawn`);
    }

    generateTreasureSpots() {
        console.log('Generazione dei punti per i tesori...');
        // Genera punti per il posizionamento dei tesori
        const numSpots = 20;
        const minDistance = 30;

        this.treasureSpots = [];

        for (let i = 0; i < numSpots; i++) {
            let spot = null;
            let attempts = 0;
            const maxAttempts = 100;

            while (!spot && attempts < maxAttempts) {
                const x = Math.random() * this.size - this.size / 2;
                const z = Math.random() * this.size - this.size / 2;
                const height = this.getHeightAt(x, z);

                // Verifica che il punto non sia sott'acqua e non troppo in alto
                if (height > 0 && height < 60) {
                    // Verifica la distanza dagli altri punti
                    let isTooClose = false;
                    for (const existingSpot of this.treasureSpots) {
                        const distance = new window.THREE.Vector2(x - existingSpot.x, z - existingSpot.z).length();
                        if (distance < minDistance) {
                            isTooClose = true;
                            break;
                        }
                    }

                    if (!isTooClose) {
                        spot = new window.THREE.Vector3(x, height, z);
                        this.treasureSpots.push(spot);
                    }
                }

                attempts++;
            }
        }
        
        console.log(`Generati ${this.treasureSpots.length} punti per i tesori`);
    }

    async addTerrainDetails() {
        console.log('Aggiunta dei dettagli al terreno...');
        try {
            // Aggiungi vegetazione
            await this.addVegetation();
            
            // Aggiungi rocce
            await this.addRocks();
            
            console.log('Dettagli del terreno aggiunti con successo');
        } catch (error) {
            console.error('Errore durante l\'aggiunta dei dettagli al terreno:', error);
            throw error;
        }
    }

    async addVegetation() {
        console.log('Aggiunta della vegetazione...');
        try {
            // Carica i modelli degli alberi
            const loader = new window.THREE.GLTFLoader();
            const treeModels = await Promise.all([
                loader.loadAsync('models/tree1.glb'),
                loader.loadAsync('models/tree2.glb'),
                loader.loadAsync('models/tree3.glb')
            ]);

            // Parametri per la distribuzione degli alberi
            const numTrees = 1000;
            const minDistance = 5;
            const maxSlope = 0.5;

            for (let i = 0; i < numTrees; i++) {
                const x = Math.random() * this.size - this.size / 2;
                const z = Math.random() * this.size - this.size / 2;
                const height = this.getHeightAt(x, z);
                const slope = this.calculateSlopeAt(x, z);

                if (height > 0 && height < 60 && slope < maxSlope) {
                    const treeModel = treeModels[Math.floor(Math.random() * treeModels.length)].scene.clone();
                    treeModel.position.set(x, height, z);
                    treeModel.rotation.y = Math.random() * Math.PI * 2;
                    const scale = 0.8 + Math.random() * 0.4;
                    treeModel.scale.set(scale, scale, scale);
                    this.scene.add(treeModel);
                }
            }
            
            console.log('Vegetazione aggiunta con successo');
        } catch (error) {
            console.error('Errore durante l\'aggiunta della vegetazione:', error);
            throw error;
        }
    }

    async addRocks() {
        console.log('Aggiunta delle rocce...');
        try {
            // Carica i modelli delle rocce
            const loader = new window.THREE.GLTFLoader();
            const rockModels = await Promise.all([
                loader.loadAsync('models/rock1.glb'),
                loader.loadAsync('models/rock2.glb'),
                loader.loadAsync('models/rock3.glb')
            ]);

            // Parametri per la distribuzione delle rocce
            const numRocks = 500;
            const minDistance = 10;

            for (let i = 0; i < numRocks; i++) {
                const x = Math.random() * this.size - this.size / 2;
                const z = Math.random() * this.size - this.size / 2;
                const height = this.getHeightAt(x, z);
                const slope = this.calculateSlopeAt(x, z);

                if (height > 0 && slope > 0.3) {
                    const rockModel = rockModels[Math.floor(Math.random() * rockModels.length)].scene.clone();
                    rockModel.position.set(x, height, z);
                    rockModel.rotation.y = Math.random() * Math.PI * 2;
                    const scale = 0.5 + Math.random() * 0.5;
                    rockModel.scale.set(scale, scale, scale);
                    this.scene.add(rockModel);
                }
            }
            
            console.log('Rocce aggiunte con successo');
        } catch (error) {
            console.error('Errore durante l\'aggiunta delle rocce:', error);
            throw error;
        }
    }

    calculateSlopeAt(x, z) {
        const halfSize = this.size / 2;
        const mapX = Math.floor((x + halfSize) / this.resolution);
        const mapZ = Math.floor((z + halfSize) / this.resolution);
        
        if (mapX <= 0 || mapX >= this.size - 1 || mapZ <= 0 || mapZ >= this.size - 1) {
            return 0;
        }

        const height = this.heightmap[mapZ][mapX];
        const heightLeft = this.heightmap[mapZ][mapX - 1];
        const heightRight = this.heightmap[mapZ][mapX + 1];
        const heightUp = this.heightmap[mapZ - 1][mapX];
        const heightDown = this.heightmap[mapZ + 1][mapX];

        const slopeX = Math.abs(heightRight - heightLeft) / (2 * this.resolution);
        const slopeZ = Math.abs(heightDown - heightUp) / (2 * this.resolution);

        return Math.sqrt(slopeX * slopeX + slopeZ * slopeZ);
    }

    dispose() {
        // Rimuovi il terreno
        if (this.terrain) {
            this.scene.remove(this.terrain);
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
        }

        // Resetta le liste
        this.spawnPoints = [];
        this.treasureSpots = [];
        this.heightmap = null;
    }
}

// Esponi la classe globalmente
window.Map = Map; 