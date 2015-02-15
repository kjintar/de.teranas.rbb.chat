var exports = module.exports = {}; 
export.msg_old = "";
export.spamcounter = 0;
 
 // Spamblock and emptystriper
 export.blockRepeated = function (msg, username) {
                     var spam = true;
                    if (msg !== this.msg_old && msg !== '' && msg.substring(0, 1) !== '/') {
                       /*  */
                        spam = false;
                    } else if (msg !== '') {
                        spam = true;                    	
                        this.spamcounter++;
   }
   return spam;
}