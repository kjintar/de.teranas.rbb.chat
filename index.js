// Require Modules and create their objects
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors');
var fs = require('fs');
var utility = require('./utilitys.js');
var log = require('./log.js');
var userManagement = require('./usermanagement');

// Port used
var port = 3000;

// Routing though static middelware
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/smileys'));
app.use(express.static(__dirname + '/audio'));

var smileyFiles = fs.readdirSync(__dirname + '/public/smileys');
smileyLength = smileyFiles.length;

for (var i = smileyLength - 1; i >= 0; i--) {
  if (!smileyFiles[i].match(/[.](jpg|png|bmp|gif|jpeg)/)) {
    smileyFiles.splice(i, 1);
  }
}

// userManagement.setUp();

// Prepare global variables
var msg_old = '';
var spamcounter = 0;

log.styledLogHead();

userManagement.setUp(function() {
    // Connection eventhandler
    io.on('connection', function(socket) {
        var broadcastUsers = function() {
            io.emit('user connected clear');

            userManagement.getUsers(function(err, rows) {
                if(typeof rows !== "undefined") {
                    for(var i = 0; i < rows.length; i++) {
                        io.emit('user connected', rows[i]['username'], smileyFiles);
                    }
                }
            });
        };

        broadcastUsers();

        var found = false;
        var username = 'unbekannt';

        userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, result) {
            if(typeof result !== "undefined") {
                found = true;
                username = result['username'];
                log.styledLogFormated(result['username'],'Reconnected','SUCCESS');
            } else {
                userManagement.getHighestID(function(err, row) {
                    var newID = 1;

                    if(typeof row !== "undefined") newID = row['maxID'] + 1;

                    userManagement.addUser({
                        'ip': socket.request.connection.remoteAddress,
                        'status': 1,
                        'username': "User" + newID
                    }, function() {
                        log.styledLogFormated(socket.request.connection.remoteAddress,'Connected','SUCCESS');
                        broadcastUsers();
                    });
                });

            }
        });

        // If usrname input isset check and, set or deny
        socket.on('username', function(usrname) {
            if (usrname !== '') {
                // Prüfe ob Name vergeben
                userManagement.getUserByName(usrname, function(err, row) {
                    if(typeof row !== "undefined") {
                        io.emit('chat message', 'Server: Name vergeben');
                        log.styledLogFormated(socket.request.connection.remoteAddress,'Renamed','FAIL');
                    } else {

                        // Hole Benutzerdaten aus Datenbank
                        userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, user) {
                            if(typeof user !== "undefined") {

                                // Schreibe Benutzernamen
                                userManagement.setUsername(user['userID'], usrname.substring(0, 18), function(err, row) {
                                    if(err == null) {
                                        log.styledLogFormated(username,'Renamed','to "' + usrname.substring(0, 18) + '"');

                                        broadcastUsers();
                                    } else {
                                        io.emit('chat message', 'Server: Namensänderung fehlgeschlagen');
                                        log.styledLogFormated(socket.request.connection.remoteAddress,'Renamed','FAIL');
                                    }
                                })
                            } else {
                                io.emit('chat message', 'Server: Benutzer nicht gefunden');
                                log.styledLogFormated(socket.request.connection.remoteAddress,'Renamed','FAIL');
                            }
                        });
                    }
                });
            }
        });

        // Handel user msg
        socket.on('chat message', function(msg) {
            userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, user) {
                if(typeof user !== "undefined") {
                    username = user['username'];

                    // log msg
                    if (msg !== msg_old && msg !== '') {
                        log.styledLogFormated(username,'Wrote',msg);
                    }

                    msg = utility.safeTagsReplace(msg);

                    var reMsg = /(:\w+;)/g;
                    var ma = msg.match(reMsg);

                    if (typeof ma !== 'undefined' && ma !== null) {
                        var reMsg_ng = /(:\w+;)/;
                        var smiley;
                        for (var i = 0; i < ma.length; i++) {
                            ma[i] = ma[i].substr(1, ma[i].length - 2);
                            if (smileyFiles.indexOf(ma[i] + '.png') > -1) {
                                smiley = "<img class='smiley' src='/smileys/" + ma[i] + ".png' />";
                                msg = msg.replace(reMsg_ng, smiley);
                            }
                        }
                    }

                    // Spamblock and emptystriper
                    if (msg !== msg_old && msg !== '' && msg.substring(0, 1) !== '/') {
                        io.emit('chat message', utility.currentTime() + username + ': ' + msg);
                    } else if (msg !== '') {
                        spamcounter++;
                    }

                    // Commands
                    if (msg === '/time' && msg !== msg_old) {
                        io.emit('chat message', 'Server: ' + utility.currentTime());
                    }
                    if (msg === '/spamcount' && msg !== msg_old) {
                        io.emit('chat message', 'Server: Recorded ' + spamcounter + ' attempts of spam');
                    }

                    msg_old = msg;
                }
            });
        });
    });
});

http.listen(port, function() {
	log.styledLogFormated('SERVER','Started','On Port: '+port);
});