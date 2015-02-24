 $('#smiley').on("click", function() {
     $("#div_smiley").toggle()
 });
 // check storage functionality
 if (typeof(Storage) !== "undefined") {
     var date;
     // check if a timestamp is set
     if (localStorage.getItem("timestamp") != null) {
         date = new Date(parseInt(localStorage.getItem("timestamp")));
         var now = new Date();
         // check if messages available and history is not older than 24 hours
         if (localStorage.getItem("messages") != null && localStorage.getItem("messages") != "[]" && (now.getTime() - date.getTime()) <= 8640000) {
             $("#messages").append($('<li>').html("Nachrichten vom " + date.toLocaleDateString()));
             // append old messages to chat
             var messages = $.parseJSON(localStorage.getItem("messages"));
             if (messages.length > 0) {
                 $.each(messages, function(index, value) {
                     var obj = $('<li>').html(value);
                     obj.addClass("oldMessage");
                     $("#messages").append(obj);
                 });
                 $("#messages").append($('<hr>'));
             }
         } else {
             localStorage.setItem("messages", JSON.stringify([]));
         }
     }
 }
 var socket = io();
 $('form').submit(function() {
     socket.emit('username', $('#u').val());
     socket.emit('chat message', $('#m').val());
     $('#m').val('');
     $('#u').val('');
     return false;
 });
 socket.on('chat message', function(msg) {
     msg = ($("<div/>").html(msg).html());
     $('#messages').append($('<li>').html(msg));
     var snd = new Audio("./audio/click.wav");
     snd.play();
     // check storage functionality
     if (typeof(Storage) !== "undefined" && Storage != null) {
         // overwrite timestamp
         var date = new Date();
         localStorage.setItem("timestamp", date.getTime());
         // get messages, add new message and overwrite it to the storage
         var messages = $.parseJSON(localStorage.getItem("messages"));
         if (messages == null) {
             messages = [];
         }
         if (messages.length >= 20) {
             messages.shift();
         }
         messages.push(msg);
         localStorage.setItem("messages", JSON.stringify(messages))
     }
 });
 socket.on('user connected clear', function() {
     document.getElementById('user').innerHTML = "<h2>Userlist</h2>";
 });
 socket.on('user connected', function(usr, smileys) {
     $("#div_smiley").empty();
     $.each(smileys, function(index, value) {
         DataValue = value.substr(0, value.length - 4);
         $("#div_smiley").append($('<img>').attr("src", "smileys/" + value).addClass("smiley_function").attr("data-name", DataValue));
     }); //end each()
     $('.smiley_function').on("click", function() {
         $("#m").val($("#m").val() + ":" + $(this).data("name") + ";");
         $("#div_smiley").hide();
         $("#m").focus();
     });
     $('#user').append($('<li>').text(usr));
 });
