import { GameState, Duck, FudBag, Snack, CloudLayer, SnackEffect, SnackType } from './types';
import { GAME_CONFIG, SNACK_TABLE, FUD_PATHS, SNACK_PATHS } from './config';
import { clamp, map, lerp, pickWeightedSnack } from './utils';
import { CanvasManager } from './canvas';
import { InputManager } from './input';
import { UIManager } from './ui';

export class GameEngine {
  private canvas: CanvasManager;
  private input: InputManager;
  private ui: UIManager;
  
  private state: GameState = GameState.MENU;
  private timeAlive: number = 0;
  private score: number = 0;
  private last: number = performance.now();
  private dtGlobal: number = 0;

  // Duck
  private duck!: Duck;
  private duckImg!: HTMLImageElement;
  private duckLoaded: boolean = false;
  private flapTimer: number = 0;

  // Background
  private clouds: CloudLayer[] = [];
  private worldX: number = 0;

  // FUD bags
  private fudImages: HTMLImageElement[] = [];
  private fudLoadedCount: number = 0;
  private fudList: FudBag[] = [];
  private fudSpawnTimer: number = 0;

  // Snacks
  private snackImages: HTMLImageElement[] = [];
  private snackLoadedCount: number = 0;
  private activeSnack: Snack | null = null;
  private snackRespawnTimer: number = 0;
  private snackFx: SnackEffect[] = [];
  private lastSnackPoints: number = 0;

  constructor() {
    this.canvas = new CanvasManager('game');
    this.input = new InputManager();
    this.ui = new UIManager();

    this.initializeDuck();
    this.initializeImages();
    this.initializeClouds();
    this.setupCallbacks();
    this.startGameLoop();
  }

  private initializeDuck(): void {
    this.duckImg = new Image();
    this.duckImg.src = 'assets/duck.png';
    this.duckImg.onload = () => { this.duckLoaded = true; };

    const base = 72;
    this.duck = {
      x: 80,
      y: GAME_CONFIG.VIRTUAL_HEIGHT * 0.45,
      w: Math.round(base * GAME_CONFIG.DUCK_SCALE),
      h: Math.round(base * GAME_CONFIG.DUCK_SCALE),
      vy: 0,
      rot: 0
    };
  }

  private initializeImages(): void {
    // FUD images
    this.fudImages = FUD_PATHS.map(path => {
      const img = new Image();
      img.src = path;
      img.onload = () => { this.fudLoadedCount++; };
      return img;
    });

    // Snack images
    this.snackImages = SNACK_PATHS.map(path => {
      const img = new Image();
      img.src = path;
      img.onload = () => { this.snackLoadedCount++; };
      return img;
    });
  }

  private initializeClouds(): void {
    this.clouds = [
      { z: 0.2, speed: 10, blobs: [] },
      { z: 0.5, speed: 20, blobs: [] },
      { z: 0.8, speed: 35, blobs: [] },
    ];

    for (const layer of this.clouds) {
      layer.blobs = [];
      const count = Math.floor(10 * layer.z) + 7;
      for (let i = 0; i < count; i++) {
        layer.blobs.push({
          x: Math.random() * (GAME_CONFIG.VIRTUAL_WIDTH + 200) - 100,
          y: Math.random() * GAME_CONFIG.VIRTUAL_HEIGHT,
          r: 20 + Math.random() * 60 * layer.z,
          vx: -layer.speed * (0.8 + Math.random() * 0.4),
        });
      }
    }
  }

  private setupCallbacks(): void {
    this.input.setOnFlapCallback(() => this.tryFlap());
    this.ui.setOnStartGameCallback(() => this.startGame());
    this.ui.setOnReturnToMenuCallback(() => this.setState(GameState.MENU));
  }

  private difficulty01(): number {
    const t = this.timeAlive / 90;
    return Math.max(0, Math.min(1, 1 - Math.exp(-t)));
  }

  private tryFlap(): void {
    if (this.state !== GameState.PLAY || this.flapTimer > 0) return;
    this.duck.vy = Math.max(this.duck.vy + GAME_CONFIG.FLAP_IMPULSE, GAME_CONFIG.MAX_UP_SPEED);
    this.flapTimer = GAME_CONFIG.FLAP_COOLDOWN;
  }

  private startGame(): void {
    this.worldX = 0;
    this.timeAlive = 0;
    this.score = 0;
    this.ui.updateScore(0);

    this.duck.x = 80;
    this.duck.y = GAME_CONFIG.VIRTUAL_HEIGHT * 0.45;
    this.duck.vy = 0;
    this.duck.rot = 0;
    this.flapTimer = 0;

    // FUD reset
    this.fudList.length = 0;
    this.fudSpawnTimer = 0;

    // Snack reset
    this.activeSnack = null;
    this.snackRespawnTimer = 0;
    this.snackFx.length = 0;

    this.initializeClouds();
    this.setState(GameState.PLAY);
  }

  private gameOver(reason: string = 'Ouch!'): void {
    this.setState(GameState.OVER);
    this.ui.setGameOverReason(reason);
  }

  private setState(state: GameState): void {
    this.state = state;
    this.ui.setState(state);
  }

  private spawnFudBag(): void {
    const img = this.fudImages[Math.floor(Math.random() * this.fudImages.length)];
    const margin = Math.max(GAME_CONFIG.TOP_DEAD_ZONE, GAME_CONFIG.BOTTOM_DEAD_ZONE) + 30;
    const fud: FudBag = {
      x: GAME_CONFIG.VIRTUAL_WIDTH + 40,
      y: Math.random() * (GAME_CONFIG.VIRTUAL_HEIGHT - margin * 2 - GAME_CONFIG.FUD_SIZE) + margin,
      w: GAME_CONFIG.FUD_SIZE,
      h: GAME_CONFIG.FUD_SIZE,
      img,
      vy: (Math.random() < 0.25 ? (Math.random() * 40 - 20) : 0)
    };
    this.fudList.push(fud);
  }

  private updateFud(dt: number): void {
    if (this.state !== GameState.PLAY || this.fudLoadedCount < this.fudImages.length) return;

    const d = this.difficulty01();
    const maxFud = Math.round(lerp(GAME_CONFIG.FUD_MAX_COUNT_START, GAME_CONFIG.FUD_MAX_COUNT_END, d));
    const interval = lerp(GAME_CONFIG.FUD_SPAWN_MIN, GAME_CONFIG.FUD_SPAWN_MAX, d);

    this.fudSpawnTimer -= dt;
    if (this.fudSpawnTimer <= 0 && this.fudList.length < maxFud) {
      this.spawnFudBag();
      this.fudSpawnTimer = interval * (0.7 + Math.random() * 0.6);
    }

    const speed = lerp(GAME_CONFIG.FUD_SPEED_MIN, GAME_CONFIG.FUD_SPEED_MAX, d);

    for (const fb of this.fudList) {
      fb.x -= speed * dt;
      fb.y += fb.vy * dt;
      if (fb.y < GAME_CONFIG.TOP_DEAD_ZONE + 8) fb.y = GAME_CONFIG.TOP_DEAD_ZONE + 8;
      if (fb.y + fb.h > GAME_CONFIG.VIRTUAL_HEIGHT - GAME_CONFIG.BOTTOM_DEAD_ZONE - 8) {
        fb.y = GAME_CONFIG.VIRTUAL_HEIGHT - GAME_CONFIG.BOTTOM_DEAD_ZONE - 8 - fb.h;
      }
    }

    for (let i = this.fudList.length - 1; i >= 0; i--) {
      if (this.fudList[i].x + this.fudList[i].w <= 0) {
        this.fudList.splice(i, 1);
      }
    }
  }

  private spawnSnack(): void {
    const choiceIdx = pickWeightedSnack(SNACK_TABLE);
    const choice = SNACK_TABLE[choiceIdx];
    const img = this.snackImages[choice.idx];
    this.lastSnackPoints = choice.points;

    const margin = Math.max(GAME_CONFIG.TOP_DEAD_ZONE, GAME_CONFIG.BOTTOM_DEAD_ZONE) + 24;
    this.activeSnack = {
      x: GAME_CONFIG.VIRTUAL_WIDTH + 40,
      y: Math.random() * (GAME_CONFIG.VIRTUAL_HEIGHT - margin * 2 - GAME_CONFIG.SNACK_SIZE) + margin,
      w: GAME_CONFIG.SNACK_SIZE,
      h: GAME_CONFIG.SNACK_SIZE,
      img,
      t: 0
    };
  }

  private updateSnacks(dt: number): void {
    if (this.state !== GameState.PLAY || this.snackLoadedCount < this.snackImages.length) return;

    if (!this.activeSnack) {
      this.snackRespawnTimer -= dt;
      if (this.snackRespawnTimer <= 0) {
        this.spawnSnack();
      }
      return;
    }

    this.activeSnack.t += dt;
    this.activeSnack.x -= GAME_CONFIG.SNACK_SPEED * dt;

    if (this.activeSnack.x + this.activeSnack.w <= 0) {
      this.activeSnack = null;
      this.snackRespawnTimer = GAME_CONFIG.SNACK_RESPAWN_MIN + 
        Math.random() * (GAME_CONFIG.SNACK_RESPAWN_MAX - GAME_CONFIG.SNACK_RESPAWN_MIN);
    }
  }

  private physicsStep(dt: number): void {
    // Clouds
    for (const layer of this.clouds) {
      for (const b of layer.blobs) {
        b.x += b.vx * dt;
        if (b.x < -150) {
          b.x = GAME_CONFIG.VIRTUAL_WIDTH + 100;
          b.y = Math.random() * GAME_CONFIG.VIRTUAL_HEIGHT;
          b.r = 20 + Math.random() * 60 * layer.z;
        }
      }
    }

    // Duck motion
    this.duck.vy += GAME_CONFIG.GRAVITY * dt;
    if (this.input.isInputDown) {
      this.duck.vy += GAME_CONFIG.GLIDE_THRUST * dt;
    }

    const dragPerStep = Math.pow(GAME_CONFIG.DRAG, dt);
    this.duck.vy *= dragPerStep;

    if (this.duck.vy > GAME_CONFIG.MAX_FALL_SPEED) this.duck.vy = GAME_CONFIG.MAX_FALL_SPEED;
    if (this.duck.vy < GAME_CONFIG.MAX_UP_SPEED) this.duck.vy = GAME_CONFIG.MAX_UP_SPEED;

    this.duck.y += this.duck.vy * dt;

    const target = clamp(map(this.duck.vy, -600, 900, -0.55, 0.95), -0.8, 1.0);
    const ease = 1 - Math.exp(-dt * 18);
    this.duck.rot += (target - this.duck.rot) * ease;

    // Bounds
    if (this.duck.y < GAME_CONFIG.TOP_DEAD_ZONE) {
      this.gameOver('You flew too high!');
    } else if (this.duck.y + this.duck.h > GAME_CONFIG.VIRTUAL_HEIGHT - GAME_CONFIG.BOTTOM_DEAD_ZONE) {
      this.gameOver('You fell!');
    }

    this.flapTimer -= dt;
    if (this.flapTimer < 0) this.flapTimer = 0;
  }

  private checkFudCollision(): void {
    if (this.fudLoadedCount < this.fudImages.length) return;

    const padDuckX = (1 - GAME_CONFIG.FUD_HITBOX_SCALE) * this.duck.w * 0.5;
    const padDuckY = (1 - GAME_CONFIG.FUD_HITBOX_SCALE) * this.duck.h * 0.5;
    const dL = this.duck.x + padDuckX, dT = this.duck.y + padDuckY;
    const dR = this.duck.x + this.duck.w - padDuckX, dB = this.duck.y + this.duck.h - padDuckY;

    for (const fb of this.fudList) {
      const padBagX = (1 - GAME_CONFIG.FUD_HITBOX_SCALE) * fb.w * 0.5;
      const padBagY = (1 - GAME_CONFIG.FUD_HITBOX_SCALE) * fb.h * 0.5;
      const bL = fb.x + padBagX, bT = fb.y + padBagY;
      const bR = fb.x + fb.w - padBagX, bB = fb.y + fb.h - padBagY;

      if (dL < bR && dR > bL && dT < bB && dB > bT) {
        this.gameOver('Hit by FUD!');
        return;
      }
    }
  }

  private checkSnackCollision(): void {
    if (!this.activeSnack || this.snackLoadedCount < this.snackImages.length) return;

    const padDuckX = (1 - GAME_CONFIG.SNACK_HITBOX_SCALE) * this.duck.w * 0.5;
    const padDuckY = (1 - GAME_CONFIG.SNACK_HITBOX_SCALE) * this.duck.h * 0.5;
    const dL = this.duck.x + padDuckX, dT = this.duck.y + padDuckY;
    const dR = this.duck.x + this.duck.w - padDuckX, dB = this.duck.y + this.duck.h - padDuckY;

    const padSnackX = (1 - GAME_CONFIG.SNACK_HITBOX_SCALE) * this.activeSnack.w * 0.5;
    const padSnackY = (1 - GAME_CONFIG.SNACK_HITBOX_SCALE) * this.activeSnack.h * 0.5;
    const sL = this.activeSnack.x + padSnackX, sT = this.activeSnack.y + padSnackY;
    const sR = this.activeSnack.x + this.activeSnack.w - padSnackX, sB = this.activeSnack.y + this.activeSnack.h - padSnackY;

    if (dL < sR && dR > sL && dT < sB && dB > sT) {
      this.score += this.lastSnackPoints;
      this.ui.updateScore(this.score);
      this.snackFx.push({
        x: this.activeSnack.x + this.activeSnack.w * 0.2,
        y: this.activeSnack.y,
        t: 0,
        text: `+${this.lastSnackPoints}`
      });
      this.activeSnack = null;
      this.snackRespawnTimer = GAME_CONFIG.SNACK_RESPAWN_MIN + 
        Math.random() * (GAME_CONFIG.SNACK_RESPAWN_MAX - GAME_CONFIG.SNACK_RESPAWN_MIN);
    }
  }

  private drawBackground(): void {
    const ctx = this.canvas.context;
    const g = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.VIRTUAL_HEIGHT);
    g.addColorStop(0, '#fff9e6');
    g.addColorStop(1, '#ffe39f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_CONFIG.VIRTUAL_WIDTH, GAME_CONFIG.VIRTUAL_HEIGHT);

    // sun
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(GAME_CONFIG.VIRTUAL_WIDTH - 70, 90, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd166';
    ctx.fill();
    ctx.restore();

    // clouds
    for (const layer of this.clouds) {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.25 * layer.z;
      ctx.fillStyle = '#ffffff';
      for (const b of layer.blobs) {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r * 1.6, b.r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawDuck(): void {
    if (!this.duckLoaded) return;
    const ctx = this.canvas.context;
    const cx = this.duck.x + this.duck.w / 2;
    const cy = this.duck.y + this.duck.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.duck.rot);
    ctx.drawImage(this.duckImg, -this.duck.w/2, -this.duck.h/2, this.duck.w, this.duck.h);
    ctx.restore();
  }

  private drawFud(): void {
    if (this.fudLoadedCount < this.fudImages.length) return;
    const ctx = this.canvas.context;

    // tiny shadows
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (const fb of this.fudList) {
      ctx.beginPath();
      ctx.ellipse(fb.x + fb.w*0.5, fb.y + fb.h*0.85, fb.w*0.45, fb.h*0.18, 0, 0, Math.PI*2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }
    ctx.restore();

    for (const fb of this.fudList) {
      ctx.drawImage(fb.img, fb.x, fb.y, fb.w, fb.h);
    }
  }

  private drawSnacks(): void {
    if (!this.activeSnack || this.snackLoadedCount < this.snackImages.length) return;
    const ctx = this.canvas.context;

    const bob = Math.sin(this.activeSnack.t * Math.PI * 2 * GAME_CONFIG.SNACK_BOB_FREQ) * GAME_CONFIG.SNACK_BOB_AMPL;

    // shadow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.ellipse(
      this.activeSnack.x + this.activeSnack.w*0.5, 
      this.activeSnack.y + this.activeSnack.h*0.85 + bob, 
      this.activeSnack.w*0.40, 
      this.activeSnack.h*0.16, 
      0, 0, Math.PI*2
    );
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.activeSnack.img, this.activeSnack.x, this.activeSnack.y + bob, this.activeSnack.w, this.activeSnack.h);

    // "+points" FX
    for (let i = this.snackFx.length - 1; i >= 0; i--) {
      const fx = this.snackFx[i];
      fx.t += this.dtGlobal;
      const life = 0.7;
      const p = Math.min(1, fx.t / life);
      const y = fx.y - p * 28;
      const alpha = 1 - p;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#1b1b1b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(fx.text, fx.x, y);
      ctx.restore();
      if (p >= 1) this.snackFx.splice(i, 1);
    }
  }

  private gameLoop(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.dtGlobal = dt;

    if (this.state === GameState.PLAY) {
      this.timeAlive += dt;
      this.physicsStep(dt);
      this.updateFud(dt);
      this.checkFudCollision();
      this.updateSnacks(dt);
      this.checkSnackCollision();
    }

    // Render
    this.drawBackground();
    this.drawDuck();
    this.drawFud();
    this.drawSnacks();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private startGameLoop(): void {
    this.setState(GameState.MENU);
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
