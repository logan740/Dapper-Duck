// Dapper Duck Enhanced — Adrenaline-packed gameplay with power-ups and smooth mechanics
// - Improved collision detection with precise hitboxes
// - Progressive difficulty scaling with more aggressive FUD patterns
// - Power-up system with special abilities
// - Persistent stats tracking
// - Enhanced visual effects and particle systems
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Virtual playfield used by all game math
  const VIRTUAL_WIDTH = 540;
  const VIRTUAL_HEIGHT = 640;

  // ---------- ENHANCED TUNING ----------
  const DUCK_SCALE = 0.80;
  const GRAVITY = 1100;
  const DRAG = 0.88;
  const FLAP_IMPULSE = -520;
  const MAX_UP_SPEED = -560;
  const MAX_FALL_SPEED = 820;
  const GLIDE_THRUST = -140;
  const FLAP_COOLDOWN = 0.08;

  // Enhanced bounds
  const TOP_DEAD_ZONE = 100;
  const BOTTOM_DEAD_ZONE = 100;

  // Enhanced FUD tuning with more aggressive scaling
  const FUD_SIZE = 56;
  const FUD_SPEED_MIN = 180;   // Slightly slower start
  const FUD_SPEED_MAX = 650;   // Much faster end game (increased from 500)
  const FUD_SPAWN_MIN = 2.0;   // Slower initial spawn
  const FUD_SPAWN_MAX = 0.25;  // Much more frequent late game
  const FUD_MAX_COUNT_START = 1;
  const FUD_MAX_COUNT_END = 5; // Max 5 FUD bags on screen
  const FUD_HITBOX_SCALE = 0.48; // Very precise collision - must actually touch (13% bigger total)
  const DUCK_HITBOX_SCALE = 0.35; // Duck hitbox scale - must actually touch

  // Enhanced snack tuning
  const SNACK_SIZE = 44;
  const SNACK_SPEED_MIN = 160;  // Base snack speed
  const SNACK_SPEED_MAX = 220;  // Faster snacks at high difficulty
  const SNACK_RESPAWN_MIN = 1.0;  // Faster snack spawning
  const SNACK_RESPAWN_MAX = 2.2;  // Reduced max respawn time
  const SNACK_HITBOX_SCALE = 0.70;
  const SNACK_BOB_AMPL = 6;
  const SNACK_BOB_FREQ = 3.2;

  // Power-up system
  const POWERUP_SIZE = 40;
  const POWERUP_SPEED = 140;
  const POWERUP_SPAWN_CHANCE = 0.4; // 40% chance when spawning snack
  const POWERUP_TYPES = {
    SHIELD: { duration: 10, color: '#4F46E5', icon: '🛡️', name: 'Shield' },
    DOUBLE_SCORE: { duration: 10, color: '#F59E0B', icon: '⭐', name: '2x Score' },
    SLOW_MOTION: { duration: 10, color: '#8B5CF6', icon: '⏰', name: 'Slow Mo' },
    MAGNET: { duration: 10, color: '#EF4444', icon: '🧲', name: 'Magnet' }
  };

  // Game stats for persistence
  let gameStats = {
    gamesPlayed: 0,
    bestScore: 0,
    totalSnacks: 0,
    totalFudDodged: 0,
    totalPlayTime: 0,
    powerupsCollected: 0,
    achievements: []
  };

  // Abstract XP tracking
  let xpEvents = [];
  let gameActivity = [];


  // Insanity moments system
  let insanityMode = false;
  let insanityTimer = 0;
  let insanityDuration = 0;
  let lastInsanityTime = 0;

  // Load stats from localStorage
  function loadStats() {
    const saved = localStorage.getItem('dapperDuckStats');
    if (saved) {
      gameStats = { ...gameStats, ...JSON.parse(saved) };
    }
  }

  // Save stats to localStorage
  function saveStats() {
    localStorage.setItem('dapperDuckStats', JSON.stringify(gameStats));
  }

  // Abstract XP tracking functions
  function trackXPEvent(eventType, data = {}) {
    const xpEvent = {
      type: eventType,
      timestamp: Date.now(),
      gameId: 'dapper-duck',
      data: data
    };
    
    xpEvents.push(xpEvent);
    
    // Save to localStorage for Abstract Portal
    const existingEvents = JSON.parse(localStorage.getItem('dapperDuck_xpEvents') || '[]');
    existingEvents.push(xpEvent);
    localStorage.setItem('dapperDuck_xpEvents', JSON.stringify(existingEvents));
    
    console.log('XP Event tracked:', xpEvent);
  }

  function trackGameActivity(activityType, data = {}) {
    const activity = {
      type: activityType,
      timestamp: Date.now(),
      gameId: 'dapper-duck',
      data: data
    };
    
    gameActivity.push(activity);
    
    // Save to localStorage for Abstract Portal
    const existingActivity = JSON.parse(localStorage.getItem('dapperDuck_gameActivity') || '[]');
    existingActivity.push(activity);
    localStorage.setItem('dapperDuck_gameActivity', JSON.stringify(existingActivity));
    
    console.log('Game Activity tracked:', activity);
  }

  // Initialize stats
  loadStats();

  // Hi-DPI fullscreen cover mapping
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let scale = 1, offsetX = 0, offsetY = 0;

  function resize() {
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    scale = Math.max(cssW / VIRTUAL_WIDTH, cssH / VIRTUAL_HEIGHT);
    offsetX = (cssW - VIRTUAL_WIDTH * scale) * 0.5;
    offsetY = (cssH - VIRTUAL_HEIGHT * scale) * 0.5;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ---------------- Enhanced State & UI ----------------
  const State = { MENU: 0, PLAY: 1, OVER: 2 };
  let state = State.MENU;

  const elMenu = document.getElementById('menu');
  const elHud = document.getElementById('hud');
  const elOver = document.getElementById('gameOver');
  const elFreeGame = document.getElementById('freeGameBtn');
  const elPaidGame = document.getElementById('paidGameBtn');
  const elRetry = document.getElementById('retryBtn');
  const elScore = document.getElementById('scoreVal');
  const elReason = document.getElementById('reason');
  const elPowerupIndicator = document.getElementById('powerup-indicator');
  const elPowerupText = document.getElementById('powerup-text');
  const elPowerupTimer = document.getElementById('powerup-timer');

  elFreeGame.addEventListener('click', () => startGame(false));
  // Paid game button is disabled - coming soon
  elPaidGame.addEventListener('click', () => {
    alert('Paid games coming soon! Smart contracts are being finalized. 🚀');
  });
  elRetry.addEventListener('click', () => startGame(false)); // Default to free on retry

  function setState(s) {
    state = s;
    elMenu.classList.toggle('hidden', state !== State.MENU);
    elHud.classList.toggle('hidden', state !== State.PLAY);
    elOver.classList.toggle('hidden', state !== State.OVER);
  }

  // ---------------- Enhanced Difficulty System ----------------
  let timeAlive = 0;
  let difficultyLevel = 0;

  function getDifficultyLevel() {
    // More gradual difficulty scaling for longer gameplay
    const baseLevel = timeAlive / 90; // Ramp up over 90 seconds for longer gameplay
    const exponentialFactor = Math.pow(baseLevel, 1.2); // Less aggressive curve for longer survival
    return Math.max(0, Math.min(1, exponentialFactor));
  }

  function getDifficultyMultiplier() {
    const level = getDifficultyLevel();
    return 1 + (level * 2.5); // Up to 3.5x difficulty
  }

  // ---------------- Power-up System ----------------
  let activePowerups = [];
  let powerupEffects = {
    shield: false,
    doubleScore: false,
    slowMotion: false,
    magnet: false
  };

  function activatePowerup(type) {
    const powerup = POWERUP_TYPES[type];
    if (!powerup) return;

    activePowerups.push({
      type: type,
      duration: powerup.duration,
      startTime: timeAlive
    });

    powerupEffects[type.toLowerCase().replace('_', '')] = true;
    gameStats.powerupsCollected++;

    // Visual feedback
    showPowerupNotification(powerup.name, powerup.icon);
  }

  function updatePowerups(dt) {
    for (let i = activePowerups.length - 1; i >= 0; i--) {
      const powerup = activePowerups[i];
      powerup.duration -= dt;
      
      if (powerup.duration <= 0) {
        const effectKey = powerup.type.toLowerCase().replace('_', '');
        powerupEffects[effectKey] = false;
        activePowerups.splice(i, 1);
      }
    }
    
    // Update power-up HUD
    updatePowerupHUD();
  }

  function updatePowerupHUD() {
    if (activePowerups.length === 0) {
      if (elPowerupIndicator) elPowerupIndicator.classList.add('hidden');
      return;
    }

    const currentPowerup = activePowerups[0]; // Show the first active power-up
    const powerup = POWERUP_TYPES[currentPowerup.type];
    
    if (elPowerupIndicator) {
      elPowerupIndicator.classList.remove('hidden');
      elPowerupIndicator.style.borderLeft = `4px solid ${powerup.color}`;
    }
    
    if (elPowerupText) {
      elPowerupText.textContent = `${powerup.icon} ${powerup.name}`;
    }
    
    if (elPowerupTimer) {
      elPowerupTimer.textContent = `${Math.ceil(currentPowerup.duration)}s`;
    }
  }

  function showPowerupNotification(name, icon) {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50 transition-all duration-500';
    notification.innerHTML = `${icon} ${name} Activated!`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
  }

  // ---------------- Enhanced Collision Detection ----------------
  function getPreciseHitbox(obj, scale = 1) {
    const centerX = obj.x + obj.w / 2;
    const centerY = obj.y + obj.h / 2;
    const halfW = (obj.w * scale) / 2;
    const halfH = (obj.h * scale) / 2;
    
    return {
      left: centerX - halfW,
      right: centerX + halfW,
      top: centerY - halfH,
      bottom: centerY + halfH
    };
  }

  function checkCollision(obj1, obj2, scale1 = 1, scale2 = 1) {
    const hitbox1 = getPreciseHitbox(obj1, scale1);
    const hitbox2 = getPreciseHitbox(obj2, scale2);
    
    return !(hitbox1.right < hitbox2.left || 
             hitbox1.left > hitbox2.right || 
             hitbox1.bottom < hitbox2.top || 
             hitbox1.top > hitbox2.bottom);
  }

  // ---------------- Enhanced Input System ----------------
  let inputDown = false;
  let lastInputTime = 0;
  const INPUT_DEBOUNCE = 50; // 50ms debounce

  function onPress(e) {
    const now = Date.now();
    if (now - lastInputTime < INPUT_DEBOUNCE) return;
    lastInputTime = now;

    if (state === State.PLAY) tryFlap();
    inputDown = true;
    if (e && e.preventDefault) e.preventDefault();
  }

  function onRelease() { 
    inputDown = false; 
  }

  // Enhanced input handling
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') onPress(e);
    
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') onRelease();
  });

  ['pointerdown','mousedown','touchstart'].forEach(ev => {
    window.addEventListener(ev, onPress, { passive: false });
  });
  ['pointerup','mouseup','touchend','touchcancel','pointercancel'].forEach(ev => {
    window.addEventListener(ev, onRelease, { passive: true });
  });

  window.addEventListener('blur', onRelease);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onRelease();
  });

  // ---------------- Enhanced Duck Physics ----------------
  const duckImg = new Image();
  duckImg.src = 'assets/duck.png';
  let duckLoaded = false;
  duckImg.onload = () => { duckLoaded = true; };

  const DUCK = { x: 80, y: VIRTUAL_HEIGHT * 0.45, w: 72, h: 72, vy: 0, rot: 0 };
  function applyDuckScale() {
    const base = 72;
    DUCK.w = Math.round(base * DUCK_SCALE);
    DUCK.h = Math.round(base * DUCK_SCALE);
  }
  applyDuckScale();

  let flapTimer = 0;
  function tryFlap() {
    if (flapTimer > 0) return;
    DUCK.vy = Math.max(DUCK.vy + FLAP_IMPULSE, MAX_UP_SPEED);
    flapTimer = FLAP_COOLDOWN;
  }

  // ---------------- Enhanced Background System ----------------
  const clouds = [
    { z: 0.2, speed: 10, blobs: [] },
    { z: 0.5, speed: 20, blobs: [] },
    { z: 0.8, speed: 35, blobs: [] },
  ];

  function initClouds() {
    for (const layer of clouds) {
      layer.blobs = [];
      const count = Math.floor(10 * layer.z) + 7;
      for (let i = 0; i < count; i++) {
        layer.blobs.push({
          x: Math.random() * (VIRTUAL_WIDTH + 200) - 100,
          y: Math.random() * VIRTUAL_HEIGHT,
          r: 20 + Math.random() * 60 * layer.z,
          vx: -layer.speed * (0.8 + Math.random() * 0.4),
        });
      }
    }
  }
  initClouds();

  let worldX = 0;
  let last = performance.now();
  let score = 0;

  // ---------------- Enhanced FUD System ----------------
  const fudImages = [new Image(), new Image(), new Image(), new Image()];
  const fudPaths = ['assets/fudbag1.png','assets/fudbag2.png','assets/fudbag3.png','assets/fudbag4.png'];
  let fudLoadedCount = 0;
  for (let i = 0; i < fudImages.length; i++) {
    fudImages[i].src = fudPaths[i];
    fudImages[i].onload = () => { fudLoadedCount++; };
  }

  const fudList = [];
  let fudSpawnTimer = 0;
  
  // Zero-score FUD bags (special penalty bags)
  const zeroScoreFudList = [];
  let zeroScoreFudSpawnTimer = 0;

  function spawnFudBag() {
    const img = fudImages[Math.floor(Math.random() * fudImages.length)];
    const margin = Math.max(TOP_DEAD_ZONE, BOTTOM_DEAD_ZONE) + 30;
    const difficulty = getDifficultyLevel();
    
    // More aggressive patterns at higher difficulty
    const verticalDrift = difficulty > 0.5 ? (Math.random() * 80 - 40) : (Math.random() * 20 - 10);
    const sizeVariation = difficulty > 0.7 ? (0.8 + Math.random() * 0.4) : 1;
    
    const fud = {
      x: VIRTUAL_WIDTH + 40,
      y: Math.random() * (VIRTUAL_HEIGHT - margin*2 - FUD_SIZE) + margin,
      w: FUD_SIZE * sizeVariation,
      h: FUD_SIZE * sizeVariation,
      img,
      vy: verticalDrift,
      originalSize: FUD_SIZE * sizeVariation
    };
    fudList.push(fud);
  }

  function spawnZeroScoreFudBag() {
    const img = fudImages[Math.floor(Math.random() * fudImages.length)];
    const margin = Math.max(TOP_DEAD_ZONE, BOTTOM_DEAD_ZONE) + 30;
    const difficulty = getDifficultyLevel();
    
    // Zero-score FUD bags are less frequent and get more frequent over time
    const verticalDrift = difficulty > 0.5 ? (Math.random() * 80 - 40) : (Math.random() * 20 - 10);
    const sizeVariation = difficulty > 0.7 ? (0.8 + Math.random() * 0.4) : 1;
    
    const fud = {
      x: VIRTUAL_WIDTH + 40,
      y: Math.random() * (VIRTUAL_HEIGHT - margin*2 - FUD_SIZE) + margin,
      w: FUD_SIZE * sizeVariation,
      h: FUD_SIZE * sizeVariation,
      img,
      vy: verticalDrift,
      originalSize: FUD_SIZE * sizeVariation,
      isZeroScore: true // Mark as zero-score FUD
    };
    zeroScoreFudList.push(fud);
  }

  function updateFud(dt) {
    if (state !== State.PLAY || fudLoadedCount < fudImages.length) return;

    const difficulty = getDifficultyLevel();
    const multiplier = getDifficultyMultiplier();

    // More aggressive scaling
    let maxFud = Math.round(lerp(FUD_MAX_COUNT_START, FUD_MAX_COUNT_END, difficulty));
    let interval = lerp(FUD_SPAWN_MIN, FUD_SPAWN_MAX, difficulty);
    let speed = lerp(FUD_SPEED_MIN, FUD_SPEED_MAX, difficulty);

    // Insanity mode makes everything more intense
    if (insanityMode) {
      interval *= 0.3; // Much faster spawning
      maxFud = Math.min(5, maxFud + 2); // More FUD bags
      speed *= 1.5; // Faster FUD bags
    }

    fudSpawnTimer -= dt;
    if (fudSpawnTimer <= 0 && fudList.length < maxFud) {
      spawnFudBag();
      // More random spawning intervals
      fudSpawnTimer = interval * (0.3 + Math.random() * 1.4);
    }

    // Apply slow motion effect
    const effectiveSpeed = powerupEffects.slowmotion ? speed * 0.3 : speed;
    const effectiveDt = powerupEffects.slowmotion ? dt * 0.3 : dt;

    for (const fb of fudList) {
      fb.x -= effectiveSpeed * effectiveDt;
      fb.y += fb.vy * effectiveDt;
      
      // Keep within bounds
      if (fb.y < TOP_DEAD_ZONE + 8) fb.y = TOP_DEAD_ZONE + 8;
      if (fb.y + fb.h > VIRTUAL_HEIGHT - BOTTOM_DEAD_ZONE - 8) {
        fb.y = VIRTUAL_HEIGHT - BOTTOM_DEAD_ZONE - 8 - fb.h;
      }
    }

    // Cleanup
    for (let i = fudList.length - 1; i >= 0; i--) {
      if (fudList[i].x + fudList[i].w <= 0) {
        fudList.splice(i, 1);
        gameStats.totalFudDodged++;
      }
    }

    // Update zero-score FUD bags (less frequent spawning)
    const zeroScoreSpawnInterval = interval * 3; // 3x less frequent than regular FUD
    const maxZeroScoreFud = Math.min(2, Math.floor(difficulty * 2)); // Max 2 zero-score FUD bags
    
    zeroScoreFudSpawnTimer -= dt;
    if (zeroScoreFudSpawnTimer <= 0 && zeroScoreFudList.length < maxZeroScoreFud) {
      spawnZeroScoreFudBag();
      zeroScoreFudSpawnTimer = zeroScoreSpawnInterval * (0.5 + Math.random() * 1.5);
    }

    // Update zero-score FUD bag positions
    for (const fb of zeroScoreFudList) {
      fb.x -= effectiveSpeed * effectiveDt;
      fb.y += fb.vy * effectiveDt;
      
      // Keep within bounds
      if (fb.y < TOP_DEAD_ZONE) {
        fb.y = TOP_DEAD_ZONE;
        fb.vy = Math.abs(fb.vy);
      } else if (fb.y + fb.h > VIRTUAL_HEIGHT - BOTTOM_DEAD_ZONE) {
        fb.y = VIRTUAL_HEIGHT - BOTTOM_DEAD_ZONE - fb.h;
        fb.vy = -Math.abs(fb.vy);
      }
    }

    // Cleanup zero-score FUD bags
    for (let i = zeroScoreFudList.length - 1; i >= 0; i--) {
      if (zeroScoreFudList[i].x + zeroScoreFudList[i].w <= 0) {
        zeroScoreFudList.splice(i, 1);
        gameStats.totalFudDodged++;
      }
    }
  }

  function drawFud() {
    if (fudLoadedCount < fudImages.length) return;

    // Enhanced shadows with difficulty-based opacity
    ctx.save();
    const difficulty = getDifficultyLevel();
    ctx.globalAlpha = 0.15 + (difficulty * 0.1);
    
    for (const fb of fudList) {
      ctx.beginPath();
      ctx.ellipse(fb.x + fb.w*0.5, fb.y + fb.h*0.85, fb.w*0.45, fb.h*0.18, 0, 0, Math.PI*2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }
    ctx.restore();

    // Draw FUD bags with enhanced effects
    for (const fb of fudList) {
      ctx.save();
      
      // Add glow effect at high difficulty
      if (difficulty > 0.7) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
      }
      
      ctx.drawImage(fb.img, fb.x, fb.y, fb.w, fb.h);
      ctx.restore();
      
    }

    // Draw zero-score FUD bags with skull and crossbones overlay
    for (const fb of zeroScoreFudList) {
      ctx.save();
      
      // Draw the base FUD bag image
      ctx.drawImage(fb.img, fb.x, fb.y, fb.w, fb.h);
      
      // Add a dark overlay to make the skull more visible
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
      
      // Draw skull and crossbones overlay
      const centerX = fb.x + fb.w / 2;
      const centerY = fb.y + fb.h / 2;
      const skullSize = Math.min(fb.w, fb.h) * 0.6;
      
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      
      // Draw skull
      ctx.beginPath();
      ctx.arc(centerX, centerY - skullSize * 0.1, skullSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw eye sockets
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX - skullSize * 0.08, centerY - skullSize * 0.15, skullSize * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + skullSize * 0.08, centerY - skullSize * 0.15, skullSize * 0.05, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw nose
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - skullSize * 0.05);
      ctx.lineTo(centerX - skullSize * 0.03, centerY + skullSize * 0.05);
      ctx.lineTo(centerX + skullSize * 0.03, centerY + skullSize * 0.05);
      ctx.closePath();
      ctx.fill();
      
      // Draw jaw
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY + skullSize * 0.1, skullSize * 0.2, 0, Math.PI);
      ctx.stroke();
      
      // Draw crossbones
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      
      // First bone (top-left to bottom-right)
      ctx.beginPath();
      ctx.moveTo(centerX - skullSize * 0.3, centerY + skullSize * 0.1);
      ctx.lineTo(centerX + skullSize * 0.3, centerY - skullSize * 0.1);
      ctx.stroke();
      
      // Second bone (top-right to bottom-left)
      ctx.beginPath();
      ctx.moveTo(centerX + skullSize * 0.3, centerY + skullSize * 0.1);
      ctx.lineTo(centerX - skullSize * 0.3, centerY - skullSize * 0.1);
      ctx.stroke();
      
      // No red border - skull and crossbones are enough visual distinction
      
      ctx.restore();
      
    }
  }

  function checkFudCollision() {
    if (fudLoadedCount < fudImages.length || powerupEffects.shield) return;

    // Check regular FUD bag collisions
    for (const fb of fudList) {
      if (checkCollision(DUCK, fb, DUCK_HITBOX_SCALE, FUD_HITBOX_SCALE)) {
        gameOver('Hit by FUD!');
        return;
      }
    }

    // Check zero-score FUD bag collisions (game over with zero score)
    for (const fb of zeroScoreFudList) {
      if (checkCollision(DUCK, fb, DUCK_HITBOX_SCALE, FUD_HITBOX_SCALE)) {
        // Reset score to zero before game over
        score = 0;
        elScore.textContent = '0';
        
        // Track the penalty for Abstract XP
        trackXPEvent('zero_score_penalty', {
          previousScore: score,
          penaltyType: 'zero_score_fud_hit'
        });
        
        // Game over with zero score
        gameOver('Hit by Zero-Score FUD! Score reset to 0!');
        return;
      }
    }
  }

  // ---------------- Enhanced Snack System ----------------
  const snackImages = [new Image(), new Image(), new Image(), new Image()];
  const snackPaths = ['assets/snack1.png','assets/snack2.png','assets/snack3.png','assets/snack4.png'];
  let snackLoadedCount = 0;
  for (let i = 0; i < snackImages.length; i++) {
    snackImages[i].src = snackPaths[i];
    snackImages[i].onload = () => { snackLoadedCount++; };
  }

  const SNACK_TABLE = [
    { idx: 0, weight: 6, points: 50 },
    { idx: 1, weight: 3, points: 100 },
    { idx: 2, weight: 1.5, points: 150 },
    { idx: 3, weight: 0.5, points: 300 },
  ];

  function pickWeightedSnack() {
    let total = 0;
    for (const s of SNACK_TABLE) total += s.weight;
    let r = Math.random() * total;
    for (const s of SNACK_TABLE) {
      if (r < s.weight) return s;
      r -= s.weight;
    }
    return SNACK_TABLE[0];
  }

  let snackList = [];
  let snackRespawnTimer = 0;
  const snackFx = [];
  let lastSnackPoints = 0;

  function spawnSnack() {
    const choice = pickWeightedSnack();
    const img = snackImages[choice.idx];
    lastSnackPoints = choice.points;

    const margin = Math.max(TOP_DEAD_ZONE, BOTTOM_DEAD_ZONE) + 24;
    const snack = {
      x: VIRTUAL_WIDTH + 40,
      y: Math.random() * (VIRTUAL_HEIGHT - margin*2 - SNACK_SIZE) + margin,
      w: SNACK_SIZE,
      h: SNACK_SIZE,
      img,
      t: 0,
      points: choice.points
    };
    snackList.push(snack);
  }

  function updateSnacks(dt) {
    if (state !== State.PLAY || snackLoadedCount < snackImages.length) return;

    // Spawn new snacks
    snackRespawnTimer -= dt;
    if (snackRespawnTimer <= 0) {
      const difficulty = getDifficultyLevel();
      // More progressive snack scaling - more snacks as time goes on
      let maxSnacks = Math.min(4, Math.floor(1 + difficulty * 3)); // Up to 4 snacks at high difficulty (increased from 3)
      
      // More snacks during insanity moments
      if (insanityMode) {
        maxSnacks = Math.min(6, maxSnacks + 2); // Up to 6 snacks during insanity (increased from 5)
      }
      
      if (snackList.length < maxSnacks) {
        spawnSnack();
        // Progressive respawn time - faster spawning as difficulty increases
        let baseRespawnTime = SNACK_RESPAWN_MIN + Math.random() * (SNACK_RESPAWN_MAX - SNACK_RESPAWN_MIN);
        let respawnTime = baseRespawnTime * (1 - difficulty * 0.4); // Up to 40% faster at high difficulty
        
        if (insanityMode) {
          respawnTime *= 0.4; // Even faster snack spawning during insanity (reduced from 0.5)
        }
        snackRespawnTimer = respawnTime;
      }
    }

    // Update all snacks
    for (let i = snackList.length - 1; i >= 0; i--) {
      const snack = snackList[i];
      snack.t += dt;
      
      // Progressive snack speed - faster as difficulty increases
      const difficulty = getDifficultyLevel();
      const snackSpeed = lerp(SNACK_SPEED_MIN, SNACK_SPEED_MAX, difficulty);
      snack.x -= snackSpeed * dt;

      // Magnet effect
      if (powerupEffects.magnet) {
        const dx = DUCK.x - snack.x;
        const dy = DUCK.y - snack.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 100) {
          const pullStrength = (100 - distance) / 100 * 200;
          snack.x += (dx / distance) * pullStrength * dt;
          snack.y += (dy / distance) * pullStrength * dt;
        }
      }

      // Remove snacks that are off screen
      if (snack.x + snack.w <= 0) {
        snackList.splice(i, 1);
      }
    }
  }

  function drawSnacks() {
    if (snackList.length === 0 || snackLoadedCount < snackImages.length) return;

    for (const snack of snackList) {
      const bob = Math.sin(snack.t * Math.PI * 2 * SNACK_BOB_FREQ) * SNACK_BOB_AMPL;

      // Enhanced shadow
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(snack.x + snack.w*0.5, snack.y + snack.h*0.85 + bob, 
                  snack.w*0.40, snack.h*0.16, 0, 0, Math.PI*2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      // Magnet glow effect
      if (powerupEffects.magnet) {
        ctx.save();
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
      }

      ctx.drawImage(snack.img, snack.x, snack.y + bob, snack.w, snack.h);
      
      if (powerupEffects.magnet) {
        ctx.restore();
      }
    }

    // Enhanced "+points" FX
    for (let i = snackFx.length - 1; i >= 0; i--) {
      const fx = snackFx[i];
      fx.t += dtGlobal;
      const life = 0.7;
      const p = Math.min(1, fx.t / life);
      const y = fx.y - p * 28;
      const alpha = 1 - p;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fx.color || '#1b1b1b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(fx.text, fx.x, y);
      ctx.restore();
      if (p >= 1) snackFx.splice(i, 1);
    }
    
  }

  function checkSnackCollision() {
    if (snackList.length === 0 || snackLoadedCount < snackImages.length) return;

    for (let i = snackList.length - 1; i >= 0; i--) {
      const snack = snackList[i];
      
      if (checkCollision(DUCK, snack, DUCK_HITBOX_SCALE, SNACK_HITBOX_SCALE)) {
        let points = snack.points;
        
        // Double score effect
        if (powerupEffects.doublescore) {
          points *= 2;
        }
        
        score += points;
        elScore.textContent = Math.floor(score).toString();
        gameStats.totalSnacks++;
        
        // Track snack collection for Abstract XP
        trackXPEvent('snack_collected', {
          points: points,
          totalScore: score,
          snackType: 'meme_snack'
        });
        
        trackGameActivity('snack_collected', {
          points: points,
          totalScore: score
        });
        
        // Enhanced FX
        snackFx.push({ 
          x: snack.x + snack.w * 0.2, 
          y: snack.y, 
          t: 0, 
          text: `+${points}`,
          color: powerupEffects.doublescore ? '#F59E0B' : '#1b1b1b'
        });
        
        snackList.splice(i, 1);
        break; // Only collect one snack per frame
      }
    }
  }

  // ---------------- Power-up System Implementation ----------------
  let activePowerup = null;
  let powerupRespawnTimer = 0;

  function spawnPowerup() {
    if (Math.random() > POWERUP_SPAWN_CHANCE) return;
    
    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const powerup = POWERUP_TYPES[type];
    
    const margin = Math.max(TOP_DEAD_ZONE, BOTTOM_DEAD_ZONE) + 20;
    activePowerup = {
      x: VIRTUAL_WIDTH + 40,
      y: Math.random() * (VIRTUAL_HEIGHT - margin*2 - POWERUP_SIZE) + margin,
      w: POWERUP_SIZE,
      h: POWERUP_SIZE,
      type: type,
      color: powerup.color,
      icon: powerup.icon,
      t: 0
    };
  }

  function updatePowerup(dt) {
    if (state !== State.PLAY) return;

    if (!activePowerup) {
      powerupRespawnTimer -= dt;
      if (powerupRespawnTimer <= 0) {
        spawnPowerup();
        powerupRespawnTimer = 8 + Math.random() * 12; // Spawn every 8-20 seconds
      }
      return;
    }

    activePowerup.t += dt;
    activePowerup.x -= POWERUP_SPEED * dt;

    if (activePowerup.x + activePowerup.w <= 0) {
      activePowerup = null;
      powerupRespawnTimer = 8 + Math.random() * 12;
    }
  }

  function drawPowerup() {
    if (!activePowerup) return;

    const bob = Math.sin(activePowerup.t * Math.PI * 2 * 2) * 8;
    const glow = Math.sin(activePowerup.t * Math.PI * 2 * 3) * 0.3 + 0.7;

    // Glowing effect
    ctx.save();
    ctx.shadowColor = activePowerup.color;
    ctx.shadowBlur = 20 * glow;
    ctx.globalAlpha = 0.8 + glow * 0.2;
    
    // Background circle
    ctx.fillStyle = activePowerup.color;
    ctx.beginPath();
    ctx.arc(activePowerup.x + activePowerup.w/2, activePowerup.y + activePowerup.h/2 + bob, 
            activePowerup.w/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activePowerup.icon, activePowerup.x + activePowerup.w/2, 
                 activePowerup.y + activePowerup.h/2 + bob);
    
    ctx.restore();
    
  }

  function checkPowerupCollision() {
    if (!activePowerup) return;

    if (checkCollision(DUCK, activePowerup, DUCK_HITBOX_SCALE, 0.8)) {
      // Track power-up collection for Abstract XP
      trackXPEvent('powerup_collected', {
        powerupType: activePowerup.type,
        totalScore: score
      });
      
      trackGameActivity('powerup_collected', {
        powerupType: activePowerup.type,
        totalScore: score
      });
      
      activatePowerup(activePowerup.type);
      activePowerup = null;
      powerupRespawnTimer = 8 + Math.random() * 12;
    }
  }

  // ---------------- Enhanced Physics System ----------------
  function physicsStep(dt) {
    // Enhanced cloud movement
    for (const layer of clouds) {
      for (const b of layer.blobs) {
        b.x += b.vx * dt;
        if (b.x < -150) {
          b.x = VIRTUAL_WIDTH + 100;
          b.y = Math.random() * VIRTUAL_HEIGHT;
          b.r = 20 + Math.random() * 60 * layer.z;
        }
      }
    }

    // Enhanced duck physics
    DUCK.vy += GRAVITY * dt;
    if (inputDown) DUCK.vy += GLIDE_THRUST * dt;

    const dragPerStep = Math.pow(DRAG, dt);
    DUCK.vy *= dragPerStep;

    if (DUCK.vy > MAX_FALL_SPEED) DUCK.vy = MAX_FALL_SPEED;
    if (DUCK.vy < MAX_UP_SPEED) DUCK.vy = MAX_UP_SPEED;

    DUCK.y += DUCK.vy * dt;

    // Enhanced rotation with smoother transitions
    const target = clamp(map(DUCK.vy, -600, 900, -0.55, 0.95), -0.8, 1.0);
    const ease = 1 - Math.exp(-dt * 20); // Slightly faster rotation
    DUCK.rot += (target - DUCK.rot) * ease;

    // Enhanced bounds checking
    if (DUCK.y < TOP_DEAD_ZONE) gameOver('You flew too high!');
    else if (DUCK.y + DUCK.h > VIRTUAL_HEIGHT - BOTTOM_DEAD_ZONE) gameOver('You fell!');

    flapTimer -= dt;
    if (flapTimer < 0) flapTimer = 0;
  }

  // ---------------- Enhanced Drawing System ----------------
  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    g.addColorStop(0, '#fff9e6');
    g.addColorStop(1, '#ffe39f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Enhanced sun with difficulty-based intensity
    const difficulty = getDifficultyLevel();
    ctx.save();
    ctx.globalAlpha = 0.35 + (difficulty * 0.15);
    ctx.beginPath();
    ctx.arc(VIRTUAL_WIDTH - 70, 90, 60, 0, Math.PI * 2);
    ctx.fillStyle = difficulty > 0.5 ? '#ff6b6b' : '#ffd166';
    ctx.fill();
    ctx.restore();

    // Enhanced clouds
    for (const layer of clouds) {
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

  function drawDuck() {
    if (!duckLoaded) return;
    
    const cx = DUCK.x + DUCK.w / 2;
    const cy = DUCK.y + DUCK.h / 2;
    
    ctx.save();
    
    // Shield effect
    if (powerupEffects.shield) {
      ctx.shadowColor = '#4F46E5';
      ctx.shadowBlur = 25;
      ctx.globalAlpha = 0.8;
    }
    
    ctx.translate(cx, cy);
    ctx.rotate(DUCK.rot);
    ctx.drawImage(duckImg, -DUCK.w/2, -DUCK.h/2, DUCK.w, DUCK.h);
    ctx.restore();
    
  }

  // ---------------- Insanity Moments System ----------------
  function updateInsanityMoments(dt) {
    if (insanityMode) {
      insanityTimer += dt;
      if (insanityTimer >= insanityDuration) {
        insanityMode = false;
        insanityTimer = 0;
        console.log('Insanity mode ended');
      }
    } else {
      // Check if we should start an insanity moment
      const timeSinceLastInsanity = timeAlive - lastInsanityTime;
      const difficulty = getDifficultyLevel();
      
      // Very rare insanity moments - only after 60 seconds and with very low chance
      const insanityChance = timeAlive > 60 ? Math.min(0.005, difficulty * 0.003) : 0; // Up to 0.5% chance per second, only after 60s
      
      if (timeSinceLastInsanity > 45 && Math.random() < insanityChance * dt) {
        startInsanityMoment();
      }
    }
  }

  function startInsanityMoment() {
    insanityMode = true;
    insanityDuration = 3 + Math.random() * 4; // 3-7 seconds
    insanityTimer = 0;
    lastInsanityTime = timeAlive;
    console.log('INSANITY MODE ACTIVATED!', insanityDuration.toFixed(1) + 's');
    
    // Visual feedback
    showPowerupNotification('INSANITY MODE!', '💀');
  }

  // ---------------- Enhanced Game Loop ----------------
  let dtGlobal = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    dtGlobal = dt;

    if (state === State.PLAY) {
      timeAlive += dt;
      difficultyLevel = getDifficultyLevel();

      // Update insanity moments
      updateInsanityMoments(dt);

      physicsStep(dt);
      updatePowerups(dt);
      updateFud(dt);
      checkFudCollision();
      updateSnacks(dt);
      checkSnackCollision();
      updatePowerup(dt);
      checkPowerupCollision();
    }

    // Enhanced rendering
    drawBackground();
    drawDuck();
    drawFud();
    drawSnacks();
    drawPowerup();

    requestAnimationFrame(loop);
  }

  // ---------------- Enhanced Game Management ----------------
  function startGame(isPaid = false) {
    worldX = 0;
    timeAlive = 0;
    score = 0;
    difficultyLevel = 0;
    elScore.textContent = '0';
    
    // Store game type for leaderboard
    window.currentGameType = isPaid ? 'paid' : 'free';
    
    // Track game start for Abstract XP
    trackXPEvent('game_start', {
      gameType: isPaid ? 'paid' : 'free',
      timestamp: Date.now()
    });
    
    trackGameActivity('game_started', {
      gameType: isPaid ? 'paid' : 'free'
    });
    
    // Track paid game revenue
    if (isPaid) {
      trackPaidGameRevenue();
    }

    DUCK.x = 80;
    DUCK.y = VIRTUAL_HEIGHT * 0.45;
    DUCK.vy = 0;
    DUCK.rot = 0;
    flapTimer = 0;

    // Reset all systems
    fudList.length = 0;
    fudSpawnTimer = 0;
    zeroScoreFudList.length = 0;
    zeroScoreFudSpawnTimer = 0;
    snackList.length = 0;
    snackRespawnTimer = 0;
    snackFx.length = 0;
    activePowerup = null;
    powerupRespawnTimer = 0;
    activePowerups.length = 0;
    
    // Reset insanity system
    insanityMode = false;
    insanityTimer = 0;
    insanityDuration = 0;
    lastInsanityTime = 0;
    
    // Reset powerup effects
    Object.keys(powerupEffects).forEach(key => {
      powerupEffects[key] = false;
    });

    initClouds();
    setState(State.PLAY);
  }

  function gameOver(reason = 'Ouch!') {
    // Update stats
    gameStats.gamesPlayed++;
    gameStats.totalPlayTime += timeAlive;
    
    // Track game end for Abstract XP
    trackXPEvent('game_end', {
      score: score,
      timeAlive: timeAlive,
      reason: reason,
      gameType: window.currentGameType || 'free'
    });
    
    trackGameActivity('game_completed', {
      score: score,
      timeAlive: timeAlive,
      reason: reason
    });
    
    if (score > gameStats.bestScore) {
      gameStats.bestScore = score;
      
      // Track high score for Abstract XP
      trackXPEvent('high_score', {
        score: score,
        previousBest: gameStats.bestScore
      });
      
      // Check for achievements
      if (score >= 1000 && !gameStats.achievements.includes('first_thousand')) {
        gameStats.achievements.push('first_thousand');
      }
      if (score >= 5000 && !gameStats.achievements.includes('high_scorer')) {
        gameStats.achievements.push('high_scorer');
      }
      if (timeAlive >= 30 && !gameStats.achievements.includes('survivor')) {
        gameStats.achievements.push('survivor');
      }
    }
    
    // Save to leaderboard if score is high enough
    if (score >= 100) {
      saveToLeaderboard();
    }
    
    saveStats();
    setState(State.OVER);
    elReason.textContent = reason;
    
    // Update final score display
    const finalScoreEl = document.getElementById('finalScoreVal');
    if (finalScoreEl) {
      finalScoreEl.textContent = score.toLocaleString();
    }
  }

  // Weekly reward distribution functions
  function distributeWeeklyRewards() {
    try {
      const revenueData = JSON.parse(localStorage.getItem('dapperDuck_revenue') || '{"weeklyPool": 0, "treasuryBalance": 0, "totalRevenue": 0}');
      const leaderboardData = JSON.parse(localStorage.getItem('dapperDuck_leaderboard') || '[]');
      
      if (revenueData.weeklyPool > 0 && leaderboardData.length > 0) {
        // Get top 15 players
        const top15 = leaderboardData.slice(0, 15);
        const totalPool = revenueData.weeklyPool;
        
        // Reward distribution percentages
        const rewardPercentages = [
          0.25, // 1st place - 25%
          0.15, 0.15, // 2nd-3rd place - 15% each
          0.08, 0.08, 0.08, // 4th-6th place - 8% each
          0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03 // 7th-15th place - 3% each
        ];
        
        // Distribute rewards
        const rewards = top15.map((player, index) => {
          const percentage = rewardPercentages[index] || 0;
          const reward = totalPool * percentage;
          return {
            player: player.name,
            position: index + 1,
            reward: reward,
            percentage: percentage * 100
          };
        });
        
        // Reset weekly pool
        revenueData.weeklyPool = 0;
        localStorage.setItem('dapperDuck_revenue', JSON.stringify(revenueData));
        
        // Save reward distribution
        localStorage.setItem('dapperDuck_weeklyRewards', JSON.stringify({
          timestamp: Date.now(),
          totalPool: totalPool,
          rewards: rewards
        }));
        
        console.log('Weekly rewards distributed:', rewards);
        
        // Trigger reward distribution event
        window.dispatchEvent(new CustomEvent('rewardsDistributed', { 
          detail: { rewards, totalPool } 
        }));
      }
    } catch (error) {
      console.error('Error distributing weekly rewards:', error);
    }
  }

  // Revenue tracking functions
  function trackPaidGameRevenue() {
    try {
      const PAID_GAME_FEE = 0.001; // 0.001 ETH per paid game
      
      // Get existing revenue data
      const revenueData = JSON.parse(localStorage.getItem('dapperDuck_revenue') || '{"weeklyPool": 0, "treasuryBalance": 0, "totalRevenue": 0}');
      
      // Add new revenue
      revenueData.totalRevenue += PAID_GAME_FEE;
      
      // Split 50/50 between player rewards and treasury
      const playerReward = PAID_GAME_FEE * 0.5;
      const treasuryAmount = PAID_GAME_FEE * 0.5;
      
      revenueData.weeklyPool += playerReward;
      revenueData.treasuryBalance += treasuryAmount;
      
      // Save updated revenue data
      localStorage.setItem('dapperDuck_revenue', JSON.stringify(revenueData));
      
      console.log('Paid game revenue tracked:', {
        fee: PAID_GAME_FEE,
        playerReward: playerReward,
        treasuryAmount: treasuryAmount,
        totalRevenue: revenueData.totalRevenue
      });
      
      // Trigger revenue update event for UI
      window.dispatchEvent(new CustomEvent('revenueUpdated', { 
        detail: { 
          weeklyPool: revenueData.weeklyPool, 
          treasuryBalance: revenueData.treasuryBalance 
        } 
      }));
      
    } catch (error) {
      console.error('Error tracking paid game revenue:', error);
    }
  }

  // Leaderboard functions
  function saveToLeaderboard() {
    try {
      console.log('saveToLeaderboard called, window.getProfileData exists:', !!window.getProfileData);
      
      let playerName = 'Anonymous Player';
      let profileData = {};
      
      if (window.getProfileData) {
        profileData = window.getProfileData();
        console.log('getProfileData returned:', profileData);
        playerName = profileData.name || 'Anonymous Player';
        console.log('Using player name:', playerName);
      } else {
        console.log('window.getProfileData not available');
      }
      
      const isPaid = window.currentGameType === 'paid';
      
      const leaderboardEntry = {
        id: Date.now().toString(),
        name: playerName,
        score: score,
        timestamp: Date.now(),
        isPaid: isPaid,
        profilePicture: profileData.picture || null,
        socials: profileData.socials || null
      };
      
      // Get existing leaderboard
      const existingLeaderboard = JSON.parse(localStorage.getItem('dapperDuck_leaderboard') || '[]');
      
      // Add new entry
      existingLeaderboard.push(leaderboardEntry);
      
      // Sort by score (highest first)
      existingLeaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 50 entries
      const topEntries = existingLeaderboard.slice(0, 50);
      
      // Save back to localStorage
      localStorage.setItem('dapperDuck_leaderboard', JSON.stringify(topEntries));
      
      console.log('Score saved to leaderboard:', leaderboardEntry);
    } catch (error) {
      console.error('Error saving to leaderboard:', error);
    }
  }

  // Utility functions
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function map(v, inMin, inMax, outMin, outMax) {
    const t = (v - inMin) / (inMax - inMin);
    return outMin + (outMax - outMin) * t;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Expose stats for profile page
  window.getGameStats = () => gameStats;
  
  // Expose revenue functions to window for external access
  window.distributeWeeklyRewards = distributeWeeklyRewards;
  window.trackPaidGameRevenue = trackPaidGameRevenue;

  // Start the game
  setState(State.MENU);
  requestAnimationFrame(loop);
})();
