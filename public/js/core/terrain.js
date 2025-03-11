/**
 * Generazione avanzata del terreno
 * Questo file implementa algoritmi di rumore per generare terreni realistici
 */

class TerrainGenerator {
  constructor() {
    this.simplex = null;
    this.seed = Math.random() * 10000;
    this.initialized = false;
  }

  /**
   * Inizializza il generatore di terreno
   */
  init() {
    if (typeof SimplexNoise !== 'undefined') {
      this.simplex = new SimplexNoise(this.seed);
      this.initialized = true;
    } else {
      console.error('SimplexNoise non è disponibile. Assicurati di includere la libreria.');
    }
  }

  /**
   * Genera l'altezza del terreno in un punto specifico
   * @param {number} x - Coordinata X
   * @param {number} z - Coordinata Z
   * @param {Object} options - Opzioni di generazione
   * @returns {number} Altezza del terreno
   */
  getHeight(x, z, options = {}) {
    if (!this.initialized) {
      this.init();
    }

    if (!this.simplex) {
      // Fallback alla generazione semplice se SimplexNoise non è disponibile
      return this.getSimpleHeight(x, z);
    }

    // Parametri di generazione
    const {
      scale = 0.005,
      amplitude = 30,
      octaves = 6,
      persistence = 0.5,
      lacunarity = 2.0,
      heightOffset = 0,
      islandFactor = 1.0
    } = options;

    // Calcola il rumore con più ottave per maggiore dettaglio
    let noise = 0;
    let frequency = scale;
    let amp = 1.0;
    let maxAmp = 0;

    for (let i = 0; i < octaves; i++) {
      // Aggiungi rumore con frequenza e ampiezza correnti
      noise += this.simplex.noise2D(x * frequency, z * frequency) * amp;
      
      // Prepara per la prossima ottava
      maxAmp += amp;
      amp *= persistence;
      frequency *= lacunarity;
    }

    // Normalizza il rumore
    noise /= maxAmp;
    
    // Applica l'ampiezza desiderata
    noise *= amplitude;
    
    // Aggiungi l'offset di altezza
    noise += heightOffset;

    // Applica un fattore di isola (diminuisce l'altezza man mano che ci si allontana dal centro)
    if (islandFactor < 1.0) {
      const distance = Math.sqrt(x * x + z * z);
      const islandRadius = 500; // Raggio dell'isola
      const falloffStart = islandRadius * 0.8; // Punto in cui inizia la diminuzione
      
      if (distance > falloffStart) {
        const falloffFactor = 1.0 - Math.min(1.0, (distance - falloffStart) / (islandRadius - falloffStart));
        noise *= falloffFactor * islandFactor + (1.0 - islandFactor);
      }
    }

    return noise;
  }

  /**
   * Genera l'altezza del terreno con un algoritmo semplice (fallback)
   * @param {number} x - Coordinata X
   * @param {number} z - Coordinata Z
   * @returns {number} Altezza del terreno
   */
  getSimpleHeight(x, z) {
    const scale = 0.01;
    const height = Math.sin(x * scale) * Math.cos(z * scale) * 10;
    return height + Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 5;
  }

  /**
   * Genera diversi tipi di terreno in base all'altezza e alla pendenza
   * @param {number} height - Altezza del terreno
   * @param {number} slope - Pendenza del terreno
   * @returns {string} Tipo di terreno (erba, roccia, sabbia, neve)
   */
  getTerrainType(height, slope) {
    if (height < 0) {
      return 'sabbia';
    } else if (height < 5) {
      return 'erba';
    } else if (height < 20 || slope > 0.5) {
      return 'roccia';
    } else {
      return 'neve';
    }
  }

  /**
   * Calcola la pendenza del terreno
   * @param {number} x - Coordinata X
   * @param {number} z - Coordinata Z
   * @param {Object} options - Opzioni di generazione
   * @returns {number} Pendenza del terreno (0-1)
   */
  getSlope(x, z, options = {}) {
    const sampleDistance = 1.0;
    
    const h = this.getHeight(x, z, options);
    const hL = this.getHeight(x - sampleDistance, z, options);
    const hR = this.getHeight(x + sampleDistance, z, options);
    const hD = this.getHeight(x, z - sampleDistance, options);
    const hU = this.getHeight(x, z + sampleDistance, options);
    
    const slopeX = (hR - hL) / (2 * sampleDistance);
    const slopeZ = (hU - hD) / (2 * sampleDistance);
    
    return Math.sqrt(slopeX * slopeX + slopeZ * slopeZ);
  }

  /**
   * Genera una mappa di altezza per un'area rettangolare
   * @param {number} width - Larghezza della mappa
   * @param {number} height - Altezza della mappa
   * @param {number} resolution - Risoluzione della mappa
   * @param {Object} options - Opzioni di generazione
   * @returns {Float32Array} Mappa di altezza
   */
  generateHeightmap(width, height, resolution, options = {}) {
    const mapWidth = Math.ceil(width / resolution);
    const mapHeight = Math.ceil(height / resolution);
    const heightmap = new Float32Array(mapWidth * mapHeight);
    
    for (let z = 0; z < mapHeight; z++) {
      for (let x = 0; x < mapWidth; x++) {
        const worldX = (x - mapWidth / 2) * resolution;
        const worldZ = (z - mapHeight / 2) * resolution;
        
        heightmap[z * mapWidth + x] = this.getHeight(worldX, worldZ, options);
      }
    }
    
    return heightmap;
  }
}

// Esponi la classe globalmente
window.TerrainGenerator = TerrainGenerator; 