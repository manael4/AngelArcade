// src/hooks/useGameLogic.js
import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { TOWER_TYPES, TILE_SIZE, PATH } from "../utils/constants";

const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const useGameLogic = () => {
  const {
    enemies,
    setEnemies,
    towers,
    setTowers,
    enemyReachedEnd,
    rewardPlayer,
    waveInProgress,
    setWaveInProgress,
    setLives,
  } = useContext(GameContext);

  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!waveInProgress) return;

    let animationFrameId;

    const gameLoop = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;

      setEnemies((prevEnemies) => {
        let newEnemies = [...prevEnemies];

        // Mover enemigos según velocidad y delta
        newEnemies = newEnemies.map((enemy) => {
          if (enemy.health <= 0) return enemy; // muertos no se mueven

          let moveDistance = (enemy.speed * delta) / 16; // movimiento proporcional

          // Si ralentizado
          if (enemy.slowed) {
            moveDistance *= 0.5;
          }

          let nextPathIndex = enemy.pathIndex;
          let remainingMove = moveDistance;

          // Mover al enemigo a lo largo del camino
          while (remainingMove > 0 && nextPathIndex < PATH.length - 1) {
            const currentPos = {
              x: PATH[nextPathIndex].x * TILE_SIZE,
              y: PATH[nextPathIndex].y * TILE_SIZE,
            };
            const nextPos = {
              x: PATH[nextPathIndex + 1].x * TILE_SIZE,
              y: PATH[nextPathIndex + 1].y * TILE_SIZE,
            };

            const segmentLength = distance(currentPos, nextPos);
            const distToNextPoint = segmentLength - (enemy.offset || 0);

            if (remainingMove < distToNextPoint) {
              // Mover dentro del segmento
              enemy.offset = (enemy.offset || 0) + remainingMove;
              remainingMove = 0;
            } else {
              // Saltar al siguiente punto
              remainingMove -= distToNextPoint;
              nextPathIndex++;
              enemy.offset = 0;
            }
          }

          enemy.pathIndex = nextPathIndex;

          // Si llegó al final
          if (enemy.pathIndex >= PATH.length - 1) {
            enemy.health = 0;
            enemyReachedEnd();
          }

          return enemy;
        });

        // Filtrar enemigos muertos y recompensar recursos
        const aliveEnemies = [];
        newEnemies.forEach((e) => {
          if (e.health > 0) {
            aliveEnemies.push(e);
          } else {
            rewardPlayer(e.reward);
          }
        });

        // Si no quedan enemigos, termina oleada
        if (aliveEnemies.length === 0) {
          setWaveInProgress(false);
        }

        return aliveEnemies;
      });

      // Torretas disparando
      setTowers((prevTowers) => {
        const now = performance.now();
        const newTowers = [...prevTowers];

        newTowers.forEach((tower) => {
          if (!tower.lastShot) tower.lastShot = 0;

          if (now - tower.lastShot < TOWER_TYPES[tower.type].fireRate / tower.level) {
            return;
          }

          const towerPos = {
            x: tower.position.x * TILE_SIZE + TILE_SIZE / 2,
            y: tower.position.y * TILE_SIZE + TILE_SIZE / 2,
          };

          // Prioridad: enemigo más cerca del final
          let targetEnemy = null;
          let maxPathIndex = -1;
          enemies.forEach((enemy) => {
            if (enemy.health <= 0) return;
            // Calcular posición actual del enemigo
            const enemyPos = calculateEnemyPosition(enemy);
            const dist = distance(towerPos, enemyPos);
            if (dist <= TOWER_TYPES[tower.type].range) {
              if (enemy.pathIndex > maxPathIndex) {
                maxPathIndex = enemy.pathIndex;
                targetEnemy = enemy;
              }
            }
          });

          if (targetEnemy) {
            tower.lastShot = now;

            // Aplicar daño / efectos según tipo
            if (tower.type === "explosive") {
              // Daño en área
              setEnemies((prevEnemies) => {
                return prevEnemies.map((enemy) => {
                  if (enemy.health <= 0) return enemy;
                  const enemyPos = calculateEnemyPosition(enemy);
                  const targetPos = calculateEnemyPosition(targetEnemy);
                  if (distance(enemyPos, targetPos) <= TOWER_TYPES.explosive.splashRadius) {
                    enemy.health -= TOWER_TYPES.explosive.damage*(0.5+0.5*tower.level);
                  }
                  return enemy;
                });
              });
            } else if (tower.type === "slow") {
              // Daño ligero y ralentización
              setEnemies((prevEnemies) =>
                prevEnemies.map((enemy) => {
                  if (enemy.id === targetEnemy.id) {
                    enemy.health -= TOWER_TYPES.slow.damage*(0.5+0.5*tower.level);
                    enemy.slowed = true;
                  }
                  return enemy;
                })
              );
            } else {
              // Daño simple
              setEnemies((prevEnemies) =>
                prevEnemies.map((enemy) => {
                  if (enemy.id === targetEnemy.id) {
                    enemy.health -= TOWER_TYPES[tower.type].damage*(0.5+0.5*tower.level);
                  }
                  return enemy;
                })
              );
            }
          }
        });
        return newTowers;
      });

      lastTimeRef.current = time;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [waveInProgress, enemies, towers, enemyReachedEnd, rewardPlayer, setEnemies, setTowers, setWaveInProgress, setLives]);

  // Función auxiliar para calcular la posición pixel de un enemigo según su progreso
  const calculateEnemyPosition = (enemy) => {
    if (!enemy) return { x: 0, y: 0 };
    const idx = enemy.pathIndex;
    const offset = enemy.offset || 0;
    if (idx >= PATH.length - 1) {
      const last = PATH[PATH.length - 1];
      return { x: last.x * TILE_SIZE, y: last.y * TILE_SIZE };
    }
    const current = PATH[idx];
    const next = PATH[idx + 1];

    const dx = next.x - current.x;
    const dy = next.y - current.y;

    return {
      x: current.x * TILE_SIZE + dx * offset,
      y: current.y * TILE_SIZE + dy * offset,
    };
  };

  return { calculateEnemyPosition };
};
