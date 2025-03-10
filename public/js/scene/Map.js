class Map {
    constructor(scene, terrainGenerator) {
        this.scene = scene;
        this.terrainGenerator = terrainGenerator;
        this.size = 1000;
        this.resolution = 1;
        this.heightmap = null;
        this.terrain = null;
        this.objects = new Map();
        this.spawnPoints = [];
        this.treasureSpots = [];
    }

    async generate() {
        // Genera il terreno
        await this.generateTerrain();
        
        // Genera i punti di spawn
        this.generateSpawnPoints();
        
        // Genera i punti per i tesori
        this.generateTreasureSpots();
        
        // Aggiungi dettagli al terreno
        await this.addTerrainDetails();
    }

    async generateTerrain() {
        // Genera l'heightmap usando il generatore di terreno
        this.heightmap = this.terrainGenerator.generateHeightmap(
            this.size,
            this.size,
            this.resolution
        );

        // Crea la geometria del terreno
        const geometry = new THREE.PlaneGeometry(
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
        const material = new THREE.MeshStandardMaterial({
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

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Crea la mesh del terreno
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.castShadow = true;

        // Aggiungi il terreno alla scena
        this.scene.add(this.terrain);
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
        const waterColor = new THREE.Color(0x1E4D6B);
        const sandColor = new THREE.Color(0xC2B280);
        const grassColor = new THREE.Color(0x567D46);
        const rockColor = new THREE.Color(0x8B7355);
        const snowColor = new THREE.Color(0xFFFFFF);

        // Soglie di altezza
        const waterLevel = 0;
        const sandLevel = 5;
        const grassLevel = 20;
        const rockLevel = 50;
        const snowLevel = 80;

        // Determina il colore base in base all'altezza
        let color = new THREE.Color();
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
        const slopeColor = new THREE.Color(0x808080);
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

    generateSpawnPoints() {
        // Trova punti adatti per lo spawn dei giocatori
        const numPoints = 10;
        const minDistance = 50;
        const minHeight = 5;
        const maxHeight = 30;

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
                        const distance = new THREE.Vector2(x - existingPoint.x, z - existingPoint.z).length();
                        if (distance < minDistance) {
                            isTooClose = true;
                            break;
                        }
                    }

                    if (!isTooClose) {
                        point = new THREE.Vector3(x, height, z);
                        this.spawnPoints.push(point);
                    }
                }

                attempts++;
            }
        }
    }

    generateTreasureSpots() {
        // Genera punti per il posizionamento dei tesori
        const numSpots = 20;
        const minDistance = 30;

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
                        const distance = new THREE.Vector2(x - existingSpot.x, z - existingSpot.z).length();
                        if (distance < minDistance) {
                            isTooClose = true;
                            break;
                        }
                    }

                    if (!isTooClose) {
                        spot = new THREE.Vector3(x, height, z);
                        this.treasureSpots.push(spot);
                    }
                }

                attempts++;
            }
        }
    }

    async addTerrainDetails() {
        // Aggiungi vegetazione
        await this.addVegetation();
        
        // Aggiungi rocce
        await this.addRocks();
    }

    async addVegetation() {
        // Carica i modelli degli alberi
        const treeLoader = new THREE.GLTFLoader();
        const treeModels = await Promise.all([
            treeLoader.loadAsync('models/tree1.glb'),
            treeLoader.loadAsync('models/tree2.glb'),
            treeLoader.loadAsync('models/tree3.glb')
        ]);

        // Parametri per la distribuzione degli alberi
        const numTrees = 1000;
        const minDistance = 5;
        const maxSlope = 0.5;

        for (let i = 0; i < numTrees; i++) {
            const x = Math.random() * this.size - this.size / 2;
            const z = Math.random() * this.size - this.size / 2;
            const height = this.getHeightAt(x, z);
            const slope = this.getSlopeAt(x, z);

            // Verifica che il punto sia adatto per un albero
            if (height > 5 && height < 50 && slope < maxSlope) {
                // Scegli un modello casuale
                const modelIndex = Math.floor(Math.random() * treeModels.length);
                const tree = treeModels[modelIndex].scene.clone();

                // Posiziona e scala l'albero
                tree.position.set(x, height, z);
                tree.scale.setScalar(0.5 + Math.random() * 0.5);
                tree.rotation.y = Math.random() * Math.PI * 2;

                // Aggiungi l'albero alla scena
                this.scene.add(tree);
                this.objects.set(`tree_${i}`, tree);
            }
        }
    }

    async addRocks() {
        // Carica i modelli delle rocce
        const rockLoader = new THREE.GLTFLoader();
        const rockModels = await Promise.all([
            rockLoader.loadAsync('models/rock1.glb'),
            rockLoader.loadAsync('models/rock2.glb'),
            rockLoader.loadAsync('models/rock3.glb')
        ]);

        // Parametri per la distribuzione delle rocce
        const numRocks = 500;
        const minDistance = 10;

        for (let i = 0; i < numRocks; i++) {
            const x = Math.random() * this.size - this.size / 2;
            const z = Math.random() * this.size - this.size / 2;
            const height = this.getHeightAt(x, z);
            const slope = this.getSlopeAt(x, z);

            // Posiziona più rocce su pendii ripidi
            if (height > 0 && (slope > 0.3 || Math.random() < 0.3)) {
                // Scegli un modello casuale
                const modelIndex = Math.floor(Math.random() * rockModels.length);
                const rock = rockModels[modelIndex].scene.clone();

                // Posiziona e scala la roccia
                rock.position.set(x, height, z);
                rock.scale.setScalar(0.3 + Math.random() * 0.7);
                rock.rotation.y = Math.random() * Math.PI * 2;

                // Inclina leggermente la roccia in base al pendio
                rock.rotation.x = (Math.random() - 0.5) * 0.2;
                rock.rotation.z = (Math.random() - 0.5) * 0.2;

                // Aggiungi la roccia alla scena
                this.scene.add(rock);
                this.objects.set(`rock_${i}`, rock);
            }
        }
    }

    getHeightAt(x, z) {
        // Converte le coordinate mondo in coordinate heightmap
        const mapX = Math.floor((x + this.size / 2) / this.resolution);
        const mapZ = Math.floor((z + this.size / 2) / this.resolution);

        // Verifica che le coordinate siano all'interno della mappa
        if (mapX < 0 || mapX >= this.heightmap[0].length || mapZ < 0 || mapZ >= this.heightmap.length) {
            return 0;
        }

        return this.heightmap[mapZ][mapX] * 100;
    }

    getSlopeAt(x, z) {
        const mapX = Math.floor((x + this.size / 2) / this.resolution);
        const mapZ = Math.floor((z + this.size / 2) / this.resolution);

        if (mapX < 1 || mapX >= this.heightmap[0].length - 1 || mapZ < 1 || mapZ >= this.heightmap.length - 1) {
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

    getRandomSpawnPoint() {
        if (this.spawnPoints.length === 0) return new THREE.Vector3(0, 0, 0);
        return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)].clone();
    }

    getRandomTreasureSpot() {
        if (this.treasureSpots.length === 0) return null;
        const index = Math.floor(Math.random() * this.treasureSpots.length);
        const spot = this.treasureSpots[index];
        this.treasureSpots.splice(index, 1); // Rimuovi il punto usato
        return spot.clone();
    }

    cleanup() {
        // Rimuovi tutti gli oggetti dalla scena
        this.objects.forEach(object => {
            this.scene.remove(object);
        });
        this.objects.clear();

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