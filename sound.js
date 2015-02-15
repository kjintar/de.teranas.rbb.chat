var exports = module.exports = {};

// Play soundfile if required String is used in chat
exports.playSound = function() { 

  var snd1 = new Audio("./audio/pussies.wav");
  var snd2 = new Audio("./audio/a-team_crazy_fool_x.wav");
  var snd3 = new Audio("./audio/whats_your_name.wav");
  
			if(messages == '%pussy%') {
			  snd1.play();
			} else if (messages == '%crazy fool%'){
			  snd2.play();
			} else if (messages == '%your name%'){
			  snd3.play();
			}
}


