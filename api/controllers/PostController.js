/**
 * PostController
 *
 * @description :: Server-side logic for managing Posts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
<<<<<<< HEAD
  post: function(req, res) {
    params = req.params.all();
    params.userID = req.session.user;
    Post.create(params).exec(function(err, post){
      if(err) {
        console.log(err);
        return res.negotiate(err);
      }
      if(post) {
        //socket.publish(post)???? How the fuck does this work?!
      }
    }
  },
  	
=======
	
>>>>>>> cce0101022a94b2ba2c1813ef570e67e133a21dd
};

