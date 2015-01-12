// Require Modules and create their objects
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors');
var fs = require('fs');
//var smileyFiles = fs.readdirSync("./smileys/");
//console.log(smileyFiles);

// Prepare global variables
var msg_old = '';
var spamcounter = 0;
var user = [{
    'ip': '127.0.0.1',
    'username': 'Server',
    'status': '1'
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

    io.emit('user connected clear');

    for (var i = 1; i < user.length; i++) {
        io.emit('user connected', user[i].username);
    }

    var found = false;
    var username = 'unbekannt';

    // Check if IP is associated to a username and log it when something is found
    for (var i = 1; i < user.length; i++) {
        if (user[i].ip === socket.request.connection.remoteAddress) {
            found = true;
            username = user[i].username;

            console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(username, sourceWidth) + styledLog('reconnected', actionWidth) + styledLog('SUCCESS', messageWidth));
        }
    }

    // If no user was found, create one and log it
    if (found === false) {
        user.push({
            'ip': socket.request.connection.remoteAddress,
            'username': 'User ' + user.length,
            'status': '1'
        });
        console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(socket.request.connection.remoteAddress, sourceWidth) + styledLog('connected', actionWidth) + styledLog('SUCCESS', messageWidth).green);
    }

    // If usrname input isset check and, set or deny
    socket.on('username', function (usrname) {

        if (usrname !== '') {
            // Check each username and look for dublicate and deny if there is one
            for (var i = 1; i < user.length; i++) {
                if (user[i].username === usrname) {
                    io.emit('chat message', 'Server: Name vergeben');
                    console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(socket.request.connection.remoteAddress, sourceWidth) + styledLog('renamed', actionWidth) + styledLog('to "' + usrname.substring(0, 18) + '"', messageWidth).red);
                    return;
                }
            }
            // If no dublicate was found set new name
            for (var i = 1; i < user.length; i++) {
                if (user[i].ip === socket.request.connection.remoteAddress) {
                    console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(user[i].username, sourceWidth) + styledLog('renamed', actionWidth) + styledLog('to "' + usrname.substring(0, 18) + '"', messageWidth).green);
                    user[i].username = usrname.substring(0, 18);
                }
            }

            io.emit('user connected clear');

            for (var i = 1; i < user.length; i++) {
                io.emit('user connected', user[i].username);
            }
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

       
        // get username by IP
        for (var i = 1; i < user.length; i++) {
            if (user[i].ip === socket.request.connection.remoteAddress) {
                username = user[i].username;
            }
        }
 				
				// log msg
        if (msg !== msg_old && msg !== '') {
            console.log(styledLog('[' + current_hour + ':' + current_min + ']', timeWidth) + styledLog(username, sourceWidth) + styledLog('wrote', actionWidth) + styledLog(msg, messageWidth));
        }
        // Spamblock and emptystriper
        if (msg !== msg_old && msg !== '' && msg.substring(0, 1) !== '/') {
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
			
        msg_old = msg;
    });
});

http.listen(port, function () {
    console.log(styledLog('', timeWidth) + styledLog('SERVER', sourceWidth) + styledLog('Started', actionWidth) + styledLog('On Port ' + port, messageWidth).green);
});