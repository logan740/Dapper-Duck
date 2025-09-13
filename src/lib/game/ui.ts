import { GameState } from './types';

export class UIManager {
  private elMenu!: HTMLElement;
  private elHud!: HTMLElement;
  private elOver!: HTMLElement;
  private elStart!: HTMLElement;
  private elRetry!: HTMLElement;
  private elMenuBtn!: HTMLElement;
  private elScore!: HTMLElement;
  private elReason!: HTMLElement;

  private onStartGameCallback?: () => void;
  private onReturnToMenuCallback?: () => void;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.elMenu = document.getElementById('menu')!;
    this.elHud = document.getElementById('hud')!;
    this.elOver = document.getElementById('gameOver')!;
    this.elStart = document.getElementById('startBtn')!;
    this.elRetry = document.getElementById('retryBtn')!;
    this.elMenuBtn = document.getElementById('menuBtn')!;
    this.elScore = document.getElementById('scoreVal')!;
    this.elReason = document.getElementById('reason')!;
  }

  private setupEventListeners(): void {
    this.elStart.addEventListener('click', () => this.onStartGameCallback?.());
    this.elRetry.addEventListener('click', () => this.onStartGameCallback?.());
    this.elMenuBtn.addEventListener('click', () => this.onReturnToMenuCallback?.());
  }

  setOnStartGameCallback(callback: () => void): void {
    this.onStartGameCallback = callback;
  }

  setOnReturnToMenuCallback(callback: () => void): void {
    this.onReturnToMenuCallback = callback;
  }

  setState(state: GameState): void {
    this.elMenu.classList.toggle('hidden', state !== GameState.MENU);
    this.elHud.classList.toggle('hidden', state !== GameState.PLAY);
    this.elOver.classList.toggle('hidden', state !== GameState.OVER);
  }

  updateScore(score: number): void {
    this.elScore.textContent = Math.floor(score).toString();
  }

  setGameOverReason(reason: string): void {
    this.elReason.textContent = reason;
  }
}
