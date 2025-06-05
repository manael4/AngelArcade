const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const statsChessRoutes = require('./routes/statsChess');
const statsSnakeRoutes = require('./routes/statsSnake');
const statsBuscaminasRoutes = require('./routes/statsBuscaminas');
const statsMemoryRoutes = require('./routes/statsMemory');
const statsSolitarioRoutes = require('./routes/statsSolitario');
const statsTicTacToeRoutes = require('./routes/statsTicTacToe');
const stats2048Routes = require('./routes/stats2048');

const app = express();

// Middleware para permitir peticiones desde el frontend (CORS)
app.use(cors());

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Montamos las rutas de la api
app.use('/api/auth', authRoutes);
app.use('/api/statsChess', statsChessRoutes);
app.use('/api/statsSnake', statsSnakeRoutes);
app.use('/api/statsBuscaminas', statsBuscaminasRoutes);
app.use('/api/statsMemory', statsMemoryRoutes);
app.use('/api/statsSolitario', statsSolitarioRoutes);
app.use('/api/statsTicTacToe', statsTicTacToeRoutes);
app.use('/api/stats2048', stats2048Routes);
// Puerto donde se ejecuta el servidor
const PORT = 3001;

// Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
