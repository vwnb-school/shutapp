/**
* PostController
*
* @description :: Server-side logic for managing Posts
* @help        :: See http://links.sailsjs.org/docs/controllers
*/

module.exports = {
  post: function(req, res) {
    params = req.params.all();
    params.userID = req.session.user;
    Post.create(params).exec(function(err, post){
      if(err) {
        console.log(err);
        return res.negotiate(err);
      }
      if(post){
        //list of socket methods: https://gist.github.com/mikermcneil/6598661
        var io = sails.io;
        //so essentially this should only emit to followers
        io.sockets.emit('message', post); //why limit? Just publish the whole post and use model attributes.
        return res.redirect('panel');
      }
    });
  }
};
