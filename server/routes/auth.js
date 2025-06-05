const express = require('express');
const router = express.Router();
const { usersModel } = require('../db'); // Importa desde el archivo que ya exporta el modelo

// Registro
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Faltan campos' });

  usersModel.findByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    if (user) return res.status(400).json({ error: 'Usuario ya existe' });

    usersModel.createUser(username, password, (err, newUser) => {
      if (err) return res.status(500).json({ error: 'Error al crear usuario' });
      res.json({ id: newUser.id, username: newUser.username });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  usersModel.findByCredentials(username, password, (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json({ id: user.id, username: user.username });
  });
});

// Obtener info usuario por id
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  usersModel.findById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de BD' });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  });
});

module.exports = router;
