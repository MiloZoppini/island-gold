class PerformanceMonitor {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            objectCount: 0,
            triangleCount: 0,
            drawCalls: 0,
            jsHeapSize: 0,
            jsHeapSizeLimit: 0,
            jsHeapSizeUsed: 0
        };

        this.frameCount = 0;
        this.lastTime = performance.now();
        this.lastMetricsUpdate = 0;

        // Intervallo di aggiornamento delle metriche (1 secondo)
        this.metricsUpdateInterval = 1000;
    }

    update(currentTime) {
        this.frameCount++;

        // Calcola FPS e tempo del frame
        const deltaTime = currentTime - this.lastTime;
        if (deltaTime >= this.metricsUpdateInterval) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.metrics.frameTime = deltaTime / this.frameCount;
            
            // Resetta i contatori
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Aggiorna le metriche della memoria se disponibili
            if (window.performance && window.performance.memory) {
                this.metrics.jsHeapSize = window.performance.memory.totalJSHeapSize;
                this.metrics.jsHeapSizeLimit = window.performance.memory.jsHeapSizeLimit;
                this.metrics.jsHeapSizeUsed = window.performance.memory.usedJSHeapSize;
            }

            // Emetti l'evento con le metriche aggiornate
            this.eventBus.emit('performance.update', { ...this.metrics });
        }
    }

    updateMonitoredObjectCounts(renderer) {
        if (!renderer || !renderer.info) return;

        const info = renderer.info;
        this.metrics.drawCalls = info.render.calls;
        this.metrics.triangleCount = info.render.triangles;
        this.metrics.objectCount = info.memory.geometries;
    }

    setUpdateTime(time) {
        this.metrics.updateTime = time;
    }

    setRenderTime(time) {
        this.metrics.renderTime = time;
    }

    reset() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = 0;
        });
    }
}

// Esponi la classe globalmente
window.PerformanceMonitor = PerformanceMonitor; 