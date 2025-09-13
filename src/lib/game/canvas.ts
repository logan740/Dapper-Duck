import { GAME_CONFIG } from './config';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number = 1;
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }
    
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.setupResize();
    this.resize();
  }

  private setupResize(): void {
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  private resize(): void {
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    this.scale = Math.max(cssW / GAME_CONFIG.VIRTUAL_WIDTH, cssH / GAME_CONFIG.VIRTUAL_HEIGHT); // cover
    this.offsetX = (cssW - GAME_CONFIG.VIRTUAL_WIDTH * this.scale) * 0.5;
    this.offsetY = (cssH - GAME_CONFIG.VIRTUAL_HEIGHT * this.scale) * 0.5;

    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';

    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);

    this.ctx.setTransform(
      this.dpr * this.scale, 
      0, 
      0, 
      this.dpr * this.scale, 
      this.dpr * this.offsetX, 
      this.dpr * this.offsetY
    );
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  get width(): number {
    return GAME_CONFIG.VIRTUAL_WIDTH;
  }

  get height(): number {
    return GAME_CONFIG.VIRTUAL_HEIGHT;
  }
}
