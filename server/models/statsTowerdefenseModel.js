module.exports = (db) => {
  db.run(`CREATE TABLE IF NOT EXISTS stats_towerdefense (
    id TEXT PRIMARY KEY,
    gamesPlayed INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    waveReached INTEGER,
    FOREIGN KEY(id) REFERENCES users(id)
  )`);
};