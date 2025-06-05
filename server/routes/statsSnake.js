const express = require('express');
const router = express.Router();
const { statsSnakeModel } = require('../db');  // Modelo con callbacks

// GET - Obtener estadísticas de un usuario o crear registro si no existe
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(`[GET] /api/statsSnake/${userId} - Inicio petición`);

  statsSnakeModel.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[GET] Error al obtener stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[GET] No existe registro para userId=${userId}, creando uno nuevo...`);
      statsSnakeModel.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[GET] Error al crear stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[GET] Registro creado para userId=${userId}, devolviendo valores por defecto.`);
        return res.json({
          userId,
          highScore: 0,
          gamesPlayed: 0,
        });
      });
    } else {
      console.log(`[GET] Estadísticas encontradas para userId=${userId}:`, row);
      res.json(row);
    }
  });
});

// POST - Actualizar estadísticas, o crear registro si no existe
router.post('/:userId', (req, res) => {
  const userId = req.params.userId;
  let { highScore, gamesPlayed } = req.body;

  console.log(`[POST] /api/statsSnake/${userId} - Datos recibidos:`, req.body);

  // Validar y convertir a números
  highScore = Number(highScore);
  gamesPlayed = Number(gamesPlayed);

  if (Number.isNaN(highScore) || Number.isNaN(gamesPlayed)) {
    console.warn(`[POST] Datos inválidos para userId=${userId}:`, { highScore, gamesPlayed });
    return res.status(400).json({ error: "Datos inválidos. Deben ser números." });
  }

  // Primero intentamos obtener las stats para ver si existen
  statsSnakeModel.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[POST] Error al obtener stats para userId=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    // Si no existen, creamos el registro primero
    const updateStats = () => {
      statsSnakeModel.updateStats(userId, highScore, gamesPlayed, (err) => {
        if (err) {
          console.error(`[POST] Error al actualizar stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Stats actualizadas correctamente para userId=${userId}.`);
        res.json({
          userId,
          highScore,
          gamesPlayed,
        });
      });
    };

    if (!row) {
      console.log(`[POST] No existe stats para userId=${userId}, creando registro...`);
      statsSnakeModel.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[POST] Error al crear stats para userId=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Registro creado, ahora actualizamos stats para userId=${userId}...`);
        updateStats();
      });
    } else {
      console.log(`[POST] Stats existentes para userId=${userId}, actualizando...`);
      updateStats();
    }
  });
});

module.exports = router;
