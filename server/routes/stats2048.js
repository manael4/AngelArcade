const express = require('express');
const router = express.Router();
const { stats2048Model } = require('../db'); // Asumiendo que exportas el modelo como stats2048Model

// Obtener estadísticas de un usuario 2048
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  console.log(`[GET] /api/stats2048/${userId} - Inicio petición`);

  stats2048Model.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[GET] Error al obtener stats para id=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[GET] No existe registro para id=${userId}, creando uno nuevo...`);
      stats2048Model.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[GET] Error al crear stats para id=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[GET] Registro creado para id=${userId}, devolviendo valores por defecto.`);
        return res.json({
          id: userId,
          best_score: 0,
        });
      });
    } else {
      console.log(`[GET] Estadísticas encontradas para id=${userId}:`, row);
      res.json(row);
    }
  });
});

// Actualizar la mejor puntuación si es mayor
router.post('/:id', (req, res) => {
  const userId = req.params.id;
  let { best_score } = req.body;

  console.log(`[POST] /api/stats2048/${userId} - Datos recibidos:`, req.body);

  best_score = Number(best_score);

  if (Number.isNaN(best_score)) {
    console.warn(`[POST] Datos inválidos para id=${userId}: best_score = ${best_score}`);
    return res.status(400).json({ error: 'best_score debe ser un número válido.' });
  }

  stats2048Model.getStatsByUser(userId, (err, row) => {
    if (err) {
      console.error(`[POST] Error al obtener stats para id=${userId}:`, err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      console.log(`[POST] No existe stats para id=${userId}, creando registro...`);
      stats2048Model.createStatsForUser(userId, (err) => {
        if (err) {
          console.error(`[POST] Error al crear stats para id=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Registro creado, actualizando mejor puntuación para id=${userId}...`);
        stats2048Model.updateBestScore(userId, best_score, (err) => {
          if (err) {
            console.error(`[POST] Error al actualizar best_score para id=${userId}:`, err.message);
            return res.status(500).json({ error: err.message });
          }

          console.log(`[POST] Best score actualizado correctamente para id=${userId}.`);
          res.json({
            id: userId,
            best_score,
          });
        });
      });
    } else {
      console.log(`[POST] Stats existentes para id=${userId}, actualizando best_score...`);
      stats2048Model.updateBestScore(userId, best_score, (err) => {
        if (err) {
          console.error(`[POST] Error al actualizar best_score para id=${userId}:`, err.message);
          return res.status(500).json({ error: err.message });
        }

        console.log(`[POST] Best score actualizado correctamente para id=${userId}.`);
        res.json({
          id: userId,
          best_score,
        });
      });
    }
  });
});

module.exports = router;
