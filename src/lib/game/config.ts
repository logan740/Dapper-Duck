import { GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  // Virtual playfield used by all game math
  VIRTUAL_WIDTH: 540,
  VIRTUAL_HEIGHT: 640,

  // Duck physics tuning
  DUCK_SCALE: 0.80,
  GRAVITY: 1100,
  DRAG: 0.88,
  FLAP_IMPULSE: -520,   // buffed from -450
  MAX_UP_SPEED: -560,
  MAX_FALL_SPEED: 820,
  GLIDE_THRUST: -140,   // buffed from -120
  FLAP_COOLDOWN: 0.08,  // faster from 0.10

  // Tight bounds so the duck never disappears off-screen
  TOP_DEAD_ZONE: 120,
  BOTTOM_DEAD_ZONE: 120,

  // FUD base tuning (actual values scale with difficulty)
  FUD_SIZE: 56,
  FUD_SPEED_MIN: 200,   // at start
  FUD_SPEED_MAX: 420,   // was 320 → faster late game
  FUD_SPAWN_MIN: 1.6,   // seconds between spawns at start
  FUD_SPAWN_MAX: 0.35,  // was 0.60 → more frequent late game
  FUD_MAX_COUNT_START: 1,
  FUD_MAX_COUNT_END: 5, // was 3 → allow up to 5 on screen
  FUD_HITBOX_SCALE: 0.60,

  // Snack tuning (collectibles)
  SNACK_SIZE: 44,
  SNACK_SPEED: 160,
  SNACK_RESPAWN_MIN: 1.4,
  SNACK_RESPAWN_MAX: 2.6,
  SNACK_HITBOX_SCALE: 0.60,
  SNACK_BOB_AMPL: 6,
  SNACK_BOB_FREQ: 3.2,
};

// Rarity table: weight controls how often; points = score on collect
export const SNACK_TABLE = [
  { idx: 0, weight: 6,   points: 50  },  // snack1 (common)
  { idx: 1, weight: 3,   points: 100 },  // snack2 (uncommon)
  { idx: 2, weight: 1.5, points: 150 },  // snack3 (rare)
  { idx: 3, weight: 0.5, points: 300 },  // snack4 (epic)
];

export const FUD_PATHS = [
  'assets/fudbag1.png',
  'assets/fudbag2.png',
  'assets/fudbag3.png',
  'assets/fudbag4.png'
];

export const SNACK_PATHS = [
  'assets/snack1.png',
  'assets/snack2.png',
  'assets/snack3.png',
  'assets/snack4.png'
];
