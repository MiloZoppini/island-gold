class Notifications {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Aggiungi la notifica al container
        this.container.appendChild(notification);

        // Aggiungi la classe per l'animazione di entrata
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Rimuovi la notifica dopo la durata specificata
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }, duration);
    }

    showSuccess(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    showError(message, duration = 3000) {
        this.show(message, 'error', duration);
    }

    showWarning(message, duration = 3000) {
        this.show(message, 'warning', duration);
    }

    hide() {
        // Rimuovi tutte le notifiche
        this.container.innerHTML = '';
    }
} 