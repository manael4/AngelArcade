const express = require('express');
const router = express.Router();
const { statsChessModel } = require('../db');

// Obtener estadísticas de un usuario
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(`[GET] /api/statsChess/${userId} - Inicio petición`);

  statsChessModel.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[GET] Error al obtener stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[GET] No existe registro para userId=${userId}, creando uno nuevo...`);
      statsChessModel.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[GET] Error al crear stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[GET] Registro creado para userId=${userId}, devolviendo valores por defecto.`);
        return res.json({
          user_id: userId,
          wins_white: 0,
          wins_black: 0,
        });
      });
    } else {
      console.log(`[GET] Estadísticas encontradas para userId=${userId}:`, row);
      res.json(row);
    }
  });
});

// Actualizar estadísticas de un usuario
router.post('/:userId', (req, res) => {
  const userId = req.params.userId;
  let { wins_white, wins_black} = req.body;

  console.log(`[POST] /api/statsChess/${userId} - Datos recibidos:`, req.body);

  // Convertir a números si vienen como strings
  wins_white = Number(wins_white);
  wins_black = Number(wins_black);

  if (
    Number.isNaN(wins_white) ||
    Number.isNaN(wins_black)
  ) {
    console.warn(`[POST] Datos inválidos para userId=${userId}:`, { wins_white, wins_black});
    return res.status(400).json({ error: 'Datos inválidos. Deben ser números.' });
  }

  statsChessModel.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[POST] Error al obtener stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[POST] No existe stats para userId=${userId}, creando registro...`);
      statsChessModel.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[POST] Error al crear stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Registro creado, actualizando stats para userId=${userId}...`);
        statsChessModel.updateStats(userId, wins_white, wins_black, (err) => {
          if (err) {
            console.error(`[POST] Error al actualizar stats para userId=${userId}:`, err.message);
            return res.status(500).json({ error: err.message });
          }

          console.log(`[POST] Stats actualizadas correctamente para userId=${userId}.`);
          res.json({
            user_id: userId,
            wins_white,
            wins_black
          });
        });
      });
    } else {
      console.log(`[POST] Stats existentes para userId=${userId}, actualizando...`);
      statsChessModel.updateStats(userId, wins_white, wins_black, (err) => {
        if (err) {
          console.error(`[POST] Error al actualizar stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Stats actualizadas correctamente para userId=${userId}.`);
        res.json({
          user_id: userId,
          wins_white,
          wins_black,
        });
      });
    }
  });
});

module.exports = router;
