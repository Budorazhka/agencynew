import { useEffect, useMemo, useRef, useState } from "react"
import { Clock3, Gamepad2, Play, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DifficultyLevel = "easy" | "medium" | "hard"
type MiniGame = "management" | "snake" | "tetris"

type PatrolEnemy = { id: number; x: number; y: number; ttlMs: number }
type PatrolState = {
  playerX: number
  playerY: number
  facing: "left" | "right"
  actionMsLeft: number
  enemies: PatrolEnemy[]
  score: number
  rescued: number
  missed: number
  elapsedSeconds: number
  spawnTimerMs: number
  nextEnemyId: number
}

type SavedPatrolProgress = {
  version: 1
  difficulty: DifficultyLevel
  state: PatrolState
  bestScore: number
}

type GridPoint = { x: number; y: number }
type SnakeDirection = "up" | "down" | "left" | "right"
type SnakeState = {
  snake: GridPoint[]
  direction: SnakeDirection
  queuedDirection: SnakeDirection
  food: GridPoint
  score: number
  bestScore: number
  elapsedSeconds: number
  isGameOver: boolean
  speedMs: number
}

type SavedSnakeProgress = {
  version: 1
  state: SnakeState
}

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"
type TetrisCell = TetrominoType | ""
type TetrisPiece = {
  type: TetrominoType
  rotation: number
  x: number
  y: number
}
type TetrisState = {
  board: TetrisCell[][]
  active: TetrisPiece
  nextType: TetrominoType
  score: number
  bestScore: number
  lines: number
  level: number
  elapsedSeconds: number
  dropIntervalMs: number
  isGameOver: boolean
}

type SavedTetrisProgress = {
  version: 1
  state: TetrisState
}

const WORK_REMINDER_SECONDS = 5 * 60
const BOARD_WIDTH = 1120
const BOARD_HEIGHT = 580
const SNAKE_COLS = 20
const SNAKE_ROWS = 14
const SNAKE_START_SPEED_MS = 180
const TETRIS_COLS = 10
const TETRIS_ROWS = 20

const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  easy: "Легкий",
  medium: "Средний",
  hard: "Сложный",
}

const MANAGEMENT_CONFIG: Record<
  DifficultyLevel,
  { playerSpeed: number; spawnIntervalMs: number; enemyTtlMs: number }
> = {
  easy: { playerSpeed: 230, spawnIntervalMs: 1700, enemyTtlMs: 10000 },
  medium: { playerSpeed: 260, spawnIntervalMs: 1250, enemyTtlMs: 8200 },
  hard: { playerSpeed: 300, spawnIntervalMs: 920, enemyTtlMs: 6800 },
}

const TETROMINO_BASE: Record<TetrominoType, GridPoint[]> = {
  I: [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ],
  O: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  T: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  S: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  Z: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  J: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  L: [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
}

const TETRIS_COLORS: Record<TetrominoType, string> = {
  I: "#22d3ee",
  O: "#facc15",
  T: "#a78bfa",
  S: "#4ade80",
  Z: "#f87171",
  J: "#60a5fa",
  L: "#fb923c",
}

const TETRIS_POINTS_BY_LINES = [0, 100, 300, 500, 800]

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function createInitialPatrolState(): PatrolState {
  return {
    playerX: BOARD_WIDTH / 2,
    playerY: BOARD_HEIGHT / 2,
    facing: "right",
    actionMsLeft: 0,
    enemies: [],
    score: 0,
    rescued: 0,
    missed: 0,
    elapsedSeconds: 0,
    spawnTimerMs: 0,
    nextEnemyId: 1,
  }
}

function getManagementStorageKey(cityId: string | undefined, difficulty: DifficultyLevel) {
  return `owner-management:v3:${cityId ?? "global"}:${difficulty}`
}

function safeLoadManagementProgress(key: string): SavedPatrolProgress | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedPatrolProgress
    if (!parsed || parsed.version !== 1 || !parsed.state) return null
    return {
      ...parsed,
      state: { ...createInitialPatrolState(), ...parsed.state, enemies: parsed.state.enemies ?? [] },
    }
  } catch {
    return null
  }
}

function getSnakeStorageKey(cityId: string | undefined) {
  return `owner-snake:v1:${cityId ?? "global"}`
}

function isSamePoint(a: GridPoint, b: GridPoint) {
  return a.x === b.x && a.y === b.y
}

function isOppositeDirection(a: SnakeDirection, b: SnakeDirection) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  )
}

function nextPointByDirection(point: GridPoint, direction: SnakeDirection) {
  if (direction === "up") return { x: point.x, y: point.y - 1 }
  if (direction === "down") return { x: point.x, y: point.y + 1 }
  if (direction === "left") return { x: point.x - 1, y: point.y }
  return { x: point.x + 1, y: point.y }
}

function pickRandomFreeSnakeCell(snake: GridPoint[]) {
  const occupied = new Set(snake.map((part) => `${part.x}:${part.y}`))
  const free: GridPoint[] = []
  for (let y = 0; y < SNAKE_ROWS; y += 1) {
    for (let x = 0; x < SNAKE_COLS; x += 1) {
      if (!occupied.has(`${x}:${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.floor(Math.random() * free.length)]
}

function createInitialSnakeState(bestScore = 0): SnakeState {
  const snake = [
    { x: 9, y: 7 },
    { x: 8, y: 7 },
    { x: 7, y: 7 },
  ]
  return {
    snake,
    direction: "right",
    queuedDirection: "right",
    food: pickRandomFreeSnakeCell(snake),
    score: 0,
    bestScore,
    elapsedSeconds: 0,
    isGameOver: false,
    speedMs: SNAKE_START_SPEED_MS,
  }
}

function safeLoadSnakeProgress(key: string): SavedSnakeProgress | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedSnakeProgress
    if (!parsed || parsed.version !== 1 || !parsed.state) return null
    return parsed
  } catch {
    return null
  }
}

function createEmptyTetrisBoard() {
  return Array.from({ length: TETRIS_ROWS }, () => Array<TetrisCell>(TETRIS_COLS).fill(""))
}

function getTetrisStorageKey(cityId: string | undefined) {
  return `owner-tetris:v1:${cityId ?? "global"}`
}

function randomTetromino(): TetrominoType {
  const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"]
  return types[Math.floor(Math.random() * types.length)] ?? "I"
}

function rotateCell(cell: GridPoint) {
  return { x: 3 - cell.y, y: cell.x }
}

function getPieceCells(piece: TetrisPiece) {
  let cells = TETROMINO_BASE[piece.type]
  const steps = piece.rotation % 4
  for (let i = 0; i < steps; i += 1) {
    cells = cells.map(rotateCell)
  }
  return cells
}

function spawnTetrisPiece(type: TetrominoType): TetrisPiece {
  return { type, rotation: 0, x: 3, y: -1 }
}

function hasTetrisCollision(board: TetrisCell[][], piece: TetrisPiece) {
  const cells = getPieceCells(piece)
  return cells.some((cell) => {
    const x = piece.x + cell.x
    const y = piece.y + cell.y
    if (x < 0 || x >= TETRIS_COLS || y >= TETRIS_ROWS) return true
    if (y >= 0 && board[y]?.[x]) return true
    return false
  })
}

function mergePieceIntoBoard(board: TetrisCell[][], piece: TetrisPiece) {
  const nextBoard = board.map((row) => [...row])
  getPieceCells(piece).forEach((cell) => {
    const x = piece.x + cell.x
    const y = piece.y + cell.y
    if (x < 0 || x >= TETRIS_COLS || y < 0 || y >= TETRIS_ROWS) return
    nextBoard[y][x] = piece.type
  })
  return nextBoard
}

function clearTetrisLines(board: TetrisCell[][]) {
  const remained = board.filter((row) => row.some((cell) => cell === ""))
  const cleared = TETRIS_ROWS - remained.length
  while (remained.length < TETRIS_ROWS) {
    remained.unshift(Array<TetrisCell>(TETRIS_COLS).fill(""))
  }
  return { board: remained, cleared }
}

function createInitialTetrisState(bestScore = 0): TetrisState {
  const first = randomTetromino()
  return {
    board: createEmptyTetrisBoard(),
    active: spawnTetrisPiece(first),
    nextType: randomTetromino(),
    score: 0,
    bestScore,
    lines: 0,
    level: 1,
    elapsedSeconds: 0,
    dropIntervalMs: 700,
    isGameOver: false,
  }
}

function safeLoadTetrisProgress(key: string): SavedTetrisProgress | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedTetrisProgress
    if (!parsed || parsed.version !== 1 || !parsed.state) return null
    return parsed
  } catch {
    return null
  }
}

function lockAndAdvanceTetris(state: TetrisState): TetrisState {
  const merged = mergePieceIntoBoard(state.board, state.active)
  const { board, cleared } = clearTetrisLines(merged)
  const lines = state.lines + cleared
  const level = Math.floor(lines / 10) + 1
  const score = state.score + (TETRIS_POINTS_BY_LINES[cleared] ?? 0) * level
  const bestScore = Math.max(state.bestScore, score)
  const nextActive = spawnTetrisPiece(state.nextType)
  const nextType = randomTetromino()
  const isGameOver = hasTetrisCollision(board, nextActive)
  return {
    ...state,
    board,
    active: nextActive,
    nextType,
    score,
    bestScore,
    lines,
    level,
    dropIntervalMs: Math.max(120, 700 - (level - 1) * 55),
    isGameOver,
  }
}

interface GamesBreakPanelProps {
  cityId?: string
}

export function GamesBreakPanel({ cityId }: GamesBreakPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<MiniGame>("management")
  const [managementDifficulty, setManagementDifficulty] = useState<DifficultyLevel>("easy")
  const [managementState, setManagementState] = useState<PatrolState>(() => createInitialPatrolState())
  const [managementBestScore, setManagementBestScore] = useState(0)

  const [snakeState, setSnakeState] = useState<SnakeState>(() => createInitialSnakeState())
  const [tetrisState, setTetrisState] = useState<TetrisState>(() => createInitialTetrisState())

  useEffect(() => {
    if (selectedGame === "snake") {
      setSelectedGame("management")
    }
  }, [selectedGame])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const keysRef = useRef<Record<string, boolean>>({})
  const lastTickRef = useRef<number | null>(null)
  const actionCooldownRef = useRef(0)
  const spritesRef = useRef<{
    goLeft: HTMLImageElement | null
    goRight: HTMLImageElement | null
    actionLeft: HTMLImageElement | null
    actionRight: HTMLImageElement | null
    sleep: HTMLImageElement | null
  }>({ goLeft: null, goRight: null, actionLeft: null, actionRight: null, sleep: null })

  const managementKey = useMemo(
    () => getManagementStorageKey(cityId, managementDifficulty),
    [cityId, managementDifficulty]
  )
  const snakeKey = useMemo(() => getSnakeStorageKey(cityId), [cityId])
  const tetrisKey = useMemo(() => getTetrisStorageKey(cityId), [cityId])
  const sleepIconSrc = useMemo(() => `${import.meta.env.BASE_URL}sleep.png`, [])

  const managementReminder = managementState.elapsedSeconds >= WORK_REMINDER_SECONDS
  const tetrisReminder = tetrisState.elapsedSeconds >= WORK_REMINDER_SECONDS

  const tetrisPreviewSet = useMemo(() => {
    const set = new Set<string>()
    getPieceCells({ type: tetrisState.nextType, rotation: 0, x: 0, y: 0 }).forEach((cell) => {
      set.add(`${cell.x}:${cell.y}`)
    })
    return set
  }, [tetrisState.nextType])

  const tetrisDisplayBoard = useMemo(() => {
    const board = tetrisState.board.map((row) => [...row])
    getPieceCells(tetrisState.active).forEach((cell) => {
      const x = tetrisState.active.x + cell.x
      const y = tetrisState.active.y + cell.y
      if (x < 0 || x >= TETRIS_COLS || y < 0 || y >= TETRIS_ROWS) return
      board[y][x] = tetrisState.active.type
    })
    return board
  }, [tetrisState.active, tetrisState.board])

  const startNewManagement = () => {
    setManagementState(createInitialPatrolState())
    keysRef.current = {}
    lastTickRef.current = null
    actionCooldownRef.current = 0
  }

  const restartTetris = () => {
    setTetrisState((current) => createInitialTetrisState(current.bestScore))
  }

  const applySnakeDirection = (nextDirection: SnakeDirection) => {
    setSnakeState((current) => {
      if (current.isGameOver) return current
      if (isOppositeDirection(current.direction, nextDirection)) return current
      return { ...current, queuedDirection: nextDirection }
    })
  }

  const tryMoveTetris = (dx: number, dy: number) => {
    setTetrisState((current) => {
      if (current.isGameOver) return current
      const candidate = { ...current.active, x: current.active.x + dx, y: current.active.y + dy }
      if (!hasTetrisCollision(current.board, candidate)) {
        return { ...current, active: candidate }
      }
      if (dy === 1) {
        return lockAndAdvanceTetris(current)
      }
      return current
    })
  }

  const rotateTetris = () => {
    setTetrisState((current) => {
      if (current.isGameOver) return current
      const targetRotation = (current.active.rotation + 1) % 4
      const kicks = [0, -1, 1, -2, 2]
      for (const kickX of kicks) {
        const candidate = {
          ...current.active,
          rotation: targetRotation,
          x: current.active.x + kickX,
        }
        if (!hasTetrisCollision(current.board, candidate)) {
          return { ...current, active: candidate }
        }
      }
      return current
    })
  }

  const hardDropTetris = () => {
    setTetrisState((current) => {
      if (current.isGameOver) return current
      let piece = current.active
      while (!hasTetrisCollision(current.board, { ...piece, y: piece.y + 1 })) {
        piece = { ...piece, y: piece.y + 1 }
      }
      return lockAndAdvanceTetris({ ...current, active: piece })
    })
  }

  useEffect(() => {
    const create = (name: string) => {
      const img = new Image()
      img.src = `${import.meta.env.BASE_URL}${name}`
      return img
    }
    spritesRef.current.goLeft = create("go_left.png")
    spritesRef.current.goRight = create("go_right.png")
    spritesRef.current.actionLeft = create("left.png")
    spritesRef.current.actionRight = create("right.png")
    spritesRef.current.sleep = create("sleep.png")
  }, [])

  useEffect(() => {
    if (!isOpen || selectedGame !== "management") return
    const saved = safeLoadManagementProgress(managementKey)
    if (saved) {
      setManagementState(saved.state)
      setManagementBestScore(saved.bestScore)
      keysRef.current = {}
      lastTickRef.current = null
      actionCooldownRef.current = 0
      return
    }
    setManagementBestScore(0)
    startNewManagement()
  }, [isOpen, managementKey, selectedGame])

  useEffect(() => {
    if (!isOpen || selectedGame !== "snake") return
    const saved = safeLoadSnakeProgress(snakeKey)
    if (saved) {
      setSnakeState(saved.state)
      return
    }
    setSnakeState(createInitialSnakeState())
  }, [isOpen, selectedGame, snakeKey])

  useEffect(() => {
    if (!isOpen || selectedGame !== "tetris") return
    const saved = safeLoadTetrisProgress(tetrisKey)
    if (saved) {
      setTetrisState(saved.state)
      return
    }
    setTetrisState(createInitialTetrisState())
  }, [isOpen, selectedGame, tetrisKey])

  useEffect(() => {
    if (!isOpen || selectedGame !== "management") return
    const cfg = MANAGEMENT_CONFIG[managementDifficulty]
    const interval = window.setInterval(() => {
      const now = performance.now()
      const previousTick = lastTickRef.current ?? now
      const dtMs = Math.min(60, now - previousTick)
      lastTickRef.current = now
      const keyState = keysRef.current

      setManagementState((current) => {
        const up = keyState["arrowup"] || keyState["keyw"]
        const down = keyState["arrowdown"] || keyState["keys"]
        const left = keyState["arrowleft"] || keyState["keya"]
        const right = keyState["arrowright"] || keyState["keyd"]

        let dirX = (right ? 1 : 0) - (left ? 1 : 0)
        let dirY = (down ? 1 : 0) - (up ? 1 : 0)
        if (dirX !== 0 || dirY !== 0) {
          const len = Math.sqrt(dirX * dirX + dirY * dirY)
          dirX /= len
          dirY /= len
        }

        const facing = dirX < -0.01 ? "left" : dirX > 0.01 ? "right" : current.facing
        let enemies: PatrolEnemy[] = []
        let missedNow = 0

        current.enemies.forEach((enemy) => {
          const ttlMs = enemy.ttlMs - dtMs
          if (ttlMs <= 0) {
            missedNow += 1
          } else {
            enemies.push({ ...enemy, ttlMs })
          }
        })

        let spawnTimerMs = current.spawnTimerMs + dtMs
        let nextEnemyId = current.nextEnemyId
        while (spawnTimerMs >= cfg.spawnIntervalMs) {
          spawnTimerMs -= cfg.spawnIntervalMs
          enemies.push({
            id: nextEnemyId,
            x: 70 + Math.random() * (BOARD_WIDTH - 140),
            y: 80 + Math.random() * (BOARD_HEIGHT - 140),
            ttlMs: cfg.enemyTtlMs,
          })
          nextEnemyId += 1
        }

        return {
          ...current,
          playerX: clamp(current.playerX + dirX * cfg.playerSpeed * (dtMs / 1000), 36, BOARD_WIDTH - 36),
          playerY: clamp(current.playerY + dirY * cfg.playerSpeed * (dtMs / 1000), 36, BOARD_HEIGHT - 36),
          facing,
          actionMsLeft: Math.max(0, current.actionMsLeft - dtMs),
          enemies,
          missed: current.missed + missedNow,
          score: Math.max(0, current.score - missedNow * 3),
          elapsedSeconds: current.elapsedSeconds + dtMs / 1000,
          spawnTimerMs,
          nextEnemyId,
        }
      })
    }, 33)

    return () => window.clearInterval(interval)
  }, [isOpen, managementDifficulty, selectedGame])

  useEffect(() => {
    if (!isOpen || selectedGame !== "snake" || snakeState.isGameOver) return
    const interval = window.setInterval(() => {
      setSnakeState((current) => {
        if (current.isGameOver || current.snake.length === 0) return current
        const direction = isOppositeDirection(current.direction, current.queuedDirection)
          ? current.direction
          : current.queuedDirection
        const head = current.snake[0]
        const nextHead = nextPointByDirection(head, direction)
        const ateFood = isSamePoint(nextHead, current.food)
        const outside =
          nextHead.x < 0 || nextHead.x >= SNAKE_COLS || nextHead.y < 0 || nextHead.y >= SNAKE_ROWS
        const hitSelf = current.snake.some((part, index) => {
          if (!ateFood && index === current.snake.length - 1) return false
          return isSamePoint(part, nextHead)
        })
        if (outside || hitSelf) {
          return {
            ...current,
            direction,
            queuedDirection: direction,
            isGameOver: true,
            bestScore: Math.max(current.bestScore, current.score),
          }
        }

        const nextSnake = [nextHead, ...current.snake]
        if (!ateFood) nextSnake.pop()
        const nextScore = current.score + (ateFood ? 10 : 0)
        const bestScore = Math.max(current.bestScore, nextScore)
        const nextSpeed = ateFood ? Math.max(90, current.speedMs - 4) : current.speedMs
        return {
          ...current,
          snake: nextSnake,
          direction,
          queuedDirection: direction,
          food: ateFood ? pickRandomFreeSnakeCell(nextSnake) : current.food,
          score: nextScore,
          bestScore,
          speedMs: nextSpeed,
        }
      })
    }, snakeState.speedMs)
    return () => window.clearInterval(interval)
  }, [isOpen, selectedGame, snakeState.isGameOver, snakeState.speedMs])

  useEffect(() => {
    if (!isOpen || selectedGame !== "tetris" || tetrisState.isGameOver) return
    const interval = window.setInterval(() => {
      setTetrisState((current) => {
        if (current.isGameOver) return current
        const candidate = { ...current.active, y: current.active.y + 1 }
        if (!hasTetrisCollision(current.board, candidate)) {
          return { ...current, active: candidate }
        }
        return lockAndAdvanceTetris(current)
      })
    }, tetrisState.dropIntervalMs)
    return () => window.clearInterval(interval)
  }, [isOpen, selectedGame, tetrisState.dropIntervalMs, tetrisState.isGameOver])

  useEffect(() => {
    if (!isOpen || selectedGame !== "management") return
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const code = event.code.toLowerCase()
      if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        code === "keyw" ||
        code === "keya" ||
        code === "keys" ||
        code === "keyd" ||
        code === "space"
      ) {
        event.preventDefault()
      }

      keysRef.current[key] = true
      keysRef.current[code] = true

      if (code === "space") {
        const now = performance.now()
        if (now - actionCooldownRef.current < 180) return
        actionCooldownRef.current = now

        setManagementState((current) => {
          const base = { ...current, actionMsLeft: 190 }
          let nearestIndex = -1
          let nearestDistance = Number.POSITIVE_INFINITY
          current.enemies.forEach((enemy, index) => {
            const dx = enemy.x - current.playerX
            const dy = enemy.y - current.playerY
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance <= 96 && distance < nearestDistance) {
              nearestDistance = distance
              nearestIndex = index
            }
          })
          if (nearestIndex < 0) return base
          const enemies = [...current.enemies]
          enemies.splice(nearestIndex, 1)
          return { ...base, enemies, rescued: current.rescued + 1, score: current.score + 10 }
        })
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false
      keysRef.current[event.code.toLowerCase()] = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [isOpen, selectedGame])

  useEffect(() => {
    if (!isOpen || selectedGame !== "snake") return
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === "arrowup" || key === "w") {
        event.preventDefault()
        applySnakeDirection("up")
      } else if (key === "arrowdown" || key === "s") {
        event.preventDefault()
        applySnakeDirection("down")
      } else if (key === "arrowleft" || key === "a") {
        event.preventDefault()
        applySnakeDirection("left")
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault()
        applySnakeDirection("right")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, selectedGame])

  useEffect(() => {
    if (!isOpen || selectedGame !== "tetris") return
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === "arrowleft" || key === "a") {
        event.preventDefault()
        tryMoveTetris(-1, 0)
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault()
        tryMoveTetris(1, 0)
      } else if (key === "arrowdown" || key === "s") {
        event.preventDefault()
        tryMoveTetris(0, 1)
      } else if (key === "arrowup" || key === "w") {
        event.preventDefault()
        rotateTetris()
      } else if (key === " " || key === "spacebar") {
        event.preventDefault()
        hardDropTetris()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, selectedGame])

  useEffect(() => {
    if (!isOpen || selectedGame !== "snake" || snakeState.isGameOver) return
    const timer = window.setInterval(() => {
      setSnakeState((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isOpen, selectedGame, snakeState.isGameOver])

  useEffect(() => {
    if (!isOpen || selectedGame !== "tetris" || tetrisState.isGameOver) return
    const timer = window.setInterval(() => {
      setTetrisState((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isOpen, selectedGame, tetrisState.isGameOver])

  useEffect(() => {
    if (!isOpen) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onEscape)
    return () => window.removeEventListener("keydown", onEscape)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || selectedGame !== "management") return
    const nextBest = Math.max(managementBestScore, managementState.score)
    if (nextBest !== managementBestScore) setManagementBestScore(nextBest)
    const payload: SavedPatrolProgress = {
      version: 1,
      difficulty: managementDifficulty,
      state: managementState,
      bestScore: nextBest,
    }
    localStorage.setItem(managementKey, JSON.stringify(payload))
  }, [
    isOpen,
    managementBestScore,
    managementDifficulty,
    managementKey,
    managementState,
    selectedGame,
  ])

  useEffect(() => {
    if (!isOpen || selectedGame !== "snake") return
    const payload: SavedSnakeProgress = { version: 1, state: snakeState }
    localStorage.setItem(snakeKey, JSON.stringify(payload))
  }, [isOpen, selectedGame, snakeKey, snakeState])

  useEffect(() => {
    if (!isOpen || selectedGame !== "tetris") return
    const payload: SavedTetrisProgress = { version: 1, state: tetrisState }
    localStorage.setItem(tetrisKey, JSON.stringify(payload))
  }, [isOpen, selectedGame, tetrisKey, tetrisState])

  useEffect(() => {
    if (!isOpen || selectedGame !== "management") return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#102036")
    gradient.addColorStop(1, "#0a1524")
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    managementState.enemies.forEach((enemy) => {
      const sleep = spritesRef.current.sleep
      if (sleep && sleep.complete && sleep.naturalWidth > 0) {
        context.drawImage(sleep, enemy.x - 30, enemy.y - 30, 60, 60)
      } else {
        context.fillStyle = "#60a5fa"
        context.beginPath()
        context.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2)
        context.fill()
      }
    })

    const player =
      managementState.actionMsLeft > 0
        ? managementState.facing === "left"
          ? spritesRef.current.actionLeft
          : spritesRef.current.actionRight
        : managementState.facing === "left"
          ? spritesRef.current.goLeft
          : spritesRef.current.goRight
    if (player && player.complete && player.naturalWidth > 0) {
      context.drawImage(player, managementState.playerX - 44, managementState.playerY - 44, 88, 88)
    } else {
      context.fillStyle = "#facc15"
      context.beginPath()
      context.arc(managementState.playerX, managementState.playerY, 16, 0, Math.PI * 2)
      context.fill()
    }
  }, [isOpen, managementState, selectedGame])

  const managementTotal = managementState.rescued + managementState.missed
  const managementSuccessRate =
    managementTotal > 0 ? Math.round((managementState.rescued / managementTotal) * 100) : 0

  return (
    <>
      <Card className="border-slate-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-readable-sm text-high-contrast">
            <span className="inline-flex items-center gap-2">
              <Gamepad2 className="size-4" />
              Мини-игры
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          <p className="text-readable-xs text-muted-high-contrast">5 минут перезагрузки.</p>
          <Button type="button" className="w-full" onClick={() => setIsOpen(true)}>
            <Play className="mr-2 size-4" />
            Открыть игровую зону
          </Button>
        </CardContent>
      </Card>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-[2px]">
          <div className="flex h-full w-full flex-col overflow-hidden border border-slate-700 bg-slate-950">
            <header className="flex items-start justify-between gap-3 border-b border-slate-700 px-4 py-3 sm:items-center sm:px-5">
              <div className="min-w-0">
                <h2 className="text-readable-lg font-semibold text-white">Игровая зона</h2>
                <p className="text-readable-xs text-slate-300">Выберите игру.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-500 bg-slate-900 text-slate-100 hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" />
                Закрыть
              </Button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
              <aside className="border-b border-slate-700 p-3 lg:border-b-0 lg:border-r">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGame("management")}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition",
                      selectedGame === "management"
                        ? "border-cyan-400/70 bg-cyan-500/15"
                        : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-lg border border-slate-600 bg-slate-800">
                        <img src={sleepIconSrc} alt="Менеджмент" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-readable-sm font-semibold text-white">Менеджмент</p>
                        <p className="text-readable-xs text-slate-300">Разбудите спящих и наберите очки.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGame("tetris")}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition",
                      selectedGame === "tetris"
                        ? "border-cyan-400/70 bg-cyan-500/15"
                        : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg border border-slate-600 bg-slate-800 text-2xl text-cyan-300">
                        T
                      </div>
                      <div>
                        <p className="text-readable-sm font-semibold text-white">Тетрис</p>
                        <p className="text-readable-xs text-slate-300">Собирайте линии и держите темп.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </aside>

              <main className="min-h-0 overflow-auto p-3 sm:p-4">
                {selectedGame === "management" ? (
                  <section className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {(Object.keys(DIFFICULTY_LABEL) as DifficultyLevel[]).map((difficulty) => (
                        <Button
                          key={difficulty}
                          type="button"
                          size="sm"
                          variant={managementDifficulty === difficulty ? "default" : "outline"}
                          className={cn(
                            managementDifficulty === difficulty
                              ? "bg-cyan-600 text-white hover:bg-cyan-500"
                              : "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
                          )}
                          onClick={() => setManagementDifficulty(difficulty)}
                        >
                          {DIFFICULTY_LABEL[difficulty]}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Счет</p>
                        <p className="text-readable-lg font-semibold text-white">{managementState.score}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Лучший</p>
                        <p className="text-readable-lg font-semibold text-white">{managementBestScore}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Успешность</p>
                        <p className="text-readable-lg font-semibold text-white">{managementSuccessRate}%</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="inline-flex items-center gap-1 text-readable-xs text-slate-300">
                          <Clock3 className="size-3.5" />
                          Время
                        </p>
                        <p className="text-readable-lg font-semibold text-white">
                          {formatTimer(managementState.elapsedSeconds)}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                      <canvas
                        ref={canvasRef}
                        width={BOARD_WIDTH}
                        height={BOARD_HEIGHT}
                        className="h-auto w-full max-w-full"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                        onClick={startNewManagement}
                      >
                        <RotateCcw className="mr-2 size-4" />
                        Начать заново
                      </Button>
                      <p className="text-readable-xs text-slate-300">
                        Управление: `WASD` или стрелки, действие: `Пробел`.
                      </p>
                    </div>

                    {managementReminder ? (
                      <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-amber-100">
                        5 минут прошло. Пора за работу.
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <section className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Счет</p>
                        <p className="text-readable-sm font-semibold text-white">{tetrisState.score}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Лучший</p>
                        <p className="text-readable-sm font-semibold text-white">{tetrisState.bestScore}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Линии</p>
                        <p className="text-readable-sm font-semibold text-white">{tetrisState.lines}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="text-readable-xs text-slate-300">Уровень</p>
                        <p className="text-readable-sm font-semibold text-white">{tetrisState.level}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                        <p className="inline-flex items-center gap-1 text-readable-xs text-slate-300">
                          <Clock3 className="size-3.5" />
                          Время
                        </p>
                        <p className="text-readable-sm font-semibold text-white">
                          {formatTimer(tetrisState.elapsedSeconds)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[300px_1fr]">
                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                        <p className="text-readable-xs text-slate-300">Следующая фигура</p>
                        <div className="mt-2 grid w-full max-w-[120px] grid-cols-4 gap-[3px] rounded-lg bg-slate-950 p-2">
                          {Array.from({ length: 16 }, (_, index) => {
                            const x = index % 4
                            const y = Math.floor(index / 4)
                            const key = `${x}:${y}`
                            const active = tetrisPreviewSet.has(key)
                            return (
                              <div
                                key={key}
                                className={cn("aspect-square rounded-[2px]", active ? "bg-cyan-300" : "bg-slate-800")}
                              />
                            )
                          })}
                        </div>
                        <p className="mt-3 text-readable-xs text-slate-300">
                          Управление: `A/D` или стрелки, `W/↑` - поворот, `S/↓` - ускорить, `Пробел` - сброс.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            className="bg-cyan-600 text-white hover:bg-cyan-500"
                            onClick={restartTetris}
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Начать заново
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-2 sm:p-3">
                        <div
                          className="mx-auto grid max-w-[360px] gap-[2px] rounded-lg bg-slate-950 p-[2px]"
                          style={{ gridTemplateColumns: `repeat(${TETRIS_COLS}, minmax(0, 1fr))` }}
                        >
                          {tetrisDisplayBoard.map((row, y) =>
                            row.map((cell, x) => {
                              const color = cell ? TETRIS_COLORS[cell] : undefined
                              return (
                                <div
                                  key={`${y}:${x}`}
                                  className="aspect-square rounded-[2px] border border-slate-900/50"
                                  style={{ backgroundColor: color ?? "#1e293b" }}
                                />
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {tetrisState.isGameOver ? (
                      <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-rose-100">
                        Игра окончена. Нажмите «Начать заново».
                      </div>
                    ) : null}

                    {tetrisReminder ? (
                      <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-amber-100">
                        5 минут прошло. Пора за работу.
                      </div>
                    ) : null}
                  </section>
                )}
              </main>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
