var exports = module.exports = {};
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/SQLite.db');
// creates a new table within the database
exports.initialize = function(callback) {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", {1: 'users'}, function(err, row) {
        if(row == null) {
            db.run("CREATE TABLE users (" +
            "username TEXT," +
            "password TEXT," +
            "ip TEXT," +
            "status INTEGER" +
            "oldMSG TEXT" +
            "timeMSG INTEGER" +
            ")", function () {
                db.run("INSERT INTO users VALUES ('admin', '', '127.0.0.1', 0)", callback);
            });
        } else {
            if(typeof(callback) !== "undefined") {
                callback(true);
            }
        }
    });
};

exports.getUsers = function(callback) {
    db.all("SELECT * FROM users", callback)
};

exports.getUser = function(name, callback) {
    db.get("SELECT * FROM users WHERE username = ?", {
        1: name
    }, callback);
};

exports.getUserByIP = function(ip, callback) {
    db.get("SELECT * FROM users WHERE ip = ?", {
        1: ip
    }, callback);
};

exports.addUser = function(username, password, ip, status, callback) {
    db.run("INSERT INTO users VALUES (?, ?, ?, ?)", {
        1: username,
        2: password,
        3: ip,
        4: status
    }, callback);
};

exports.removeUser = function(username, callback) {
    db.run("DELETE FROM users WHERE username = ?", {
        1: username
    }, callback);
};

exports.setUsername = function(username, newName, callback) {
  db.run("UPDATE users SET username = ? WHERE username = ?", {
      1: newName,
      2: username
  }, callback);
};

exports.setPassword = function(username, password, callback) {
    db.run("UPDATE users SET password = ? WHERE username = ?", {
        1: password,
        2: username
    }, callback);
};

exports.setIP = function(username, ip, callback) {
    db.run("UPDATE users SET ip = ? WHERE username = ?", {
        1: ip,
        2: username
    }, callback);
};

exports.setStatus = function(username, status, callback) {
    db.run("UPDATE users SET status = ? WHERE username = ?", {
        1: status,
        2: username
    }, callback);

};

exports.closeDB = function() {
    db.close();
};

exports.getHighestRowID = function(callback) {
    db.get("SELECT ROWID FROM users ORDER BY ROWID DESC LIMIT 1", callback);
};