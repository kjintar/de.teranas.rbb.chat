var exports = module.exports = {};
var utility = require('./utilitys.js');

//padwidths
var timeWidth = 14;
var sourceWidth = 18;
var actionWidth = 14;
var messageWidth = 50;

//Style Console Log
exports.styledLog = function(logmsg, maxlenght) {
	return (new Array(maxlenght - String(logmsg.substring(0, maxlenght)).length + 1)).join(" ").concat(logmsg.substring(0, maxlenght)) + ' | ';
}

//Style Console Log seperator
exports.styledLogSeperator = function(maxlenght) {
  return (new Array(maxlenght - String('-').length + 1)).join('-').concat('-') + '-| ';
}

exports.styledLogFormated = function(source,action,msg) { 	
	console.log(
		this.styledLog(utility.currentTime(),timeWidth) 
	+ this.styledLog(source, sourceWidth) 
	+ this.styledLog(action, actionWidth) 
	+ this.styledLog(msg, messageWidth)
	);	
}

exports.styledLogHead = function() { 		
	// Log upper sperator
	console.log(
		this.styledLogSeperator(timeWidth) 
	+ this.styledLogSeperator(sourceWidth) 
	+ this.styledLogSeperator(actionWidth) 
	+ this.styledLogSeperator(messageWidth)
	);
	// Log head
	console.log(
		this.styledLog('Time', timeWidth) 
	+ this.styledLog('Source', sourceWidth) 
	+ this.styledLog('Action', actionWidth) 
	+ this.styledLog('Message', messageWidth)
	);
	// Log lower sperator
	console.log(
		this.styledLogSeperator(timeWidth) 
	+ this.styledLogSeperator(sourceWidth) 
	+ this.styledLogSeperator(actionWidth) 
	+ this.styledLogSeperator(messageWidth)
	);
}