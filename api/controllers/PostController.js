/**
 * PostController
 *
 * @description :: Server-side logic for managing Posts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

<<<<<<< HEAD
 module.exports = {
   post: function(req, res) {
     params = req.params.all();
     params.userID = req.session.user;
     Post.create(params).exec(function(err, post){
       if(err) {
         console.log(err);
         return res.negotiate(err);
       }
=======
module.exports = {
  post: function(req, res) {
    params = req.params.all();
    params.userID = req.session.user;
    Post.create(params).exec(function(err, post){
      if(err) {
        console.log(err);
        return res.negotiate(err);
      }
<<<<<<< HEAD
      if(post) {
        //socket.publish(post)???? How the fuck does this work?!
      }
    });
  }
=======
	  if(post){
	    //list of socket methods: https://gist.github.com/mikermcneil/6598661
		var io = sails.io;
		//so essentially this should only emit to followers
		io.sockets.emit('message', {content: params['content'] });
		return res.redirect('panel');
	  }
    });
  },
>>>>>>> e3d57f0d0d2e04f84247e13f8dc5ac45124585e0
};
>>>>>>> 1c92f91496562690dae890949448d6c532a66f51

       if(post){
         //list of socket methods: https://gist.github.com/mikermcneil/6598661
         var io = sails.io;
         //so essentially this should only emit to followers
         io.sockets.emit('message', {content: params['content'] });
         return res.redirect('panel');
       }
     });
   }
 };
