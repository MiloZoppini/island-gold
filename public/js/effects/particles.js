/**
 * Sistema di particelle
 * Questo file implementa un sistema di particelle per effetti visivi come fumo, fuoco e nebbia
 */

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particleSystems = [];
  }

  /**
   * Crea un sistema di particelle
   * @param {string} type - Tipo di particelle (fumo, fuoco, nebbia)
   * @param {Object} position - Posizione del sistema di particelle
   * @param {Object} options - Opzioni per il sistema di particelle
   * @returns {Object} Sistema di particelle creato
   */
  createParticleSystem(type, position, options = {}) {
    let particleSystem;
    
    switch (type) {
      case 'fumo':
        particleSystem = this.createSmoke(position, options);
        break;
      case 'fuoco':
        particleSystem = this.createFire(position, options);
        break;
      case 'nebbia':
        particleSystem = this.createFog(position, options);
        break;
      default:
        console.error(`Tipo di particelle non supportato: ${type}`);
        return null;
    }
    
    if (particleSystem) {
      this.particleSystems.push(particleSystem);
      this.scene.add(particleSystem.mesh);
    }
    
    return particleSystem;
  }

  /**
   * Crea un sistema di particelle di fumo
   * @param {Object} position - Posizione del sistema di particelle
   * @param {Object} options - Opzioni per il sistema di particelle
   * @returns {Object} Sistema di particelle di fumo
   */
  createSmoke(position, options = {}) {
    const {
      count = 100,
      size = 2,
      spread = 1,
      lifetime = 3,
      speed = 1,
      color = 0x888888,
      opacity = 0.6
    } = options;
    
    // Crea la geometria delle particelle
    const geometry = new window.THREE.BufferGeometry();
    const vertices = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const maxLifetimes = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    // Inizializza le particelle
    for (let i = 0; i < count; i++) {
      // Posizione iniziale
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      
      vertices[i * 3] = position.x + Math.cos(angle) * radius;
      vertices[i * 3 + 1] = position.y;
      vertices[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      
      // Velocità
      velocities[i * 3] = (Math.random() - 0.5) * 0.2 * speed;
      velocities[i * 3 + 1] = Math.random() * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2 * speed;
      
      // Durata di vita
      maxLifetimes[i] = lifetime * (0.7 + Math.random() * 0.6);
      lifetimes[i] = Math.random() * maxLifetimes[i];
      
      // Dimensione
      sizes[i] = size * (0.5 + Math.random() * 0.5);
    }
    
    geometry.setAttribute('position', new window.THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('velocity', new window.THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new window.THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('maxLifetime', new window.THREE.BufferAttribute(maxLifetimes, 1));
    geometry.setAttribute('size', new window.THREE.BufferAttribute(sizes, 1));
    
    // Crea la texture della particella
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    // Disegna un cerchio sfumato
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new window.THREE.CanvasTexture(canvas);
    
    // Crea il materiale delle particelle
    const material = new window.THREE.PointsMaterial({
      size: 1,
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: window.THREE.AdditiveBlending,
      vertexColors: false,
      color: new window.THREE.Color(color)
    });
    
    // Crea il sistema di particelle
    const mesh = new window.THREE.Points(geometry, material);
    
    return {
      mesh,
      type: 'fumo',
      update: (deltaTime) => this.updateSmoke(mesh, deltaTime)
    };
  }

  /**
   * Aggiorna un sistema di particelle di fumo
   * @param {THREE.Points} mesh - Mesh del sistema di particelle
   * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
   */
  updateSmoke(mesh, deltaTime) {
    const positions = mesh.geometry.attributes.position.array;
    const velocities = mesh.geometry.attributes.velocity.array;
    const lifetimes = mesh.geometry.attributes.lifetime.array;
    const maxLifetimes = mesh.geometry.attributes.maxLifetime.array;
    const sizes = mesh.geometry.attributes.size.array;
    
    for (let i = 0; i < lifetimes.length; i++) {
      // Aggiorna la durata di vita
      lifetimes[i] += deltaTime;
      
      // Se la particella è morta, resettala
      if (lifetimes[i] >= maxLifetimes[i]) {
        // Resetta la posizione
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random();
        
        positions[i * 3] = mesh.position.x + Math.cos(angle) * radius;
        positions[i * 3 + 1] = mesh.position.y;
        positions[i * 3 + 2] = mesh.position.z + Math.sin(angle) * radius;
        
        // Resetta la durata di vita
        lifetimes[i] = 0;
      } else {
        // Aggiorna la posizione
        positions[i * 3] += velocities[i * 3] * deltaTime;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
        
        // Aggiungi un po' di movimento casuale
        positions[i * 3] += (Math.random() - 0.5) * 0.05;
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
        
        // Calcola l'opacità in base alla durata di vita
        const lifeRatio = lifetimes[i] / maxLifetimes[i];
        
        // Aggiorna la dimensione
        if (lifeRatio < 0.2) {
          // Crescita
          mesh.material.size = sizes[i] * (lifeRatio / 0.2);
        } else if (lifeRatio > 0.8) {
          // Dissolvenza
          mesh.material.size = sizes[i] * (1 - (lifeRatio - 0.8) / 0.2);
        } else {
          // Dimensione massima
          mesh.material.size = sizes[i];
        }
      }
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.lifetime.needsUpdate = true;
  }

  /**
   * Crea un sistema di particelle di fuoco
   * @param {Object} position - Posizione del sistema di particelle
   * @param {Object} options - Opzioni per il sistema di particelle
   * @returns {Object} Sistema di particelle di fuoco
   */
  createFire(position, options = {}) {
    const {
      count = 100,
      size = 1.5,
      spread = 0.8,
      lifetime = 1.5,
      speed = 2,
      color1 = 0xFF5500,
      color2 = 0xFF0000,
      opacity = 0.7
    } = options;
    
    // Crea la geometria delle particelle
    const geometry = new window.THREE.BufferGeometry();
    const vertices = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const maxLifetimes = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    // Colori del fuoco
    const colorStart = new window.THREE.Color(color1);
    const colorEnd = new window.THREE.Color(color2);
    
    // Inizializza le particelle
    for (let i = 0; i < count; i++) {
      // Posizione iniziale
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      
      vertices[i * 3] = position.x + Math.cos(angle) * radius;
      vertices[i * 3 + 1] = position.y;
      vertices[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      
      // Velocità
      velocities[i * 3] = (Math.random() - 0.5) * 0.5 * speed;
      velocities[i * 3 + 1] = (0.5 + Math.random() * 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5 * speed;
      
      // Durata di vita
      maxLifetimes[i] = lifetime * (0.7 + Math.random() * 0.6);
      lifetimes[i] = Math.random() * maxLifetimes[i];
      
      // Dimensione
      sizes[i] = size * (0.5 + Math.random() * 0.5);
      
      // Colore
      const color = new window.THREE.Color().copy(colorStart);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new window.THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('velocity', new window.THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new window.THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('maxLifetime', new window.THREE.BufferAttribute(maxLifetimes, 1));
    geometry.setAttribute('size', new window.THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3));
    
    // Crea la texture della particella
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    // Disegna un cerchio sfumato
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new window.THREE.CanvasTexture(canvas);
    
    // Crea il materiale delle particelle
    const material = new window.THREE.PointsMaterial({
      size: 1,
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: window.THREE.AdditiveBlending,
      vertexColors: true
    });
    
    // Crea il sistema di particelle
    const mesh = new window.THREE.Points(geometry, material);
    
    return {
      mesh,
      type: 'fuoco',
      update: (deltaTime) => this.updateFire(mesh, deltaTime, colorStart, colorEnd)
    };
  }

  /**
   * Aggiorna un sistema di particelle di fuoco
   * @param {THREE.Points} mesh - Mesh del sistema di particelle
   * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
   * @param {THREE.Color} colorStart - Colore iniziale del fuoco
   * @param {THREE.Color} colorEnd - Colore finale del fuoco
   */
  updateFire(mesh, deltaTime, colorStart, colorEnd) {
    const positions = mesh.geometry.attributes.position.array;
    const velocities = mesh.geometry.attributes.velocity.array;
    const lifetimes = mesh.geometry.attributes.lifetime.array;
    const maxLifetimes = mesh.geometry.attributes.maxLifetime.array;
    const sizes = mesh.geometry.attributes.size.array;
    const colors = mesh.geometry.attributes.color.array;
    
    for (let i = 0; i < lifetimes.length; i++) {
      // Aggiorna la durata di vita
      lifetimes[i] += deltaTime;
      
      // Se la particella è morta, resettala
      if (lifetimes[i] >= maxLifetimes[i]) {
        // Resetta la posizione
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.8;
        
        positions[i * 3] = mesh.position.x + Math.cos(angle) * radius;
        positions[i * 3 + 1] = mesh.position.y;
        positions[i * 3 + 2] = mesh.position.z + Math.sin(angle) * radius;
        
        // Resetta la velocità
        velocities[i * 3] = (Math.random() - 0.5) * 0.5 * 2;
        velocities[i * 3 + 1] = (0.5 + Math.random() * 0.5) * 2;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5 * 2;
        
        // Resetta la durata di vita
        lifetimes[i] = 0;
        
        // Resetta il colore
        colors[i * 3] = colorStart.r;
        colors[i * 3 + 1] = colorStart.g;
        colors[i * 3 + 2] = colorStart.b;
      } else {
        // Aggiorna la posizione
        positions[i * 3] += velocities[i * 3] * deltaTime;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
        
        // Aggiungi un po' di movimento casuale
        positions[i * 3] += (Math.random() - 0.5) * 0.1;
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
        
        // Calcola l'opacità in base alla durata di vita
        const lifeRatio = lifetimes[i] / maxLifetimes[i];
        
        // Aggiorna il colore
        const color = new window.THREE.Color().copy(colorStart).lerp(colorEnd, lifeRatio);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Aggiorna la dimensione
        if (lifeRatio < 0.2) {
          // Crescita
          mesh.material.size = sizes[i] * (lifeRatio / 0.2);
        } else if (lifeRatio > 0.8) {
          // Dissolvenza
          mesh.material.size = sizes[i] * (1 - (lifeRatio - 0.8) / 0.2);
        } else {
          // Dimensione massima
          mesh.material.size = sizes[i];
        }
      }
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
    mesh.geometry.attributes.lifetime.needsUpdate = true;
  }

  /**
   * Crea un sistema di particelle di nebbia
   * @param {Object} position - Posizione del sistema di particelle
   * @param {Object} options - Opzioni per il sistema di particelle
   * @returns {Object} Sistema di particelle di nebbia
   */
  createFog(position, options = {}) {
    const {
      count = 200,
      size = 10,
      width = 100,
      height = 5,
      depth = 100,
      color = 0xCCCCCC,
      opacity = 0.3
    } = options;
    
    // Crea la geometria delle particelle
    const geometry = new window.THREE.BufferGeometry();
    const vertices = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const maxLifetimes = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    // Inizializza le particelle
    for (let i = 0; i < count; i++) {
      // Posizione iniziale
      vertices[i * 3] = position.x + (Math.random() - 0.5) * width;
      vertices[i * 3 + 1] = position.y + Math.random() * height;
      vertices[i * 3 + 2] = position.z + (Math.random() - 0.5) * depth;
      
      // Velocità
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      // Durata di vita
      maxLifetimes[i] = 10 + Math.random() * 10;
      lifetimes[i] = Math.random() * maxLifetimes[i];
      
      // Dimensione
      sizes[i] = size * (0.5 + Math.random() * 0.5);
    }
    
    geometry.setAttribute('position', new window.THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('velocity', new window.THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new window.THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('maxLifetime', new window.THREE.BufferAttribute(maxLifetimes, 1));
    geometry.setAttribute('size', new window.THREE.BufferAttribute(sizes, 1));
    
    // Crea la texture della particella
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    // Disegna un cerchio sfumato
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new window.THREE.CanvasTexture(canvas);
    
    // Crea il materiale delle particelle
    const material = new window.THREE.PointsMaterial({
      size: size,
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: window.THREE.AdditiveBlending,
      vertexColors: false,
      color: new window.THREE.Color(color)
    });
    
    // Crea il sistema di particelle
    const mesh = new window.THREE.Points(geometry, material);
    
    return {
      mesh,
      type: 'nebbia',
      update: (deltaTime) => this.updateFog(mesh, deltaTime, width, depth)
    };
  }

  /**
   * Aggiorna un sistema di particelle di nebbia
   * @param {THREE.Points} mesh - Mesh del sistema di particelle
   * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
   * @param {number} width - Larghezza dell'area di nebbia
   * @param {number} depth - Profondità dell'area di nebbia
   */
  updateFog(mesh, deltaTime, width, depth) {
    const positions = mesh.geometry.attributes.position.array;
    const velocities = mesh.geometry.attributes.velocity.array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      // Aggiorna la posizione
      positions[i * 3] += velocities[i * 3] * deltaTime;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
      
      // Controlla i limiti
      if (positions[i * 3] > mesh.position.x + width / 2) {
        positions[i * 3] = mesh.position.x - width / 2;
      } else if (positions[i * 3] < mesh.position.x - width / 2) {
        positions[i * 3] = mesh.position.x + width / 2;
      }
      
      if (positions[i * 3 + 2] > mesh.position.z + depth / 2) {
        positions[i * 3 + 2] = mesh.position.z - depth / 2;
      } else if (positions[i * 3 + 2] < mesh.position.z - depth / 2) {
        positions[i * 3 + 2] = mesh.position.z + depth / 2;
      }
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Aggiorna tutti i sistemi di particelle
   * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
   */
  update(deltaTime) {
    this.particleSystems.forEach(system => {
      system.update(deltaTime);
    });
  }
}

// Esponi la classe globalmente
window.ParticleSystem = ParticleSystem; 