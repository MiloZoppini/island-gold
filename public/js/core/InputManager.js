class InputManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.keys = new Map();
        this.enabled = false;
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.setupKeyboardEvents();
        this.setupMouseEvents();
    }

    setupKeyboardEvents() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setupMouseEvents() {
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(event) {
        if (!this.enabled) return;
        if (event.repeat) return;
        
        this.keys.set(event.code, true);
        this.eventBus.emit('input.keydown', { key: event.code });
    }

    onKeyUp(event) {
        if (!this.enabled) return;
        
        this.keys.set(event.code, false);
        this.eventBus.emit('input.keyup', { key: event.code });
    }

    onMouseMove(event) {
        if (!this.enabled) return;

        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;

        if (document.pointerLockElement) {
            this.mouseDelta.x = event.movementX;
            this.mouseDelta.y = event.movementY;
            this.eventBus.emit('input.mousemove', {
                delta: { x: event.movementX, y: event.movementY },
                position: this.mousePosition
            });
        }
    }

    onMouseDown(event) {
        if (!this.enabled) return;
        this.eventBus.emit('input.mousedown', { button: event.button });
    }

    onMouseUp(event) {
        if (!this.enabled) return;
        this.eventBus.emit('input.mouseup', { button: event.button });
    }

    onPointerLockChange() {
        if (document.pointerLockElement) {
            this.eventBus.emit('input.pointerlockstart');
        } else {
            this.eventBus.emit('input.pointerlockend');
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.keys.clear();
    }

    isKeyPressed(keyCode) {
        return this.enabled && this.keys.get(keyCode) === true;
    }

    getInputState() {
        return {
            forward: this.isKeyPressed('KeyW'),
            backward: this.isKeyPressed('KeyS'),
            left: this.isKeyPressed('KeyA'),
            right: this.isKeyPressed('KeyD'),
            up: this.isKeyPressed('Space'),
            down: this.isKeyPressed('ShiftLeft'),
            mouseDelta: { ...this.mouseDelta },
            mousePosition: { ...this.mousePosition }
        };
    }

    requestPointerLock() {
        const element = document.body;
        if (element.requestPointerLock) {
            element.requestPointerLock();
        }
    }

    exitPointerLock() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
}

export default InputManager; 