import { GameState } from './types';

export class InputManager {
  private inputDown: boolean = false;
  private onFlapCallback?: () => void;

  constructor() {
    this.setupEventListeners();
  }

  setOnFlapCallback(callback: () => void): void {
    this.onFlapCallback = callback;
  }

  private onPress(e?: Event): void {
    if (this.onFlapCallback) {
      this.onFlapCallback();
    }
    this.inputDown = true;
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
  }

  private onRelease(): void {
    this.inputDown = false;
  }

  private setupEventListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.onPress(e);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.onRelease();
      }
    });

    // Pointer + Mouse + Touch
    ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => {
      window.addEventListener(ev, (e) => this.onPress(e), { passive: false });
    });
    
    ['pointerup', 'mouseup', 'touchend', 'touchcancel', 'pointercancel'].forEach(ev => {
      window.addEventListener(ev, () => this.onRelease(), { passive: true });
    });

    // Safety: release if we lose focus/visibility
    window.addEventListener('blur', () => this.onRelease());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.onRelease();
    });
  }

  get isInputDown(): boolean {
    return this.inputDown;
  }
}
