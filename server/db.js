const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./stats.db');

const usersModel = require('./models/usersModel')(db);
const statsBuscaminasModel = require('./models/statsBuscaminasModel')(db);
const statsChessModel = require('./models/statsChessModel')(db);
const statsMemoryModel = require('./models/statsMemoryModel')(db);
const statsSnakeModel = require('./models/statsSnakeModel')(db);
const statsSolitarioModel = require('./models/statsSolitarioModel')(db);
const statsTictactoeModel = require('./models/statsTictactoeModel')(db);
//const statsTowerdefenseModel = require('./models/statsTowerdefenseModel')(db);
const stats2048Model = require('./models/stats2048Model')(db);

module.exports = {
  db,
  usersModel,
  statsBuscaminasModel,
  statsChessModel,
  statsMemoryModel,
  statsSnakeModel,
  statsSolitarioModel,
  statsTictactoeModel,
  //statsTowerdefenseModel,
  stats2048Model
};
