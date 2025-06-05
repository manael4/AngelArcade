const express = require('express');
const router = express.Router();
const { statsMemoryModel } = require('../db');

// Obtener estadísticas de un usuario
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(`[GET] /api/statsMemory/${userId} - Inicio petición`);

  statsMemoryModel.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[GET] Error al obtener stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[GET] No existe registro para userId=${userId}, creando uno nuevo...`);
      statsMemoryModel.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[GET] Error al crear stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        return res.json({
          id: userId,
          gamesPlayed: 0,
          bestScore: null,
          pairsDiscovered: 0,
        });
      });
    } else {
      res.json(row);
    }
  });
});

// Actualizar todas las estadísticas de un usuario
router.post('/:userId', (req, res) => {
  const userId = req.params.userId;
  let { gamesPlayed, bestScore, pairsDiscovered } = req.body;

  gamesPlayed = Number(gamesPlayed);
  bestScore = bestScore !== null ? Number(bestScore) : null;
  pairsDiscovered = Number(pairsDiscovered);

  if (
    Number.isNaN(gamesPlayed) ||
    (bestScore !== null && Number.isNaN(bestScore)) ||
    Number.isNaN(pairsDiscovered)
  ) {
    return res.status(400).json({ error: 'Datos inválidos. Deben ser números o null.' });
  }

  statsMemoryModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const update = () => {
      statsMemoryModel.updateStats(userId, gamesPlayed, bestScore, pairsDiscovered, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          id: userId,
          gamesPlayed,
          bestScore,
          pairsDiscovered,
        });
      });
    };

    if (!row) {
      statsMemoryModel.createStatsForUser(userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        update();
      });
    } else {
      update();
    }
  });
});

// Incrementar en 1 el contador de parejas descubiertas
router.patch('/:userId/pair', (req, res) => {
  const userId = req.params.userId;

  statsMemoryModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      statsMemoryModel.createStatsForUser(userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        statsMemoryModel.updateStats(userId, 0, null, 1, (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ id: userId, gamesPlayed: 0, bestScore: null, pairsDiscovered: 1 });
        });
      });
    } else {
      const newPairs = row.pairsDiscovered + 1;
      statsMemoryModel.updateStats(userId, row.gamesPlayed, row.bestScore, newPairs, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          id: userId,
          gamesPlayed: row.gamesPlayed,
          bestScore: row.bestScore,
          pairsDiscovered: newPairs,
        });
      });
    }
  });
});

// Incrementar en 1 el contador de partidas jugadas
router.patch('/:userId/game', (req, res) => {
  const userId = req.params.userId;

  statsMemoryModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      statsMemoryModel.createStatsForUser(userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        statsMemoryModel.updateStats(userId, 1, null, 0, (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ id: userId, gamesPlayed: 1, bestScore: null, pairsDiscovered: 0 });
        });
      });
    } else {
      const newGames = row.gamesPlayed + 1;
      statsMemoryModel.updateStats(userId, newGames, row.bestScore, row.pairsDiscovered, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          id: userId,
          gamesPlayed: newGames,
          bestScore: row.bestScore,
          pairsDiscovered: row.pairsDiscovered,
        });
      });
    }
  });
});

// Actualizar bestScore solo si el nuevo valor es mejor (menor)
router.patch('/:userId/bestScore', (req, res) => {
  const userId = req.params.userId;
  let { bestScore } = req.body;

  bestScore = Number(bestScore);
  if (Number.isNaN(bestScore)) {
    return res.status(400).json({ error: 'bestScore debe ser un número válido.' });
  }

  statsMemoryModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const updateScore = () => {
      statsMemoryModel.updateStats(userId, row?.gamesPlayed || 0, bestScore, row?.pairsDiscovered || 0, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          id: userId,
          gamesPlayed: row?.gamesPlayed || 0,
          bestScore,
          pairsDiscovered: row?.pairsDiscovered || 0,
        });
      });
    };

    if (!row || row.bestScore === null || bestScore < row.bestScore) {
      if (!row) {
        statsMemoryModel.createStatsForUser(userId, (err) => {
          if (err) return res.status(500).json({ error: err.message });
          updateScore();
        });
      } else {
        updateScore();
      }
    } else {
      res.json(row); // no se actualiza, el nuevo score no es mejor
    }
  });
});

module.exports = router;
