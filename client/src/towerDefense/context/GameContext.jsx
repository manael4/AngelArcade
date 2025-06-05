// src/context/GameContext.jsx
import { createContext, useState} from "react";
import { ENEMY_BASE_STATS, TOWER_TYPES, PATH } from "../utils/constants";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [lives, setLives] = useState(20);
  const [resources, setResources] = useState(200);
  const [currentWave, setCurrentWave] = useState(1);
  const [enemies, setEnemies] = useState([]);
  const [towers, setTowers] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [selectedTowerType, setSelectedTowerType] = useState(null);
  const [enemySpeedMultiplier] = useState(0.1);
  
  // Generar oleada de enemigos según la wave actual
  const generateWave = (waveNum) => {
    const baseEnemyCount = 5 + waveNum * 2;
    const isBossWave = waveNum % 5 === 0;

    const newEnemies = [];

    if (isBossWave) {
      // Un jefe al final de la oleada
      for (let i = 0; i < baseEnemyCount - 1; i++) {
        newEnemies.push({
          id: `enemy-${Date.now()}-${i}`,
          type: "normal",
          pathIndex: 0,
          health: ENEMY_BASE_STATS.normal.maxHealth * (1 + waveNum * 0.1),
          maxHealth: ENEMY_BASE_STATS.normal.maxHealth * (1 + waveNum * 0.1),
          speed: ENEMY_BASE_STATS.normal.speed * enemySpeedMultiplier,
          reward: ENEMY_BASE_STATS.normal.reward,
          slowed: false,
        });
      }
      newEnemies.push({
        id: `enemy-boss-${Date.now()}`,
        type: "boss",
        pathIndex: 0,
        health: ENEMY_BASE_STATS.boss.maxHealth * (1 + waveNum * 0.2),
        maxHealth: ENEMY_BASE_STATS.boss.maxHealth * (1 + waveNum * 0.2),
        speed: ENEMY_BASE_STATS.boss.speed * enemySpeedMultiplier,
        reward: ENEMY_BASE_STATS.boss.reward,
        slowed: false,
      });
    } else {
      for (let i = 0; i < baseEnemyCount; i++) {
        newEnemies.push({
          id: `enemy-${Date.now()}-${i}`,
          type: "normal",
          pathIndex: 0,
          health: ENEMY_BASE_STATS.normal.maxHealth * (1 + waveNum * 0.1),
          maxHealth: ENEMY_BASE_STATS.normal.maxHealth * (1 + waveNum * 0.1),
          speed: ENEMY_BASE_STATS.normal.speed * enemySpeedMultiplier,
          reward: ENEMY_BASE_STATS.normal.reward,
          slowed: false,
        });
      }
    }

    setEnemies((prev) => [...prev, ...newEnemies]);
    setWaveInProgress(true);
  };

  // Reducir vidas cuando un enemigo llega a la meta
  const enemyReachedEnd = () => {
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setGameOver(true);
      }
      return nextLives;
    });
  };

  // Recompensa al matar enemigo
  const rewardPlayer = (amount) => {
    setResources((prev) => prev + amount);
  };

  // Añadir torre si hay recursos
  const addTower = (type, position) => {
    if (!TOWER_TYPES[type]) return false;
    if (resources < TOWER_TYPES[type].cost) return false;

    const newTower = {
      id: `tower-${Date.now()}`,
      type,
      position,
      level: 1,
      lastShot: 0,
    };
    setTowers((prev) => [...prev, newTower]);
    setResources((prev) => prev - TOWER_TYPES[type].cost);
    return true;
  };

  // Mejorar torre si hay recursos
  const upgradeTower = (towerId) => {
    setTowers((prev) => {
      const newTowers = [...prev];
      const towerIndex = newTowers.findIndex((t) => t.id === towerId);
      if (towerIndex === -1) return prev;
      const tower = newTowers[towerIndex];
      const upgradeCost = Math.floor(TOWER_TYPES[tower.type].cost * (0.8 + 0.4 * (tower.level -1)));
      if (resources < upgradeCost) return prev;
      if (tower.level >= 5) return prev; // max nivel 5

      tower.level += 1;
      setResources((r) => r - upgradeCost);
      return newTowers;
    });
  };

  // Avanzar a siguiente oleada
  const nextWave = () => {
    if (waveInProgress) return;
    if (currentWave >= 100) {
      setGameWon(true);
      return;
    }
    setCurrentWave((w) => w + 1);
    setLives(prev=> prev+2)
    generateWave(currentWave + 1);
  };

  // Reseteo para nuevo juego
  const resetGame = () => {
    setLives(20);
    setResources(200);
    setCurrentWave(1);
    setEnemies([]);
    setTowers([]);
    setGameOver(false);
    setGameWon(false);
    setWaveInProgress(false);
  };

  return (
    <GameContext.Provider
      value={{
        lives,
        setLives,
        resources,
        currentWave,
        enemies,
        setEnemies,
        towers,
        setTowers,
        gameOver,
        gameWon,
        waveInProgress,
        setWaveInProgress,
        enemyReachedEnd,
        rewardPlayer,
        addTower,
        upgradeTower,
        nextWave,
        resetGame,
        selectedTowerType,
        setSelectedTowerType,
        PATH,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
