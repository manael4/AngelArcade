const express = require('express');
const router = express.Router();

const { statsBuscaminasModel } = require('../db'); 

// GET para obtener estadísticas del usuario
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;

  statsBuscaminasModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      // Crear registro nuevo si no existe
      statsBuscaminasModel.createStatsForUser(userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Valores iniciales
        const inicial = {
          easy_gamesPlayed: 0,
          normal_gamesPlayed: 0,
          hard_gamesPlayed: 0,
          easy_wins: 0,
          normal_wins: 0,
          hard_wins: 0,
          easy_fastestTime: null,
          normal_fastestTime: null,
          hard_fastestTime: null,
        };
        res.json({ user_id: userId, ...inicial });
      });
    } else {
      // Devolver los datos encontrados
      res.json({ user_id: userId, ...row });
    }
  });
});

// POST para actualizar estadísticas (suma o reemplaza el tiempo si es mejor)
router.post('/:userId', (req, res) => {
  const userId = req.params.userId;
  let { dificultad, partidas, victorias, tiempo } = req.body;

  console.log(`[POST] /api/statsBuscaminas/${userId} - Datos recibidos:`, req.body);

  const dificultadMap = {
    easy: {
      gamesPlayed: 'easy_gamesPlayed',
      wins: 'easy_wins',
      fastestTime: 'easy_fastestTime',
    },
    normal: {
      gamesPlayed: 'normal_gamesPlayed',
      wins: 'normal_wins',
      fastestTime: 'normal_fastestTime',
    },
    hard: {
      gamesPlayed: 'hard_gamesPlayed',
      wins: 'hard_wins',
      fastestTime: 'hard_fastestTime',
    },
  };

  if (typeof dificultad !== 'string' || !dificultadMap.hasOwnProperty(dificultad)) {
    return res.status(400).json({ error: 'Dificultad inválida.' });
  }

  partidas = Number(partidas);
  victorias = Number(victorias);

  if (!Number.isInteger(partidas) || partidas < 0) partidas = 0;
  if (!Number.isInteger(victorias) || victorias < 0) victorias = 0;

  if (tiempo === null || tiempo === undefined || tiempo === '') {
    tiempo = null;
  } else {
    tiempo = Number(tiempo);
    if (Number.isNaN(tiempo) || tiempo < 0) tiempo = null;
  }

  const campos = dificultadMap[dificultad];

  statsBuscaminasModel.getStatsByUser(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    // Si no existe usuario, crear registro vacío para evitar fallos al actualizar
    const inicial = row || {
      easy_gamesPlayed: 0,
      normal_gamesPlayed: 0,
      hard_gamesPlayed: 0,
      easy_wins: 0,
      normal_wins: 0,
      hard_wins: 0,
      easy_fastestTime: null,
      normal_fastestTime: null,
      hard_fastestTime: null,
    };

    // Sumar partidas y victorias
    const updatedStats = { ...inicial };
    updatedStats[campos.gamesPlayed] = partidas;
    updatedStats[campos.wins] = victorias;

    // Actualizar tiempo solo si es mejor (menor) y no es null
    if (tiempo !== null) {
      const currentTime = inicial[campos.fastestTime];
      if (currentTime === null || tiempo < currentTime) {
        updatedStats[campos.fastestTime] = tiempo;
      }
    }

    // Función para actualizar stats en la base
    const doUpdate = () => {
      statsBuscaminasModel.updateStats(
        userId,
        updatedStats.easy_gamesPlayed,
        updatedStats.normal_gamesPlayed,
        updatedStats.hard_gamesPlayed,
        updatedStats.easy_wins,
        updatedStats.normal_wins,
        updatedStats.hard_wins,
        updatedStats.easy_fastestTime,
        updatedStats.normal_fastestTime,
        updatedStats.hard_fastestTime,
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ user_id: userId, ...updatedStats });
        }
      );
    };

    if (!row) {
      statsBuscaminasModel.createStatsForUser(userId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        doUpdate();
      });
    } else {
      doUpdate();
    }
  });
});

module.exports = router;
