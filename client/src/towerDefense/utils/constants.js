// src/utils/constants.js
export const TILE_SIZE = 40; // Tamaño de cada tile del mapa
export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 10;
export const PATH = [
  { x: 0, y: 4 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 4 },
  { x: 4, y: 4 },
  { x: 4, y: 3 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 8, y: 2 },
  { x: 9, y: 2 },
  { x: 9, y: 3 },
  { x: 9, y: 4 },
  { x: 10, y: 4 },
  { x: 11, y: 4 },
  { x: 12, y: 4 },
  { x: 13, y: 4 },
  { x: 14, y: 4 },
];

// Tipos de torres disponibles con sus características base
export const TOWER_TYPES = {
  archer: {
    name: "Arquera",
    damage: 25,
    range: 100,
    fireRate: 1000,
    cost: 50,
    description: "Daño moderado",
  },
  slow: {
    name: "Ralentizadora",
    damage: 2,
    range: 90,
    fireRate: 1500,
    slowEffect: 0.5,
    cost: 60,
    description: "Reduce velocidad enemigos",
  },
  explosive: {
    name: "Explosiva",
    damage: 15,
    range: 80,
    fireRate: 2000,
    splashRadius: 40,
    cost: 70,
    description: "Daño en área",
  },
  fast: {
    name: "Rápida",
    damage: 6,
    range: 90,
    fireRate: 330,
    cost: 80,
    description: "Alta cadencia de disparo",
  },
  lethal: {
    name: "Letal",
    damage: 100,
    range: 85,
    fireRate: 2500,
    cost: 120,
    description: "Daño muy alto",
  },
};

// Enemigos base
export const ENEMY_BASE_STATS = {
  normal: {
    speed: 0.5,
    maxHealth: 50,
    reward: 5,
  },
  boss: {
    speed: 0.6,
    maxHealth: 375,
    reward: 100,
  },
};
