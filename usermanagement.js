var exports = module.exports = {};
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/SQLite.db');

/**
 * Initialisiert die Datenbank.
 */
exports.setUp = function(callback) {
    db.run("CREATE TABLE IF NOT EXISTS `users` ( \
      `userID` INTEGER PRIMARY KEY, \
      `ip` TEXT NOT NULL, \
      `username` TEXT, \
      `password` TEXT, \
      `lastMessage` TEXT, \
      `status` INTEGER \
    )", function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Gibt ein Objekt mit den Benutzerdaten zurück
 * @param name
 * @param callback
 */
exports.getUserByName = function(name, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [name], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Gibt ein Objekt mit den Benutzerdaten zurück
 * @param ip
 * @param callback
 */
exports.getUserByIP = function(ip, callback) {
    db.get("SELECT * FROM users WHERE ip = ?", [ip], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Fügt einen neuen User in die Datenbank ein.
 * @param userdata Muss ein Objekt sein, das mindestens den Parameter `ip` enthalten muss.
 * @param callback
 */
exports.addUser = function(userdata, callback) {
    var data = {
        $username: '',
        $ip: '',
        $lastMessage: '',
        $password: '',
        $status: ''
    };

    if(typeof userdata['ip'] === "undefined") {
        callback(false);
        return;
    } else {
        data['$ip'] = userdata['ip'];
    }

    if(typeof userdata['username'] !== "undefined") {
        data['$username'] = userdata['username'];
    }

    if(typeof userdata['password'] !== "undefined") {
        data['$password'] = userdata['password'];
    }

    if(typeof userdata['lastMessage'] !== "undefined") {
        data['$lastMessage'] = userdata['lastMessage'];
    }

    if(typeof userdata['status'] !== "undefined") {
        data['$status'] = userdata['status'];
    }

    db.run("INSERT INTO USERS (ip, username, password, lastMessage, status) VALUES ($ip, $username, $password, $lastMessage, $status)", data, function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Entfernt einen Benutzer von den Datenbank
 * @param userID
 * @param callback
 */
exports.removeUser = function(userID, callback) {
    db.run("DELETE FROM users WHERE userID = ?", userID, function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Gibt einen Array mit Benutzerdaten aus.
 * @param callback
 */
exports.getUsers = function(callback) {
    db.all("SELECT * FROM users", function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);;
        }
        callback(err, result);
    });
};

/**
 * Setzt die letzte Nachricht eines Benutzers.
 * @param userID
 * @param message
 * @param callback
 */
exports.setLastMessage = function(userID, message, callback) {
    db.run("UPDATE users SET lastMessage = ? WHERE userID = ?", [message, userID], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Setzt die IP eines Benutzers.
 * @param userID
 * @param ip
 * @param callback
 */
exports.setIP = function(userID, ip, callback) {
    db.run("UPDATE users SET ip = ? WHERE userID = ?", [ip, userID], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Setzt den Benutzernamen eines Benutzers.
 * @param userID
 * @param username
 * @param callback
 */
exports.setUsername = function(userID, username, callback) {
    db.run("UPDATE users SET username = ? WHERE userID = ?", [username, userID], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Setzt das Passwort eines Benutzers.
 * @param userID
 * @param password
 * @param callback
 */
exports.setPassword = function(userID, password, callback) {
    db.run("UPDATE users SET password = ? WHERE userID = ?", [password, userID], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

/**
 * Setzt den Status eines Benutzers
 * @param userID
 * @param status
 * @param callback
 */
exports.setStatus = function(userID, status, callback) {
    db.run("UPDATE users SET status = ? WHERE userID = ?", [status, userID], function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};

exports.getHighestID = function(callback) {
    db.get("SELECT MAX(userID) AS maxID FROM users", function(err, result) {
        if(err != null) {
            var e = new Error();
            console.log(err);
            console.log(e.stack);
        }
        callback(err, result);
    });
};