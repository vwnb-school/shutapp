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

	$(document).on("click", ".change", function(){

		var el = $(this).closest(".form_cont");
		var key = $(this).attr("data-change");
		var span = el.find("span");
		var val = span.text();
		var formt = "";
		formt += '<div class="update">';
		formt += '<input type="text" data-update="'+key+'" value="'+val+'">';
		formt += '<button class="cancel">Cancel</button>';
		formt += '<button class="update_submit">Save</button>';
		formt += '</div>';

		span.hide();
		el.find(".change").hide();

		el.append(formt);
	});

	$(document).on("click", ".update_submit", function(){
		var el = $(this).closest(".update");
		var topel = el.closest(".form_cont");

		var uid = $("#username").attr("data-id");
		var key = el.find("input").attr("data-update");
		var val = el.find("input").val();
		var input = {};
		input[key] = val;

		//THIS NO WORK
		$.ajax({
			url: '/User/update/'+uid,
			data: input,
			type: 'PUT'
		}).done(function(data){
			console.log(data);
		}).always(function(data){
			console.log("asd");
			topel.find("span").text(data[key]);
			topel.find("span").show();
			topel.find(".change").show();
			el.hide();
		});
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

	  $.get('/Post?sort=createdAt DESC', function (posts) {
		_.each(posts, function(message){
		  showMessage(message);
		});
	  });

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
	  }).fail(function(){
		$(".messajizz").after("<div class='panel'><h4>"+message.content+" by Deleted user</h4><comment>At "+message.createdAt+"</comment><br></div>");
	  });
	}



});


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
