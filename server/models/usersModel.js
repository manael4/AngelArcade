module.exports = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT NOT NULL
    )
  `);

  return {
    createUser: (username, password, callback) => {
      const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
      db.run(sql, [username, password], function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, username });
      });
    },

    findByUsername: (username, callback) => {
      const sql = `SELECT * FROM users WHERE username = ?`;
      db.get(sql, [username], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
      });
    },

    findByCredentials: (username, password, callback) => {
      const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
      db.get(sql, [username, password], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
      });
    },

    findById: (id, callback) => {
      const sql = `SELECT id, username FROM users WHERE id = ?`; // no devolver password
      db.get(sql, [id], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
      });
    }
  };
};
