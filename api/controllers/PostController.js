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
        io.sockets.emit('message', post);
        //TODO: consider the following: if it's not too heavy on the server, the easiest way to do realtime message
        //publishing is to create a room for every logged in user. Otherwise there will have to be some heavy
        //client-side filtering to be done - fetching the following list and displaying only the messages by those
        //users.
        return res.redirect('panel');
      }
    });
  },
  /*
  By default this one will fetch last 30 messages
  If req.param('filter') is specified AND session.userID exists (i.e. logged in), it will
  get the posts according to the follow list.
  */
  fetch: function(req, res) {
    if(req.param('filter') == true) {
      if(req.session.user){
        User.findOneById(req.session.user).populate('following').exec(function(err, user){//we get the logged in chap and populate his following list
          if(user){
            var following = _.pluck(user.following,'id'); //make a list of follow target ids... don't ask
            Post.find().where({userID: following}).sort("createdAt DESC").populate('userID').exec(function(err, posts){ //find all posts by users from following list
              _.forEach(posts, function(post){
                delete post.userID.password;
              });
              return res.json(posts);
            });
          } else {
            return res.json({
              description: "Could not find you?",
              details: req.params.all()
            });
          }
        });
      } else {
        return res.json({
          description: "Error: you must be logged in to filter messages",
          details: req.params.all()
        });
      }
    } else {
      Post.find().sort("createdAt DESC").exec(function(err, posts){ //find all posts by users from following list
        return res.json(posts);
      });
    }
  }
};
