const express = require('express');
const router = express.Router();
const { statsSolitarioModel } = require('../db');

// Función auxiliar para asegurar que exista un registro antes de continuar
const ensureStatsExist = (userId, callback) => {
  statsSolitarioModel.getStatsByUser(userId, (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row);

    statsSolitarioModel.createStatsForUser(userId, (err) => {
      if (err) return callback(err);
      const emptyStats = {
        id: userId,
        gamesPlayed: 0,
        wins: 0,
        bestTime: null,
      };
      callback(null, emptyStats);
    });
  });
};

// GET
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(`[GET] /api/statsSolitario/${userId} - Inicio petición`);

  ensureStatsExist(userId, (err, stats) => {
    if (err) {
      console.error(`[GET] Error para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log(`[GET] Stats devueltas para userId=${userId}:`, stats);
    res.json(stats);
  });
});

// POST
router.post('/:userId', (req, res) => {
  const userId = req.params.userId;
  let { gamesPlayed, wins, bestTime} = req.body;

  console.log(`[POST] /api/statsSolitario/${userId} - Datos recibidos:`, req.body);

  gamesPlayed = Number(gamesPlayed);
  wins = Number(wins);
  bestTime = bestTime !== null ? Number(bestTime) : null;

  if (
    Number.isNaN(gamesPlayed) ||
    Number.isNaN(wins) ||
    (bestTime !== null && Number.isNaN(bestTime))
  ) {
    return res.status(400).json({ error: 'Datos inválidos. Deben ser números o null.' });
  }

  ensureStatsExist(userId, (err) => {
    if (err) {
      console.error(`[POST] Error al asegurar existencia de stats:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    statsSolitarioModel.updateStats(userId, gamesPlayed, wins, bestTime, (err) => {
      if (err) {
        console.error(`[POST] Error al actualizar stats para userId=${userId}:`, err.message);
        return res.status(500).json({ error: err.message });
      }

      console.log(`[POST] Stats actualizadas correctamente para userId=${userId}.`);
      res.json({
        id: userId,
        gamesPlayed,
        wins,
        bestTime,
      });
    });
  });
});

// PATCH
router.patch('/:userId', (req, res) => {
  const userId = req.params.userId;
  const allowedFields = ['gamesPlayed', 'wins', 'bestTime'];
  const updates = Object.entries(req.body).filter(([key]) => allowedFields.includes(key));

  if (updates.length !== 1) {
    return res.status(400).json({ error: 'Solo se permite actualizar un campo a la vez (gamesPlayed, wins, bestTime).' });
  }

  const [field, value] = updates[0];
  const numericValue = value !== null ? Number(value) : null;

  if (numericValue !== null && Number.isNaN(numericValue)) {
    return res.status(400).json({ error: 'El valor debe ser un número o null.' });
  }

  ensureStatsExist(userId, (err, existingRow) => {
    if (err) {
      console.error(`[PATCH] Error al asegurar existencia de stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    const updated = {
      gamesPlayed: existingRow.gamesPlayed,
      wins: existingRow.wins,
      bestTime: existingRow.bestTime,
      [field]: numericValue,
    };

    statsSolitarioModel.updateStats(userId, updated.gamesPlayed, updated.wins, updated.bestTime, (err) => {
      if (err) {
        console.error(`[PATCH] Error al actualizar campo ${field} para userId=${userId}:`, err.message);
        return res.status(500).json({ error: err.message });
      }

      console.log(`[PATCH] Campo ${field} actualizado para userId=${userId}.`);
      res.json({
        id: userId,
        ...updated,
      });
    });
  });
});

module.exports = router;
