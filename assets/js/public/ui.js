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
/*  $('#username').on('click',function(){
    var username = $('#name').text();
    $('#name').remove();
    $(".pagecontent").first().prepend("<form class='form-inline' id = 'update'><input type='text' id = 'name' placeholder='"+username+"'></form>");
  });*/  
    
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


socket = io.connect();
 
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
 
  });
});
