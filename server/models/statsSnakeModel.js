module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats_snake (
      id TEXT PRIMARY KEY,
      high_score INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      FOREIGN KEY(id) REFERENCES users(id)
    )
  `);

  const getStatsByUser = (userId, callback) => {
    db.get("SELECT * FROM stats_snake WHERE id = ?", [userId], callback);
  };

  const createStatsForUser = (userId, callback) => {
    db.run("INSERT INTO stats_snake (id) VALUES (?)", [userId], callback);
  };

  const updateStats = (userId, high_score, games_played, callback) => {
    db.run(
      "UPDATE stats_snake SET high_score = ?, games_played = ? WHERE id = ?",
      [high_score, games_played, userId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          // No se actualizó ningún registro, entonces creamos uno nuevo
          createStatsForUser(userId, (err) => {
            if (err) return callback(err);
            // Ahora actualizamos para establecer los valores correctos
            db.run(
              "UPDATE stats_snake SET high_score = ?, games_played = ? WHERE id = ?",
              [high_score, games_played, userId],
              callback
            );
          });
        } else {
          callback(null);
        }
      }
    );
  };

  return {
    getStatsByUser,
    createStatsForUser,
    updateStats,
  };
};
