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
  $.get('/Post?sort=createdAt DESC', function (posts) {
    _.each(posts, function(message){
      showMessage(message);
    });
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


socket = io.connect({userid:"WENEEDAGETDAIDHER"});

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
    showMessage(message);
  });
});
function showMessage(message) { //get the user info and append the message. Modify as you want for proper UI.
  $.get("/user/"+message.userID+"").done(function(user){ //get the poster's details
    $(".messajizz").after("<div class='panel'><h4>"+message.content+" by "+user.username+"</h4><comment>At "+message.createdAt+"</comment><br></div>");
  });
}
