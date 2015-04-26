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

//modify this one as you see fit, but for sake of consistency, plz make sure it returns a DOM element, but doesn't actually insert anything.
function createMessage(post) { //get the user info and append the message. Modify as you want for proper UI.
  var message = document.createElement("div");
  message.setAttribute('class', 'panel highlight');
  var messageText = document.createElement("h4");
  messageText.innerHTML = post.content+" by " + post.userID.username || "Unknown entity";
  message.appendChild(messageText);

  var messageFooter = document.createElement('footer'); //TODO: place controls into this footer thing

  var formattedTime = $.format.date(post.createdAt, 'd/M/yyyy hh:mm:ss');

  var timestamp = document.createElement('comment');
  timestamp.innerHTML = "At "+formattedTime;
  if(post.userID.id){ //TODO: make this collapsible
    var shutup = document.createElement('button');
    shutup.innerHTML = "Shutup";
    shutup.setAttribute('data-target', post.userID.id);
    shutup.setAttribute('class', 'shutup btn');
    //the idea is: when user expands the footer under message, the app should make a request
    //to see if the user follows the poster of this message. If they do, the follow button should indicate that
    //so they know that if they click the button, they will unfollow that person.
    var follow = document.createElement('button');
    follow.setAttribute('data-target', post.userID.id);
	//TODO: check if the user is a followed one and make this btn-success
    follow.setAttribute('class', 'follow btn');
    follow.innerHTML = "Follow";


    messageFooter.appendChild(follow);
    messageFooter.appendChild(shutup);
  }
  messageFooter.appendChild(timestamp);
  message.appendChild(messageFooter);
  return message;
}

//this one takes care of targeted user actions - sending follows and shutups.
//takes string type action in first parameter and jQuery element reference in the second one (e.g. $(this))
function userAction(action, element) {
  var target = element.attr('data-target')
  switch(action) {
    case 'follow':
      $.get('/User/follow', {follow: target}).done(function(res){
        console.log(res);
        if(res.target){
          element.addClass('btn-success');
        }
      });
      break;
    case 'shutup':
      $.get('/User/shutup', {userID: target}).done(function(res){
        console.log(res);
        if(res.shutup){
          element.addClass('btn-success');
        }
      });
      break;
  }
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
  $(document).on('click', '.shutup', function() { userAction('shutup', $(this)); });
  $(document).on('click', '.follow', function() { userAction('follow', $(this)); });
  $("a.logout").click(function(){
    $.get('User/logout');
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


  // deal with sockets
  var socket = io.connect();
  console.log('Connecting Socket.io to Sails.js...');
  // Attach a listener which fires when a connection is established:
  socket.on('connect', function socketConnected() {
    //Inform that the socket has been created for the client
    console.log(
      'Socket is now connected and globally accessible as `socket`.\n' +
      'e.g. to send a GET request to Sails via Socket.io, try: \n' +
      '`socket.get("/foo", function (response) { console.log(response); })`');
    //populate the page with latest messages
    if($('#messajizz').length){ //if on index
      $.get('/Post/fetch', function (posts) {
        var messageBlock = document.createElement('section');
        for(var i=0; i<posts.length; i++){
          messageBlock.appendChild(createMessage(posts[i]));
        }
        $("#messajizz").after(messageBlock);
      });
    }
    else if ($("#mymessajizz").length){ //if on panel
      //(this I call alkochecking. It's like checking pages properly with window.location, but alcoholically!)
      $.get('/Post/fetch?filter=1', function (posts) {
        var messageBlock = document.createElement('section');
        for(var i=0; i<posts.length; i++){
          messageBlock.appendChild(createMessage(posts[i]));
        }
        $("#mymessajizz").after(messageBlock);
      });
    }
    // Subscribe to your follow list (if there is anything) on page load.
    io.socket.get('/User/subscribeAll', function(res){
      console.log(res);
    });
    // Attach a listener which fires every time the server publishes a message:
    socket.on('message', function newMessageFromSails ( message ) {
      console.log('New message received from Sails ::\n', message);
      $('#mymessajizz').after(createMessage(message));
    });
  });
});
