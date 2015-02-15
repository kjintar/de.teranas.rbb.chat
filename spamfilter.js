var exports = module.exports = {};
var index = require('./index');

exports.spamcounter = 0;
 
 // Spamblock and emptystriper
exports.blockRepeated = function (msg, username, callback) {
  var spam = true;
  var lastMessage = "";

  index.userManagement.getUserByName(username, function(err, user) {
    if(typeof user !== "undefined")
    {
      lastMessage = user['lastMessage'];
    }

    if (msg !== lastMessage && msg !== '') {
      spam = false;
    } else if (msg !== '') {
      spam = true;

      module.exports.spamcounter++;
    }

    callback(spam);
  });
};