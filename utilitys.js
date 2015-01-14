var exports = module.exports = {};

// Get a formated String of the current time
exports.currentTime = function() { 
	var date = new Date();
	var current_hour = date.getHours();
  var current_min = date.getMinutes();
	var current_sec = date.getSeconds();
  
	if (current_hour < 10) {
    current_hour = '0' + current_hour;
  }
  if (current_min < 10) {
    current_min = '0' + current_min;
  }
	 if (current_sec < 10) {
    current_min = '0' + current_min;
  }
	
	return '[' + current_hour + ':' + current_min + ':'+current_sec+']';
}

exports.replaceTag = function(tag) { 
	// Escape Tags
	var tagsToReplace = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;'
		//'\'': '&#39;'
	};

	return tagsToReplace[tag] || tag;
}

exports.safeTagsReplace = function(str) { 
		return str.replace(/[&<>]/g, this.replaceTag);
}