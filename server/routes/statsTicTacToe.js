const express = require('express');
const router = express.Router();
const { statsTictactoeModel } = require('../db');

// GET /api/statsTicTacToe/:id
router.get('/:id', (req, res) => {
  const id = req.params.id;

  statsTictactoeModel.getStatsByUser(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      statsTictactoeModel.createStatsForUser(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.json({
          id,
          winsO: 0,
          winsX: 0,
          draws: 0,
        });
      });
    } else {
      res.json({ id, ...row });
    }
  });
});


// POST /api/statsTicTacToe/:id — Actualiza todas las estadísticas
router.post('/:id', (req, res) => {
  const id = req.params.id;
  let { winsO, winsX, draws } = req.body;

  winsO = Number(winsO);
  winsX = Number(winsX);
  draws = Number(draws);

  if ([winsO, winsX, draws].some(n => Number.isNaN(n))) {
    return res.status(400).json({ error: 'Todos los valores deben ser números válidos.' });
  }

  statsTictactoeModel.getStatsByUser(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const update = () => {
      statsTictactoeModel.updateWinsO(id, winsO, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        statsTictactoeModel.updateWinsX(id, winsX, (err) => {
          if (err) return res.status(500).json({ error: err.message });
          statsTictactoeModel.updateDraws(id, draws, (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ id, winsO, winsX, draws });
          });
        });
      });
    };

    if (!row) {
      statsTictactoeModel.createStatsForUser(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        update();
      });
    } else {
      update();
    }
  });
});

// PATCH /api/statsTicTacToe/winsO/:id — Incrementa winsO en 1
router.patch('/winsO/:id', (req, res) => {
  const id = req.params.id;

  statsTictactoeModel.getStatsByUser(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const update = (current = 0) => {
      statsTictactoeModel.updateWinsO(id, current + 1, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ id, winsO: current + 1 });
      });
    };

    if (!row) {
      statsTictactoeModel.createStatsForUser(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        update(0);
      });
    } else {
      update(row.winsO);
    }
  });
});

// PATCH /api/statsTicTacToe/winsX/:id — Incrementa winsX en 1
router.patch('/winsX/:id', (req, res) => {
  const id = req.params.id;

  statsTictactoeModel.getStatsByUser(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const update = (current = 0) => {
      statsTictactoeModel.updateWinsX(id, current + 1, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ id, winsX: current + 1 });
      });
    };

    if (!row) {
      statsTictactoeModel.createStatsForUser(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        update(0);
      });
    } else {
      update(row.winsX);
    }
  });
});

// PATCH /api/statsTicTacToe/draws/:id — Incrementa draws en 1
router.patch('/draws/:id', (req, res) => {
  const id = req.params.id;

  statsTictactoeModel.getStatsByUser(id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const update = (current = 0) => {
      statsTictactoeModel.updateDraws(id, current + 1, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ id, draws: current + 1 });
      });
    };

    if (!row) {
      statsTictactoeModel.createStatsForUser(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        update(0);
      });
    } else {
      update(row.draws);
    }
  });
});

module.exports = router;
