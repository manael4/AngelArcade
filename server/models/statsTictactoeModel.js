module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_tictactoe (
      id TEXT PRIMARY KEY,
      winsO INTEGER DEFAULT 0,
      winsX INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      FOREIGN KEY(id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_tictactoe WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_tictactoe (id) VALUES (?)", [userId], callback);
  };

  const updateWinsO = (userId, winsO, callback) => {
    db.run("UPDATE stats_tictactoe SET winsO = ? WHERE id = ?", [winsO, userId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        createStatsForUser(userId, (err) => {
          if (err) return callback(err);
          db.run("UPDATE stats_tictactoe SET winsO = ? WHERE id = ?", [winsO, userId], callback);
        });
      } else {
        callback(null);
      }
    });
  };

  const updateWinsX = (userId, winsX, callback) => {
    db.run("UPDATE stats_tictactoe SET winsX = ? WHERE id = ?", [winsX, userId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        createStatsForUser(userId, (err) => {
          if (err) return callback(err);
          db.run("UPDATE stats_tictactoe SET winsX = ? WHERE id = ?", [winsX, userId], callback);
        });
      } else {
        callback(null);
      }
    });
  };

  const updateDraws = (userId, draws, callback) => {
    db.run("UPDATE stats_tictactoe SET draws = ? WHERE id = ?", [draws, userId], function (err) {
      if (err) return callback(err);
      if (this.changes === 0) {
        createStatsForUser(userId, (err) => {
          if (err) return callback(err);
          db.run("UPDATE stats_tictactoe SET draws = ? WHERE id = ?", [draws, userId], callback);
        });
      } else {
        callback(null);
      }
    });
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateWinsO,
    updateWinsX,
    updateDraws,
  };
};
