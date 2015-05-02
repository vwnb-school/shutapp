/* FUNCTIONS */

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
  message.setAttribute('class', 'panel panel-default panel-body');
  var messageText = document.createElement("h4");
  var messageUser = post.userID.username ? post.userID.username : "an unknown entity";
  messageText.innerHTML = post.content+" by " + messageUser;
  message.appendChild(messageText);

  var messageFooter = document.createElement('footer'); //TODO: place controls into this footer thing
  messageFooter.setAttribute('class', 'btn-toolbar');

  var formattedTime = $.format.date(post.createdAt, 'd/M/yyyy hh:mm:ss');

  var timestamp = document.createElement('small');
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
    var followClass = post.following ? 'btn-danger' : 'btn-success';
    follow.setAttribute('class', 'follow btn '+followClass);
    follow.innerHTML = post.following ? "Unfollow" : "Follow";

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
  var target = element.attr("data-target");
  var allButtons = $("button[data-target="+element.attr('data-target')+"].follow");
  switch(action) {
    case 'follow':
      $.get('/User/follow', {follow: target}).done(function(res){
        console.log(res);
        if(res.target){
          switch(res.action){
            case 0:
              allButtons.addClass('btn-success');
              allButtons.removeClass('btn-danger');
              allButtons.html("Follow");
            break;
            case 1:
              allButtons.addClass('btn-danger');
              allButtons.removeClass('btn-success');
              allButtons.html("Unfollow");
            break;
          }
        }
      });
      break;
    case 'shutup':
      $.get('/User/shutup', {'target': target}).done(function(res){
        console.log(res);
        if(res.shutup){
          element.addClass('btn-success');
        }
      });
      break;
  }
}



/* EVENTS ETC. */

$(function(){

  $(document).on("click", ".change", function(){
    var el = $(this).closest(".form_cont");
    var key = $(this).attr("data-change");
    var span = el.find("span");
    var val = span.text();
    var formt = "";
    formt += '<div class="update">';
    formt += '<input type="text" class="form-control col-sm-3 passkey" data-update="'+key+'" value="'+val+'">';
    if (key == 'password') formt += '<input type="text" class="form-control col-sm-3" data-update="confirmation" value="confirm">';
    formt += '<button class="cancel btn btn-default">Cancel</button>';
    formt += '<button class="update_submit btn btn-primary">Save</button>';
    formt += '</div>';

    span.hide();
    el.find(".change").hide();

    el.append(formt);
  });

  $(document).on("click", ".cancel", function(){
	$(this).closest(".form_cont").find("span, .change").show();
    $(this).closest(".update").remove();
  });

  $(document).on("click", ".update_submit", function(){
    var el = $(this).closest(".update");
    var topel = el.closest(".form_cont");

    var uid = $("#username").attr("data-id");
    var inputs = el.find("input");
    var inputData = {};
    if(topel.find(".passkey").length){
      var mainKey = topel.find(".passkey").attr('data-update');
    }
    inputs.each(function(){ //get EVERY active update form
      var key = $(this).attr('data-update');
      var val = $(this).val();
      inputData[key] = val; //and serialize them all
    });

    $.ajax({
      url: '/User/update/'+uid,
      data: inputData,
      type: 'PUT'
    }).done(function(data){
      console.log(data);
    }).always(function(data){
      console.log(mainKey);
      if(mainKey){
        topel.find("span").text(data[mainKey]);
      }
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
          $(".submit_post textarea").val("");
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

    if($('.messages.mess-general').length){ //if on index
      $.get('/Post/fetch', function (posts) {
        var messageBlock = document.createElement('section');
        for(var i=0; i<posts.length; i++){
          $(".messages").append(createMessage(posts[i]));
        }
      });
    }
    else if ($(".messages.mess-personal").length){ //if on panel
      //(this I call alkochecking. It's like checking pages properly with window.location, but alcoholically!)
      $.get('/Post/fetch?filter=1', function (posts) {
        var messageBlock = document.createElement('section');
        for(var i=0; i<posts.length; i++){
          $(".messages").append(createMessage(posts[i]));
        }
      });
    }
    // Subscribe to your follow list (if there is anything) on page load.
    io.socket.get('/User/subscribeAll', function(res){
      console.log(res);
    });
    // Attach a listener which fires every time the server publishes a message:
    socket.on('message', function newMessageFromSails ( message ) {
      console.log('New message received from Sails ::\n', message);
      $('.messages.mess-personal').prepend(createMessage(message));
    });
  });
});
