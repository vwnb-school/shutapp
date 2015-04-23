function toForm(selector) {
     var el = $(selector);
     var span = $(selector+">span").first();
     var value = span.text();

     span.hide();
     var input = el.append("<input " +
     "type ='text' "+
     "class = 'change' "+
     "value ='"+value+"'>");
   }

$(function(){
var socket = io.connect();
$.get('/Post/fetch?filter=1', function (posts) {
  var messageBlock = document.createElement('section');
  for(var i=0; i<posts.length; i++){
    console.log(posts[i]);
    messageBlock.appendChild(createMessage(posts[i]));
  }
  $("#messajizz").append(messageBlock);
});
typeof console !== 'undefined' &&
console.log('Connecting Socket.io to Sails.js...');

// Attach a listener which fires when a connection is established:
socket.on('connect', function socketConnected() {

  typeof console !== 'undefined' &&
  console.log(
    'Socket is now connected and globally accessible as `socket`.\n' +
    'e.g. to send a GET request to Sails via Socket.io, try: \n' +
    '`socket.get("/foo", function (response) { console.log(response); })`'
  );

  // Attach a listener which fires every time the server publishes a message:
  socket.on('message', function newMessageFromSails ( message ) {

    typeof console !== 'undefined' &&
    console.log('New message received from Sails ::\n', message);
    createMessage(message);
  });
});

$(".submit_post").submit(function( event ) {

  event.preventDefault();

  $.ajax({
	url : $(this).attr("action"),
	type : 'POST',
	data : $(this).serialize(),
	success: function(data){

	}
  });
  return false;
  });
});

//modify this one as you see fit, but for sake of consistency, plz make sure it returns a DOM element, but doesn't actually insert anything.
function createMessage(message) { //get the user info and append the message. Modify as you want for proper UI.
  var message = document.createElement("div");
  message.setAttribute('class', 'panel');
  var messageText = document.createElement("h4");
  messageText.html = message.content+" by "+message.userID.username;
  message.appendChild(messageText);
  var messageFooter = document.createElement('comment'); //replace with whatever you like.
  messageFooter.html = "At"+message.createdAt;
  message.appendChild(messageFooter);
  return message;
}
