class TerrainGenerator {
    constructor() {
        // Crea un nuovo generatore di rumore
        this.noise2D = createNoise2D();
        
        // Parametri per la generazione del terreno
        this.octaves = 6;
        this.persistence = 0.5;
        this.lacunarity = 2.0;
        this.scale = 100.0;
        this.amplitude = 1.0;
    }

    async generateHeightmap(width, height, resolution) {
        console.log('Generazione heightmap...');
        
        try {
            const heightmap = new Array(height);
            for (let z = 0; z < height; z++) {
                heightmap[z] = new Array(width);
                for (let x = 0; x < width; x++) {
                    // Calcola le coordinate nel mondo
                    const worldX = (x - width / 2) * resolution;
                    const worldZ = (z - height / 2) * resolution;
                    
                    // Genera l'altezza usando il rumore di Perlin
                    let amplitude = this.amplitude;
                    let frequency = 1.0;
                    let noiseHeight = 0;
                    let normalization = 0;
                    
                    // Somma diverse ottave di rumore
                    for (let i = 0; i < this.octaves; i++) {
                        const sampleX = worldX / this.scale * frequency;
                        const sampleZ = worldZ / this.scale * frequency;
                        
                        const perlinValue = this.noise2D(sampleX, sampleZ);
                        noiseHeight += perlinValue * amplitude;
                        normalization += amplitude;
                        
                        amplitude *= this.persistence;
                        frequency *= this.lacunarity;
                    }
                    
                    // Normalizza e salva il valore
                    heightmap[z][x] = noiseHeight / normalization;
                }
            }
            
            console.log('Heightmap generata con successo');
            return heightmap;
            
        } catch (error) {
            console.error('Errore durante la generazione dell\'heightmap:', error);
            throw error;
        }
    }
}

// Esponi la classe globalmente
window.TerrainGenerator = TerrainGenerator; 