class LandingPage {
    constructor() {
        this.element = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            this.hide();
            // Emetti un evento per iniziare il gioco
            const event = new CustomEvent('gameStart');
            document.dispatchEvent(event);
        });
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
} 