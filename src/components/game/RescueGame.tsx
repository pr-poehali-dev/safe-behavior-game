import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

type DisasterMode = "flood" | "earthquake";
type GamePhase = "menu" | "playing" | "gameover" | "win";

interface RescueGameProps {
  onComplete?: (score: number) => void;
}

// ── КОНСТАНТЫ ──────────────────────────────────────────────────────────────
const TILE = 32;
const COLS = 12;
const ROWS = 16;
const W = TILE * COLS;
const H = TILE * ROWS;

// ── ЦВЕТА (пиксельная палитра) ──────────────────────────────────────────────
const C = {
  // Наводнение
  water1: "#4a9ede",
  water2: "#3a8ece",
  waterDark: "#2a7ebe",
  roof: "#c0392b",
  roofDark: "#a93226",
  wallWet: "#7f8c8d",
  log: "#8B6914",
  logDark: "#6B5014",
  debris: "#95a5a6",
  // Землетрясение
  ground: "#c8b99a",
  groundDark: "#b8a98a",
  rubble: "#7f8c8d",
  rubbleDark: "#606870",
  safeZone: "#27ae60",
  safeZoneLight: "#2ecc71",
  dust: "#d5c9b8",
  crack: "#5d4037",
  // Общее
  rescuer: "#e74c3c",
  rescuerDark: "#c0392b",
  helmet: "#f39c12",
  survivor: "#3498db",
  survivorSkin: "#f5cba7",
  doctor: "#ecf0f1",
  doctorCross: "#e74c3c",
  rescued: "#27ae60",
  black: "#1a1a2e",
  white: "#f8f9fa",
  hudBg: "#1a1a2e",
  hudText: "#f8f9fa",
  obstacle: "#636e72",
  obstacleDark: "#4a5568",
};

// ── ТИПЫ ────────────────────────────────────────────────────────────────────
interface Vec { x: number; y: number }

interface Survivor {
  id: number;
  x: number; y: number;
  rescued: boolean;
  visible: boolean;  // для землетрясения — изначально скрыт
  found: boolean;    // нашли (раскопали)
  carried: boolean;
  blinkT: number;
  waveT: number;
}

interface Obstacle {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  type: "log" | "barrel" | "debris" | "rubble" | "crack";
}

interface SafeZone {
  x: number; y: number;
  w: number; h: number;
}

interface Building {
  x: number; y: number;
  w: number; h: number;
  collapsed: boolean;
  roofColor: string;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  color: string;
  size: number;
}

interface GameState {
  mode: DisasterMode;
  player: Vec & { dir: "up" | "down" | "left" | "right" };
  survivors: Survivor[];
  obstacles: Obstacle[];
  safeZone: SafeZone;
  buildings: Building[];
  particles: Particle[];
  carrying: number | null; // survivor id
  rescued: number;
  total: number;
  timeLeft: number;
  score: number;
  cameraY: number;
  waterAnim: number;
  searching: boolean;   // копаем обломки
  searchProgress: number;
  searchTarget: number | null;
}

// ── ГЕНЕРАЦИЯ КАРТ ───────────────────────────────────────────────────────────
function generateFloodMap(): Omit<GameState, "mode" | "timeLeft" | "score" | "waterAnim" | "particles"> {
  const buildings: Building[] = [];
  const roofColors = [C.roof, "#8e44ad", "#16a085", "#d35400", "#2c3e50"];

  // Генерируем "острова" — крыши домов в воде
  const positions: Vec[] = [];
  const grid = [
    { x: 1, y: 2 }, { x: 5, y: 2 }, { x: 9, y: 2 },
    { x: 2, y: 6 }, { x: 7, y: 6 },
    { x: 0, y: 10 }, { x: 4, y: 10 }, { x: 8, y: 10 },
    { x: 2, y: 13 }, { x: 6, y: 13 },
  ];

  grid.forEach((pos, i) => {
    buildings.push({
      x: pos.x * TILE,
      y: pos.y * TILE,
      w: TILE * 2,
      h: TILE * 2,
      collapsed: false,
      roofColor: roofColors[i % roofColors.length],
    });
    positions.push({ x: pos.x * TILE + TILE / 2, y: pos.y * TILE + TILE / 2 });
  });

  const survivors: Survivor[] = positions.slice(0, 8).map((pos, i) => ({
    id: i,
    x: pos.x,
    y: pos.y,
    rescued: false,
    visible: true,
    found: true,
    carried: false,
    blinkT: Math.random() * Math.PI * 2,
    waveT: Math.random() * Math.PI * 2,
  }));

  const obstacles: Obstacle[] = [];
  for (let i = 0; i < 12; i++) {
    obstacles.push({
      x: Math.random() * (W - TILE),
      y: Math.random() * (H * 2 - TILE),
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      w: TILE + Math.floor(Math.random() * TILE),
      h: TILE / 2 + Math.floor(Math.random() * TILE / 2),
      type: Math.random() > 0.5 ? "log" : "barrel",
    });
  }

  return {
    player: { x: W / 2, y: H - TILE * 2, dir: "up" },
    survivors,
    obstacles,
    safeZone: { x: W / 2 - TILE * 2, y: H - TILE * 2, w: TILE * 4, h: TILE * 2 },
    buildings,
    cameraY: 0,
    searching: false,
    searchProgress: 0,
    searchTarget: null,
    rescued: 0,
    total: survivors.length,
    carrying: null,
    particles: [],
  };
}

function generateEarthquakeMap(): Omit<GameState, "mode" | "timeLeft" | "score" | "waterAnim" | "particles"> {
  const buildings: Building[] = [];
  const survivors: Survivor[] = [];
  const obstacles: Obstacle[] = [];

  // Улицы и обломки
  const buildingGrid = [
    { x: 0, y: 0, w: 4, h: 3 }, { x: 7, y: 0, w: 5, h: 3 },
    { x: 0, y: 5, w: 3, h: 4 }, { x: 5, y: 5, w: 4, h: 4 },
    { x: 9, y: 5, w: 3, h: 3 },
    { x: 1, y: 11, w: 5, h: 4 }, { x: 8, y: 11, w: 4, h: 4 },
  ];

  const survivorPositions = [
    { x: 2, y: 1 }, { x: 8, y: 1 }, { x: 1, y: 6 }, { x: 6, y: 6 },
    { x: 10, y: 6 }, { x: 3, y: 12 }, { x: 9, y: 12 }, { x: 4, y: 13 },
  ];

  buildingGrid.forEach((b, i) => {
    buildings.push({
      x: b.x * TILE, y: b.y * TILE,
      w: b.w * TILE, h: b.h * TILE,
      collapsed: true,
      roofColor: C.rubble,
    });
  });

  survivorPositions.forEach((pos, i) => {
    survivors.push({
      id: i,
      x: pos.x * TILE + TILE / 2,
      y: pos.y * TILE + TILE / 2,
      rescued: false,
      visible: false,
      found: false,
      carried: false,
      blinkT: Math.random() * Math.PI * 2,
      waveT: Math.random() * Math.PI * 2,
    });
  });

  // Обломки-препятствия на улицах
  const rubbleSpots = [
    { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 3, y: 5 }, { x: 7, y: 4 },
    { x: 4, y: 8 }, { x: 8, y: 9 }, { x: 6, y: 11 }, { x: 5, y: 14 },
  ];
  rubbleSpots.forEach((r) => {
    obstacles.push({
      x: r.x * TILE, y: r.y * TILE,
      vx: 0, vy: 0,
      w: TILE * 1.5, h: TILE,
      type: "rubble",
    });
  });

  return {
    player: { x: 5 * TILE + TILE / 2, y: H - TILE * 1.5, dir: "up" },
    survivors,
    obstacles,
    safeZone: { x: W / 2 - TILE * 3, y: H - TILE * 2, w: TILE * 6, h: TILE * 2 },
    buildings,
    cameraY: 0,
    searching: false,
    searchProgress: 0,
    searchTarget: null,
    rescued: 0,
    total: survivors.length,
    carrying: null,
    particles: [],
  };
}

// ── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
export default function RescueGame({ onComplete }: RescueGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  const [phase, setPhase] = useState<GamePhase>("menu");
  const [selectedMode, setSelectedMode] = useState<DisasterMode | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayRescued, setDisplayRescued] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayTime, setDisplayTime] = useState(120);
  const [displaySearching, setDisplaySearching] = useState(false);
  const [displaySearchProgress, setDisplaySearchProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [dpad, setDpad] = useState({ up: false, down: false, left: false, right: false, action: false });

  useEffect(() => {
    setIsMobile(window.innerWidth < 640 || 'ontouchstart' in window);
  }, []);

  // ── ИНИЦИАЛИЗАЦИЯ ИГРЫ ──────────────────────────────────────────────────
  const startGame = useCallback((mode: DisasterMode) => {
    const mapData = mode === "flood" ? generateFloodMap() : generateEarthquakeMap();
    stateRef.current = {
      mode,
      timeLeft: 120,
      score: 0,
      waterAnim: 0,
      particles: [],
      ...mapData,
    };
    setDisplayTime(120);
    setDisplayRescued(0);
    setDisplayTotal(mapData.total);
    setDisplayScore(0);
    setDisplaySearching(false);
    setPhase("playing");
  }, []);

  // ── ЛОГИКА СТОЛКНОВЕНИЙ ─────────────────────────────────────────────────
  const collidesWithObstacles = useCallback((nx: number, ny: number, gs: GameState): boolean => {
    const pr = 10;
    for (const obs of gs.obstacles) {
      if (obs.vx !== 0 || obs.vy !== 0) {
        // Плавающий объект — угроза
        const dx = nx - (obs.x + obs.w / 2);
        const dy = ny - (obs.y + obs.h / 2);
        if (Math.abs(dx) < obs.w / 2 + pr && Math.abs(dy) < obs.h / 2 + pr) return true;
      } else {
        // Статичный — стена
        if (nx + pr > obs.x && nx - pr < obs.x + obs.w &&
            ny + pr > obs.y && ny - pr < obs.y + obs.h) return true;
      }
    }
    return false;
  }, []);

  const collidesWithBuildings = useCallback((nx: number, ny: number, gs: GameState): boolean => {
    const pr = 10;
    if (gs.mode === "flood") {
      // В режиме наводнения дома — острова, по ним нельзя плыть
      for (const b of gs.buildings) {
        if (nx + pr > b.x && nx - pr < b.x + b.w &&
            ny + pr > b.y && ny - pr < b.y + b.h) return true;
      }
    }
    // При землетрясении здания — завалы, не блокируют
    return false;
  }, []);

  // ── ИГРОВОЙ ЦИКЛ ───────────────────────────────────────────────────────
  const gameLoop = useCallback((timestamp: number) => {
    if (!stateRef.current || phase !== "playing") return;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;
    const gs = stateRef.current;

    // Таймер
    timerRef.current += dt;
    if (timerRef.current >= 1) {
      timerRef.current = 0;
      gs.timeLeft -= 1;
      setDisplayTime(gs.timeLeft);
      if (gs.timeLeft <= 0) {
        setDisplayScore(gs.score);
        setPhase("gameover");
        onComplete?.(gs.score);
        return;
      }
    }

    // Анимация воды
    gs.waterAnim += dt * 2;

    // ── ДВИЖЕНИЕ ИГРОКА ──────────────────────────────────────────────────
    const spd = gs.mode === "flood" ? 90 : 70;
    const keys = keysRef.current;

    const up = keys.has("ArrowUp") || keys.has("w") || keys.has("W") || dpad.up;
    const down = keys.has("ArrowDown") || keys.has("s") || keys.has("S") || dpad.down;
    const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A") || dpad.left;
    const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D") || dpad.right;
    const action = keys.has(" ") || keys.has("e") || keys.has("E") || dpad.action;

    let dx = 0, dy = 0;
    if (up) { dy = -spd * dt; gs.player.dir = "up"; }
    if (down) { dy = spd * dt; gs.player.dir = "down"; }
    if (left) { dx = -spd * dt; gs.player.dir = "left"; }
    if (right) { dx = spd * dt; gs.player.dir = "right"; }

    let nx = gs.player.x + dx;
    let ny = gs.player.y + dy;
    nx = Math.max(12, Math.min(W - 12, nx));
    ny = Math.max(12, Math.min(H * 2 - 12, ny));

    if (!collidesWithObstacles(nx, ny, gs) && !collidesWithBuildings(nx, ny, gs)) {
      gs.player.x = nx;
      gs.player.y = ny;
    } else if (!collidesWithObstacles(nx, gs.player.y, gs) && !collidesWithBuildings(nx, gs.player.y, gs)) {
      gs.player.x = nx;
    } else if (!collidesWithObstacles(gs.player.x, ny, gs) && !collidesWithBuildings(gs.player.x, ny, gs)) {
      gs.player.y = ny;
    }

    // Камера
    gs.cameraY = Math.max(0, Math.min(H, gs.player.y - H / 2));

    // ── ПОИСК / ВЗАИМОДЕЙСТВИЕ ───────────────────────────────────────────
    const pr = 30;

    if (gs.mode === "earthquake") {
      // Обнаружение скрытых выживших вблизи
      gs.survivors.forEach((s) => {
        if (!s.rescued && !s.visible) {
          const d = Math.hypot(gs.player.x - s.x, gs.player.y - s.y);
          if (d < TILE * 1.5) s.visible = true;
        }
      });

      // Поиск (раскопки)
      if (action && !gs.carrying) {
        const target = gs.survivors.find(
          (s) => !s.rescued && s.visible && !s.found &&
            Math.hypot(gs.player.x - s.x, gs.player.y - s.y) < pr
        );
        if (target) {
          gs.searching = true;
          gs.searchTarget = target.id;
          gs.searchProgress = Math.min(1, gs.searchProgress + dt * 0.6);
          if (gs.searchProgress >= 1) {
            target.found = true;
            gs.searching = false;
            gs.searchProgress = 0;
            gs.searchTarget = null;
            gs.score += 20;
            spawnParticles(gs, target.x, target.y, "#f1c40f", 8);
          }
        } else {
          gs.searching = false;
          gs.searchProgress = 0;
          gs.searchTarget = null;
        }
      } else if (!action) {
        gs.searching = false;
        gs.searchProgress = Math.max(0, gs.searchProgress - dt * 0.5);
        if (gs.searchProgress === 0) gs.searchTarget = null;
      }
    }

    // Подбор выжившего
    if (!gs.carrying) {
      const nearSurvivor = gs.survivors.find(
        (s) => !s.rescued && s.found && !s.carried &&
          Math.hypot(gs.player.x - s.x, gs.player.y - s.y) < pr
      );
      if (nearSurvivor && (gs.mode === "flood" || action)) {
        nearSurvivor.carried = true;
        gs.carrying = nearSurvivor.id;
      }
    }

    // Перемещение несомого выжившего
    if (gs.carrying !== null) {
      const s = gs.survivors.find((sv) => sv.id === gs.carrying);
      if (s) {
        s.x = gs.player.x + (gs.player.dir === "left" ? 16 : -16);
        s.y = gs.player.y - 10;
      }
    }

    // Достижение безопасной зоны
    if (gs.carrying !== null) {
      const sz = gs.safeZone;
      if (gs.player.x > sz.x && gs.player.x < sz.x + sz.w &&
          gs.player.y > sz.y && gs.player.y < sz.y + sz.h) {
        const s = gs.survivors.find((sv) => sv.id === gs.carrying);
        if (s) {
          s.rescued = true;
          s.carried = false;
        }
        gs.carrying = null;
        gs.rescued += 1;
        gs.score += 50;
        setDisplayRescued(gs.rescued);
        setDisplayScore(gs.score);
        spawnParticles(gs, gs.safeZone.x + gs.safeZone.w / 2, gs.safeZone.y, "#27ae60", 12);

        if (gs.rescued >= gs.total) {
          setDisplayScore(gs.score + 200);
          gs.score += 200;
          setPhase("win");
          onComplete?.(gs.score);
          return;
        }
      }
    }

    // ── ПЛАВАЮЩИЕ ПРЕПЯТСТВИЯ (наводнение) ──────────────────────────────
    if (gs.mode === "flood") {
      gs.obstacles.forEach((obs) => {
        obs.x += obs.vx * spd * 0.3 * dt;
        obs.y += obs.vy * spd * 0.3 * dt;
        if (obs.x < 0 || obs.x + obs.w > W) obs.vx *= -1;
        if (obs.y < 0 || obs.y + obs.h > H * 2) obs.vy *= -1;

        // Столкновение с игроком
        const cx = obs.x + obs.w / 2, cy = obs.y + obs.h / 2;
        if (Math.abs(gs.player.x - cx) < obs.w / 2 + 12 &&
            Math.abs(gs.player.y - cy) < obs.h / 2 + 12) {
          gs.score = Math.max(0, gs.score - 10);
          gs.player.x += (gs.player.x > cx ? 1 : -1) * 20;
          gs.player.y += (gs.player.y > cy ? 1 : -1) * 20;
          spawnParticles(gs, gs.player.x, gs.player.y, "#e74c3c", 5);
        }
      });
    }

    // ── ЧАСТИЦЫ ─────────────────────────────────────────────────────────
    gs.particles = gs.particles.filter((p) => p.life > 0);
    gs.particles.forEach((p) => {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt * 2;
    });

    // Анимации выживших
    gs.survivors.forEach((s) => {
      s.blinkT += dt * 3;
      s.waveT += dt * 4;
    });

    setDisplaySearching(gs.searching);
    setDisplaySearchProgress(gs.searchProgress);

    // ── ОТРИСОВКА ────────────────────────────────────────────────────────
    drawGame(gs);
    animRef.current = requestAnimationFrame(gameLoop);
  }, [phase, dpad, collidesWithObstacles, collidesWithBuildings, onComplete]);

  function spawnParticles(gs: GameState, x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      gs.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function drawGame(gs: GameState) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const camY = gs.cameraY;
    ctx.clearRect(0, 0, W, H);

    if (gs.mode === "flood") drawFlood(ctx, gs, camY);
    else drawEarthquake(ctx, gs, camY);

    drawParticles(ctx, gs, camY);
    drawSurvivors(ctx, gs, camY);
    drawPlayer(ctx, gs, camY);
    drawSafeZone(ctx, gs, camY);
  }

  function drawFlood(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    // Вода
    for (let ty = 0; ty < Math.ceil(H / TILE) + 1; ty++) {
      for (let tx = 0; tx < COLS; tx++) {
        const wave = Math.sin(gs.waterAnim + tx * 0.5 + ty * 0.3) * 2;
        ctx.fillStyle = (tx + ty) % 2 === 0 ? C.water1 : C.water2;
        ctx.fillRect(tx * TILE, ty * TILE - (camY % TILE) + wave, TILE, TILE);
      }
    }

    // Дома (крыши над водой)
    gs.buildings.forEach((b) => {
      const by = b.y - camY;
      if (by > H + TILE || by < -TILE * 3) return;
      // Стены (выглядывают из воды)
      ctx.fillStyle = C.wallWet;
      ctx.fillRect(b.x + 2, by + b.h + 4, b.w - 4, 8);
      // Крыша
      ctx.fillStyle = b.roofColor;
      ctx.fillRect(b.x, by, b.w, b.h);
      ctx.fillStyle = b.roofColor === C.roof ? C.roofDark : "#444";
      // Конёк крыши
      ctx.fillRect(b.x + b.w / 2 - 2, by, 4, b.h);
      ctx.fillRect(b.x, by + b.h / 2 - 2, b.w, 4);
      // Окантовка
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 0.5, by + 0.5, b.w - 1, b.h - 1);
    });

    // Плавающие препятствия
    gs.obstacles.forEach((obs) => {
      const oy = obs.y - camY;
      if (oy > H + TILE || oy < -TILE) return;
      if (obs.type === "log") {
        ctx.fillStyle = C.log;
        ctx.fillRect(obs.x, oy, obs.w, obs.h);
        ctx.fillStyle = C.logDark;
        ctx.fillRect(obs.x, oy + obs.h / 3, obs.w, obs.h / 3);
        ctx.strokeStyle = "#5a4010";
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x + 0.5, oy + 0.5, obs.w - 1, obs.h - 1);
      } else {
        ctx.fillStyle = "#7f8c8d";
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2, oy + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#606870";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#95a5a6";
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2 - 3, oy + obs.h / 2 - 3, obs.w / 4, obs.h / 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawEarthquake(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    // Земля
    for (let ty = 0; ty < Math.ceil(H / TILE) + 1; ty++) {
      for (let tx = 0; tx < COLS; tx++) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? C.ground : C.groundDark;
        ctx.fillRect(tx * TILE, ty * TILE - (camY % TILE), TILE, TILE);
      }
    }

    // Трещины в земле
    ctx.strokeStyle = C.crack;
    ctx.lineWidth = 2;
    [[60, 80], [180, 200], [300, 120], [50, 350], [280, 300]].forEach(([x, y]) => {
      const ry = y - camY;
      ctx.beginPath();
      ctx.moveTo(x, ry);
      ctx.lineTo(x + 30, ry + 15);
      ctx.lineTo(x + 20, ry + 30);
      ctx.stroke();
    });

    // Обрушенные здания
    gs.buildings.forEach((b) => {
      const by = b.y - camY;
      if (by > H + TILE || by < -TILE * 5) return;
      // Завал — случайные прямоугольники
      for (let i = 0; i < 6; i++) {
        const rx = b.x + (i * 17) % b.w;
        const ry = by + (i * 13) % b.h;
        const rw = TILE / 2 + (i * 7) % (TILE / 2);
        const rh = TILE / 3 + (i * 11) % (TILE / 3);
        ctx.fillStyle = i % 2 === 0 ? C.rubble : C.rubbleDark;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = "#4a5568";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
      }
      // Пыль
      ctx.fillStyle = C.dust + "88";
      ctx.fillRect(b.x, by, b.w, b.h);
    });

    // Статичные обломки на улицах
    gs.obstacles.forEach((obs) => {
      const oy = obs.y - camY;
      if (oy > H + TILE || oy < -TILE) return;
      ctx.fillStyle = C.rubble;
      ctx.fillRect(obs.x, oy, obs.w, obs.h);
      ctx.fillStyle = C.rubbleDark;
      ctx.fillRect(obs.x + 4, oy + 4, obs.w - 8, obs.h - 8);
      ctx.strokeStyle = "#4a5568";
      ctx.lineWidth = 1;
      ctx.strokeRect(obs.x + 0.5, oy + 0.5, obs.w - 1, obs.h - 1);
    });
  }

  function drawSafeZone(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    const sz = gs.safeZone;
    const sy = sz.y - camY;

    // Зона
    ctx.fillStyle = C.safeZone + "88";
    ctx.fillRect(sz.x, sy, sz.w, sz.h);
    ctx.strokeStyle = C.safeZoneLight;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(sz.x + 1, sy + 1, sz.w - 2, sz.h - 2);
    ctx.setLineDash([]);

    // Знак "+" (медицина)
    ctx.fillStyle = C.safeZoneLight;
    const cx = sz.x + sz.w / 2;
    ctx.fillRect(cx - 3, sy + 4, 6, 14);
    ctx.fillRect(cx - 7, sy + 8, 14, 6);

    // Врач
    const dx = sz.x + 12;
    const dy = sy + 8;
    ctx.fillStyle = C.doctor;
    ctx.fillRect(dx - 5, dy, 10, 12);
    ctx.fillStyle = "#f5cba7";
    ctx.fillRect(dx - 4, dy - 8, 8, 8);
    ctx.fillStyle = C.doctorCross;
    ctx.fillRect(dx - 2, dy + 2, 4, 6);

    // Текст
    ctx.fillStyle = C.white;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("БЕЗОПАСНАЯ ЗОНА", sz.x + sz.w / 2, sy + sz.h - 4);
  }

  function drawSurvivors(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    gs.survivors.forEach((s) => {
      if (s.rescued || s.carried) return;

      const sy = s.y - camY;
      if (sy > H + TILE || sy < -TILE) return;

      if (!s.visible) return;

      if (!s.found) {
        // Мигающий сигнал под завалами
        const alpha = (Math.sin(s.blinkT * 3) + 1) / 2;
        ctx.fillStyle = `rgba(241, 196, 15, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(s.x, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        // Знак вопроса
        ctx.fillStyle = C.white;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", s.x, sy + 4);
        return;
      }

      // Тело выжившего
      const wave = Math.sin(s.waveT) * 2;
      // Туловище
      ctx.fillStyle = C.survivor;
      ctx.fillRect(s.x - 5, sy - 4 + wave, 10, 12);
      // Голова
      ctx.fillStyle = C.survivorSkin;
      ctx.fillRect(s.x - 4, sy - 12 + wave, 8, 8);
      // Машет рукой
      ctx.fillStyle = C.survivorSkin;
      ctx.fillRect(s.x + 6, sy - 4 + Math.sin(s.waveT * 2) * 4, 4, 6);

      // Кружок "подобрать"
      if (gs.mode === "flood" || gs.mode === "earthquake") {
        const near = Math.hypot(gs.player.x - s.x, gs.player.y - s.y) < 35;
        if (near) {
          ctx.strokeStyle = "#f1c40f";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.x, sy, 16, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });

    // Поиск — прогресс
    if (gs.searching && gs.searchTarget !== null) {
      const s = gs.survivors.find((sv) => sv.id === gs.searchTarget);
      if (s) {
        const sy = s.y - camY;
        ctx.fillStyle = "#1a1a2e99";
        ctx.fillRect(s.x - 20, sy - 28, 40, 8);
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(s.x - 20, sy - 28, 40 * gs.searchProgress, 8);
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x - 20, sy - 28, 40, 8);
      }
    }
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    const px = gs.player.x;
    const py = gs.player.y - camY;

    // Тень
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(px, py + 8, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Лодка (наводнение)
    if (gs.mode === "flood") {
      ctx.fillStyle = "#f39c12";
      ctx.fillRect(px - 12, py + 4, 24, 8);
      ctx.fillStyle = "#e67e22";
      ctx.fillRect(px - 10, py + 10, 20, 3);
      // Весло
      const paddleX = gs.player.dir === "left" ? -16 : 16;
      ctx.fillStyle = "#8B6914";
      ctx.fillRect(px + paddleX - 1, py - 4, 3, 16);
    }

    // Тело спасателя
    ctx.fillStyle = C.rescuer;
    ctx.fillRect(px - 6, py - 8, 12, 14);
    // Голова
    ctx.fillStyle = C.survivorSkin;
    ctx.fillRect(px - 5, py - 18, 10, 10);
    // Каска
    ctx.fillStyle = C.helmet;
    ctx.fillRect(px - 6, py - 20, 12, 6);
    ctx.fillRect(px - 7, py - 15, 14, 3);
    // Полоска на каске
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(px - 4, py - 19, 8, 2);

    // Несомый выживший (над спасателем)
    if (gs.carrying !== null) {
      ctx.fillStyle = C.survivor;
      ctx.fillRect(px - 5, py - 30, 10, 10);
      ctx.fillStyle = C.survivorSkin;
      ctx.fillRect(px - 4, py - 38, 8, 8);
    }
  }

  function drawParticles(ctx: CanvasRenderingContext2D, gs: GameState, camY: number) {
    gs.particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - camY - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  // ── ЗАПУСК/ОСТАНОВКА ЦИКЛА ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") {
      cancelAnimationFrame(animRef.current);
      return;
    }
    lastTimeRef.current = performance.now();
    timerRef.current = 0;
    animRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, gameLoop]);

  // ── КЛАВИАТУРА ────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // D-PAD
  const pressDpad = (dir: keyof typeof dpad, val: boolean) => {
    setDpad((d) => ({ ...d, [dir]: val }));
  };

  // ── ЭКРАНЫ ────────────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1 pt-1">
          <div className="text-4xl">🚁</div>
          <div className="font-bold text-gray-800 text-xl">Спасатели</div>
          <div className="text-sm text-gray-500">Пиксельная игра — вид сверху</div>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => { setSelectedMode("flood"); startGame("flood"); }}
            className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🌊</span>
              <div>
                <div className="font-bold text-lg">Наводнение</div>
                <div className="text-white/75 text-xs">Плыви на лодке, спасай людей с крыш</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">⚠️ Избегай брёвен и мусора</div>
              <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">🎯 Спаси 8 человек</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedMode("earthquake"); startGame("earthquake"); }}
            className="bg-gradient-to-br from-orange-600 to-amber-500 text-white rounded-2xl p-5 text-left shadow-lg active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🌍</span>
              <div>
                <div className="font-bold text-lg">Землетрясение</div>
                <div className="text-white/75 text-xs">Ищи людей в обломках, веди в безопасную зону</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">🔍 Раскапывай завалы (держи Е)</div>
              <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">🏥 Веди к врачам</div>
            </div>
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
          <div className="font-semibold text-gray-700 mb-1.5">Управление:</div>
          <div>⌨️ WASD или стрелки — движение</div>
          <div>🔍 E / Пробел — раскопать завал (землетрясение)</div>
          <div>📱 На телефоне — джойстик на экране</div>
        </div>
      </div>
    );
  }

  if (phase === "gameover" || phase === "win") {
    const isWin = phase === "win";
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl p-6 text-white text-center shadow-lg ${isWin ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
          <div className="text-5xl mb-2">{isWin ? "🏆" : "😰"}</div>
          <div className="font-bold text-xl">{isWin ? "Все спасены!" : "Время вышло"}</div>
          <div className="text-white/80 text-sm mt-1">
            {isWin ? "Отличная работа, спасатель!" : `Спасено ${displayRescued} из ${displayTotal}`}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{displayRescued}</div>
            <div className="text-xs text-green-700 mt-0.5">спасено</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{displayTotal}</div>
            <div className="text-xs text-blue-700 mt-0.5">всего</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{displayScore}</div>
            <div className="text-xs text-yellow-700 mt-0.5">очков</div>
          </div>
        </div>

        {isWin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            +200 бонус за спасение всех! Реальные спасатели делают это каждый день — уважай их труд.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => startGame(selectedMode ?? "flood")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 rounded-2xl shadow-md active:scale-95 transition-transform text-sm"
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={() => setPhase("menu")}
            className="bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl shadow-sm active:scale-95 transition-transform text-sm"
          >
            📋 Сменить режим
          </button>
        </div>
      </div>
    );
  }

  // ── ИГРОВОЙ ЭКРАН ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* HUD */}
      <div className="bg-gray-900 rounded-2xl px-4 py-2.5 flex items-center gap-3">
        <span className="text-xl">{selectedMode === "flood" ? "🌊" : "🌍"}</span>
        <div className="flex-1 flex items-center gap-4 text-xs font-mono">
          <span className="text-green-400 font-bold">💚 {displayRescued}/{displayTotal}</span>
          <span className="text-yellow-400 font-bold">⭐ {displayScore}</span>
          <span className={`font-bold ml-auto ${displayTime <= 30 ? "text-red-400 animate-pulse" : "text-blue-300"}`}>
            ⏱ {displayTime}с
          </span>
        </div>
        <button
          onClick={() => setPhase("menu")}
          className="text-gray-500 hover:text-white ml-2"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Прогресс раскопок */}
      {displaySearching && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-sm">⛏️</span>
          <div className="flex-1 bg-yellow-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-yellow-500 transition-all" style={{ width: `${displaySearchProgress * 100}%` }} />
          </div>
          <span className="text-xs text-yellow-700 font-semibold">Раскопка...</span>
        </div>
      )}

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-gray-800">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full block"
          style={{ imageRendering: "pixelated", aspectRatio: `${W}/${H}` }}
        />
      </div>

      {/* D-PAD */}
      <div className="flex gap-4 items-end justify-between">
        {/* Стрелки */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            className="bg-gray-800 text-white rounded-xl h-12 flex items-center justify-center active:bg-gray-600 active:scale-95 select-none"
            onPointerDown={() => pressDpad("up", true)}
            onPointerUp={() => pressDpad("up", false)}
            onPointerLeave={() => pressDpad("up", false)}
          >▲</button>
          <div />
          <button
            className="bg-gray-800 text-white rounded-xl h-12 flex items-center justify-center active:bg-gray-600 active:scale-95 select-none"
            onPointerDown={() => pressDpad("left", true)}
            onPointerUp={() => pressDpad("left", false)}
            onPointerLeave={() => pressDpad("left", false)}
          >◀</button>
          <button
            className="bg-gray-800 text-white rounded-xl h-12 flex items-center justify-center active:bg-gray-600 active:scale-95 select-none"
            onPointerDown={() => pressDpad("down", true)}
            onPointerUp={() => pressDpad("down", false)}
            onPointerLeave={() => pressDpad("down", false)}
          >▼</button>
          <button
            className="bg-gray-800 text-white rounded-xl h-12 flex items-center justify-center active:bg-gray-600 active:scale-95 select-none"
            onPointerDown={() => pressDpad("right", true)}
            onPointerUp={() => pressDpad("right", false)}
            onPointerLeave={() => pressDpad("right", false)}
          >▶</button>
        </div>

        {/* Кнопка действия */}
        <button
          className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl w-20 h-20 flex flex-col items-center justify-center font-bold shadow-lg active:scale-90 active:shadow-none transition-all select-none text-xs"
          onPointerDown={() => pressDpad("action", true)}
          onPointerUp={() => pressDpad("action", false)}
          onPointerLeave={() => pressDpad("action", false)}
        >
          <span className="text-2xl">⛏️</span>
          <span>Копать</span>
        </button>
      </div>

      <div className="text-center text-xs text-gray-400">
        {selectedMode === "flood"
          ? "Подплывай к людям на крышах — они сами зайдут в лодку. Беги от брёвен!"
          : "Держи ⛏️ рядом с сигналом ❓ чтобы раскопать человека"}
      </div>
    </div>
  );
}
