// Require Modules and create their objects
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors');
var fs = require('fs');
var utility = require('./utilitys.js');
var log = require('./log.js');
//var userManagement = require('./usermanagement');

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
};

// userManagement.setUp();

// Prepare global variables
var msg_old = '';
var spamcounter = 0;
var user = [{
  'ip': '127.0.0.1',
  'username': 'Server',
  'status': '1'
}];

log.styledLogHead();

// Connection eventhandler
io.on('connection', function(socket) {

  io.emit('user connected clear');

  for (var i = 1; i < user.length; i++) {
    io.emit('user connected', user[i].username, smileyFiles);
  }

  var found = false;
  var username = 'unbekannt';

  // Check if IP is associated to a username and log it when something is found
  for (var i = 1; i < user.length; i++) {
    if (user[i].ip === socket.request.connection.remoteAddress) {
      found = true;
      username = user[i].username;
			log.styledLogFormated(username,'Reconnected','SUCCESS');
    }
  }

  // If no user was found, create one and log it
  if (found === false) {
    user.push({
      'ip': socket.request.connection.remoteAddress,
      'username': 'User ' + user.length,
      'status': '1'
    });
		log.styledLogFormated(socket.request.connection.remoteAddress,'Connected','SUCCESS');
  }

  // If usrname input isset check and, set or deny
  socket.on('username', function(usrname) {

    if (usrname !== '') {
      // Check each username and look for dublicate and deny if there is one
      for (var i = 1; i < user.length; i++) {
        if (user[i].username === usrname) {
          io.emit('chat message', 'Server: Name vergeben');
          log.styledLogFormated(socket.request.connection.remoteAddress,'Renamed','FAIL');
          return;
        }
      }
      // If no dublicate was found set new name
      for (var i = 1; i < user.length; i++) {
        if (user[i].ip === socket.request.connection.remoteAddress) {
          log.styledLogFormated(username,'Renamed','to "' + usrname.substring(0, 18) + '"');
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
  socket.on('chat message', function(msg) {

    // get username by IP
    for (var i = 1; i < user.length; i++) {
      if (user[i].ip === socket.request.connection.remoteAddress) {
        username = user[i].username;
      }
    }

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
      };
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
  });
});

http.listen(port, function() {
	log.styledLogFormated('SERVER','Started','On Port: '+port);
});