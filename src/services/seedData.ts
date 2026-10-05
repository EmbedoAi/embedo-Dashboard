import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } from '@/lib/constants'
import type {
  AdminUser,
  ApiKeyUsage,
  AiUsagePoint,
  Diagram,
  DiagramMode,
  PlanTier,
  UserStatus,
} from './types'

// Simple deterministic pseudo-random generator so the seed is stable across
// runs within a session (still varied enough to look like real data).
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5)
  return shuffled.slice(0, count)
}

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const FIRST_NAMES = [
  'Ava', 'Liam', 'Noah', 'Emma', 'Oliver', 'Sophia', 'Elijah', 'Mia',
  'Lucas', 'Amelia', 'Mason', 'Harper', 'Ethan', 'Evelyn', 'James',
  'Ella', 'Benjamin', 'Grace', 'Henry', 'Chloe', 'Aiden', 'Lily',
  'Sebastian', 'Zoe', 'Jack',
]
const LAST_NAMES = [
  'Carter', 'Nguyen', 'Patel', 'Kim', 'Rossi', 'Muller', 'Silva',
  'Anderson', 'Khan', 'Ivanov', 'Garcia', 'Chen', 'Dubois', 'Novak',
  'Okafor', 'Larsen', 'Costa', 'Sato', 'Weber', 'Haddad', 'Petrov',
  'Brown', 'Kowalski', 'Tanaka', 'Moreau',
]

// Modeled on embedo.ai's own demo project ("AI Voice Recorder" on an
// ESP32-S3-MINI) — these are the kinds of embedded-hardware projects the
// product's architect/prototype modes are actually built around.
const PROJECT_TEMPLATES: { name: string; tagline: string; controller: string }[] = [
  { name: 'AI Voice Recorder', tagline: 'Always-on voice capture with on-device wake word', controller: 'ESP32-S3-MINI' },
  { name: 'BLE Fitness Tracker', tagline: 'Battery-powered wearable with IMU and heart-rate sensing', controller: 'nRF52840' },
  { name: 'Smart Irrigation Controller', tagline: 'Soil-moisture driven valve controller with solar charging', controller: 'ESP32-C3' },
  { name: 'Warehouse Asset Tracker', tagline: 'GPS + BLE beacon tracker with long sleep cycles', controller: 'STM32L4' },
  { name: 'Portable CO2 Monitor', tagline: 'Handheld air-quality meter with e-ink display', controller: 'ESP32-S3-MINI' },
  { name: 'Modular Synth Sequencer', tagline: 'Eurorack-compatible step sequencer with MIDI out', controller: 'RP2040' },
  { name: 'Cold Chain Data Logger', tagline: 'Temperature/humidity logger for pharma shipping', controller: 'STM32L0' },
  { name: 'Smart Doorbell Camera', tagline: 'Low-power camera node with Wi-Fi backhaul', controller: 'ESP32-S3-MINI' },
  { name: 'Robotic Arm Controller', tagline: 'Six-axis servo driver with CAN bus telemetry', controller: 'STM32F4' },
  { name: 'Beehive Health Monitor', tagline: 'Weight, temperature, and audio sensing for hives', controller: 'ESP32-C3' },
  { name: 'Portable Weather Station', tagline: 'Solar-powered station with LoRa uplink', controller: 'RP2040' },
  { name: 'Pet Feeder Automation', tagline: 'Scheduled feeder with load-cell portion sensing', controller: 'ESP32-S3-MINI' },
  { name: 'EV Charging Meter', tagline: 'Current-sense metering node with cloud reporting', controller: 'STM32F1' },
  { name: 'Greenhouse Climate Controller', tagline: 'Multi-zone fan/vent controller with sensor mesh', controller: 'ESP32-C3' },
  { name: 'Wearable Fall Detector', tagline: 'IMU-based fall detection with BLE alert relay', controller: 'nRF52840' },
]

// Parts drawn from the same real-world catalog style used in embedo.ai's
// component/BOM views (BQ25186, BME280, BMI270, DRV2605L, etc.).
const PARTS_POOL = [
  'BQ25186 — 1-cell Li-Po charger',
  'AP63203WU-7 — 3A buck regulator',
  'BME280 — environmental sensor',
  'BMI270 — 6-axis IMU',
  'DRV2605L — haptic driver',
  'BQ27426 — fuel gauge',
  'KLM8G1GETF — 8GB eMMC storage',
  'MMICT5848 — MEMS microphone',
  'SX1262 — LoRa transceiver',
  'MCP73831 — Li-Po charge management',
  'TPS63020 — buck-boost converter',
  'LIS3DH — 3-axis accelerometer',
  'W25Q128 — 16MB SPI flash',
  'SHT31 — humidity/temperature sensor',
  'MAX17048 — fuel gauge',
]

const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 50,
  pro: 500,
  team: 2000,
}

function buildUsers(): AdminUser[] {
  const statuses: UserStatus[] = [
    ...Array(17).fill('approved'),
    ...Array(5).fill('pending'),
    ...Array(3).fill('suspended'),
  ]
  const plans: PlanTier[] = ['free', 'free', 'free', 'pro', 'pro', 'team']

  return statuses.map((status, i) => {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const name = `${first} ${last}`
    const plan = pick(plans)
    const limit = PLAN_LIMITS[plan]
    const createdDaysAgo = Math.floor(rand() * 90)
    const lastActiveDaysAgo = Math.floor(rand() * createdDaysAgo)

    return {
      id: `user-${i + 1}`,
      email: `${first}.${last}${i}`.toLowerCase() + '@example.com',
      name,
      role: 'user',
      status,
      plan,
      creditsUsed: Math.floor(rand() * limit),
      creditsLimit: limit,
      diagramCount: 0, // filled in after diagrams are generated
      createdAt: daysAgoIso(createdDaysAgo),
      lastActiveAt: daysAgoIso(lastActiveDaysAgo),
    }
  })
}

function buildDiagrams(users: AdminUser[]): Diagram[] {
  const diagrams: Diagram[] = []
  let id = 1

  for (const user of users) {
    if (user.status !== 'approved') continue
    const count = Math.floor(rand() * 8) + 1
    for (let i = 0; i < count; i++) {
      const createdDaysAgo = Math.floor(rand() * 60)
      const updatedDaysAgo = Math.floor(rand() * createdDaysAgo)
      const template = pick(PROJECT_TEMPLATES)
      const mode: DiagramMode = rand() < 0.65 ? 'architect' : 'prototype'
      const componentCount = Math.floor(rand() * 10) + 4

      diagrams.push({
        id: `diagram-${id++}`,
        ownerId: user.id,
        ownerEmail: user.email,
        title: template.name,
        tagline: template.tagline,
        mode,
        controller: template.controller,
        nodeCount: Math.floor(rand() * 38) + 3,
        componentCount,
        bomEstUnitCostUsd: Math.round((componentCount * (2 + rand() * 6) + rand() * 10) * 100) / 100,
        keyParts: pickMany(PARTS_POOL, Math.min(4, componentCount)),
        aiMessagesUsed: Math.floor(rand() * 24) + 2,
        createdAt: daysAgoIso(createdDaysAgo),
        updatedAt: daysAgoIso(updatedDaysAgo),
      })
    }
    user.diagramCount = count
  }

  return diagrams
}

export function generateSeedUsersAndDiagrams(): { users: AdminUser[]; diagrams: Diagram[] } {
  const users = buildUsers()
  const diagrams = buildDiagrams(users)
  return { users, diagrams }
}

export function generateSeedAdmin() {
  return {
    id: 'admin-1',
    email: SEED_ADMIN_EMAIL,
    name: 'Embedo Admin',
    password: SEED_ADMIN_PASSWORD,
  }
}

function last14Days(): string[] {
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function generateApiKeys(): ApiKeyUsage[] {
  return [
    {
      id: 'key-openai-1',
      provider: 'openai',
      label: 'Production — Embedo Copilot',
      maskedKey: 'sk-••••••••jX2k',
      status: 'active',
      monthlyLimitUsd: 500,
      usedThisMonthUsd: 318.42,
      requestsThisMonth: 8412,
      tokensThisMonth: 2_140_000,
      createdAt: daysAgoIso(120),
      lastUsedAt: daysAgoIso(0),
    },
    {
      id: 'key-anthropic-1',
      provider: 'anthropic',
      label: 'Fallback — Claude Haiku',
      maskedKey: 'sk-ant-••••••••7qLp',
      status: 'active',
      monthlyLimitUsd: 200,
      usedThisMonthUsd: 54.17,
      requestsThisMonth: 1_203,
      tokensThisMonth: 410_000,
      createdAt: daysAgoIso(90),
      lastUsedAt: daysAgoIso(1),
    },
    {
      id: 'key-openai-2',
      provider: 'openai',
      label: 'Staging — Intent Discussion',
      maskedKey: 'sk-••••••••q9Rv',
      status: 'revoked',
      monthlyLimitUsd: 100,
      usedThisMonthUsd: 12.6,
      requestsThisMonth: 340,
      tokensThisMonth: 62_000,
      createdAt: daysAgoIso(200),
      lastUsedAt: daysAgoIso(45),
    },
  ]
}

export function generateAiUsageDaily(): AiUsagePoint[] {
  return last14Days().map((date) => ({
    date,
    costUsd: Math.round((10 + rand() * 25) * 100) / 100,
    requests: Math.floor(60 + rand() * 180),
  }))
}
