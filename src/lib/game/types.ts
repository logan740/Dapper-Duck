// Game types and interfaces

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Duck extends GameObject {
  vy: number;
  rot: number;
}

export interface FudBag extends GameObject {
  img: HTMLImageElement;
  vy: number;
}

export interface Snack extends GameObject {
  img: HTMLImageElement;
  t: number;
}

export interface CloudBlob {
  x: number;
  y: number;
  r: number;
  vx: number;
}

export interface CloudLayer {
  z: number;
  speed: number;
  blobs: CloudBlob[];
}

export interface SnackEffect {
  x: number;
  y: number;
  t: number;
  text: string;
}

export interface SnackType {
  idx: number;
  weight: number;
  points: number;
}

export enum GameState {
  MENU = 0,
  PLAY = 1,
  OVER = 2,
}

export interface GameConfig {
  // Virtual playfield
  VIRTUAL_WIDTH: number;
  VIRTUAL_HEIGHT: number;
  
  // Duck physics
  DUCK_SCALE: number;
  GRAVITY: number;
  DRAG: number;
  FLAP_IMPULSE: number;
  MAX_UP_SPEED: number;
  MAX_FALL_SPEED: number;
  GLIDE_THRUST: number;
  FLAP_COOLDOWN: number;
  
  // Bounds
  TOP_DEAD_ZONE: number;
  BOTTOM_DEAD_ZONE: number;
  
  // FUD bags
  FUD_SIZE: number;
  FUD_SPEED_MIN: number;
  FUD_SPEED_MAX: number;
  FUD_SPAWN_MIN: number;
  FUD_SPAWN_MAX: number;
  FUD_MAX_COUNT_START: number;
  FUD_MAX_COUNT_END: number;
  FUD_HITBOX_SCALE: number;
  
  // Snacks
  SNACK_SIZE: number;
  SNACK_SPEED: number;
  SNACK_RESPAWN_MIN: number;
  SNACK_RESPAWN_MAX: number;
  SNACK_HITBOX_SCALE: number;
  SNACK_BOB_AMPL: number;
  SNACK_BOB_FREQ: number;
}
