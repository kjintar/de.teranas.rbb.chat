// Require Modules and create their objects
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors');
var fs = require('fs');
//var smileyFiles = fs.readdirSync("./smileys/");
//console.log(smileyFiles);
var userManagement = require('./usermanagement');

// Prepare global variables
var msg_old = '';
var spamcounter = 0;
var user = [{
'ip': '127.0.0.1',
'username': 'Server',
'status': 0,
'old_msg': '',
'time_old': ''
}];

// Routing though static middelware
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/smileys'));
app.use(express.static(__dirname + '/audio'));

// Port used
var port = 3000;


//Style Console Log
function styledLog(logmsg, maxlenght) {
return (new Array(maxlenght - String(logmsg.substring(0, maxlenght)).length + 1)).join(" ").concat(logmsg.substring(0, maxlenght)) + ' | ';
}

//Style Console Log seperator
function styledLogSeperator(maxlenght) {
return (new Array(maxlenght - String('-').length + 1)).join('-').concat('-') + '-| ';
}

//padwidths
var timeWidth = 9;
var sourceWidth = 18;
var actionWidth = 14;
var messageWidth = 50;
// Log head
console.log(styledLogSeperator(timeWidth) + styledLogSeperator(sourceWidth) + styledLogSeperator(actionWidth) + styledLogSeperator(messageWidth));
console.log(styledLog('Time', timeWidth) + styledLog('Source', sourceWidth) + styledLog('Action', actionWidth) + styledLog('Message', messageWidth));
console.log(styledLogSeperator(timeWidth) + styledLogSeperator(sourceWidth) + styledLogSeperator(actionWidth) + styledLogSeperator(messageWidth));

/*
 *   TODO var width instead of set width; i.e styledLog('Action',actionWidth)
 */

// Connection eventhandler
userManagement.initialize(function() {
    io.on('connection', function (socket) {
        var date = new Date();
        var current_hour = date.getHours();
        var current_min = date.getMinutes();

        if (current_hour < 10) {
            current_hour = '0' + current_hour;
        }
        if (current_min < 10) {
            current_min = '0' + current_min;
        }

        // check if a user exists for the given ip
        userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, result) {
            // log user if user was found
           if(result != null) {

               // login user
               userManagement.setStatus(result.username, 1, function() {
                   console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(result.username, sourceWidth) + styledLog('reconnected', actionWidth) + styledLog('SUCCESS', messageWidth));
               });
           } else {

               // add new user
               userManagement.getHighestRowID(function(err, row) {
                   userManagement.addUser('User ' + (row.rowid + 1), '', socket.request.connection.remoteAddress, 1, function(err) {
                       if(err == null) {
                           console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(socket.request.connection.remoteAddress, sourceWidth) + styledLog('connected', actionWidth) + styledLog('SUCCESS', messageWidth).green);
                       }
                   });
               });
           }

            resendUserList();
        });

        // If usrname input isset check and, set or deny
        socket.on('username', function (usrname) {
            if (usrname !== '') {
                // Check each username and look for dublicate and deny if there is one
                userManagement.getUser(usrname, function(err, result) {
                    if(result != null) {
                        io.emit('chat message', 'Server: Name vergeben');
                        console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(socket.request.connection.remoteAddress, sourceWidth) + styledLog('renamed', actionWidth) + styledLog('to "' + usrname.substring(0, 18) + '"', messageWidth).red);
                    } else {
                        userManagement.getUserByIP(socket.request.client._peername.address, function(err, result) {
                            userManagement.setUsername(result.username, usrname.substring(0, 18), function(err, fa) {
                                console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(result.username, sourceWidth) + styledLog('renamed', actionWidth) + styledLog('to "' + usrname.substring(0, 18) + '"', messageWidth).green);

                                resendUserList();
                            })
                        });
                    }
                });
            }
        });

        // Handel user msg
        socket.on('chat message', function (msg) {
            var date = new Date();
            var current_hour = date.getHours();
            var current_min = date.getMinutes();

            if (current_hour < 10) {
                current_hour = '0' + current_hour;
            }
            if (current_min < 10) {
                current_min = '0' + current_min;
            }
            userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, user) {
                // get username by IP
                username = user.username;
                msg_old = user.old_msg;
                time_old = user.time_old;
                
                 // log msg
                if (msg !== msg_old && msg !== '') {
                    console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(username, sourceWidth) + styledLog('wrote', actionWidth) + styledLog(msg, messageWidth));
                }
                
                // Spamblock and emptystriper
                if ((msg !== msg_old) && msg !== '' && msg.substring(0, 1) !== '/' && time_old !== time_msg) {
                    io.emit('chat message', '[' + current_hour + ':' + current_min + '] ' + username + ': ' + msg);
                } else if (msg !== '') {
                    spamcounter++;
                }
                
                // Commands
                if (msg === '/time' && msg !== msg_old) {
                    io.emit('chat message', 'Server: ' + current_hour + ':' + current_min);
                }
                if (msg === '/spamcount' && msg !== msg_old) {
                    io.emit('chat message', 'Server: Recorded ' + spamcounter + ' attempts of spam');
                }
                
                // TODO: Setzen neue Werte in Datenbank
                user[user_id].old_msg = msg;
                user[user_id].time_old = time_msg;
                });
            });
            });
        });

        socket.on('disconnect', function() {
            userManagement.getUserByIP(socket.request.connection.remoteAddress, function(err, user) {
               if(user != null) {
                   userManagement.setStatus(user.username, 0, function(err, result) {
                       console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(user.username, sourceWidth) + styledLog('disconnected', actionWidth) + styledLog("DISCONNECTED", messageWidth));
                       resendUserList();
                   });
               }
            });
        });
    });
});

function resendUserList() {
    userManagement.getUsers(function(err, rslt) {
        io.emit('user connected clear');

        for (var i = 0; i < rslt.length; i++) {
            if(rslt[i].status == 1) {
                io.emit('user connected', rslt[i].username);
            }
        }
    });
}

http.listen(port, function () {
    console.log(styledLog('', timeWidth) + styledLog('SERVER', sourceWidth) + styledLog('Started', actionWidth) + styledLog('On Port ' + port, messageWidth).green);
});