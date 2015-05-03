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
        Post.publishCreate(post); //publish creation of the post. What a beautiful creation
        /* this actually is a redundant step (sort of).
        In the solution Ville found, they noted that there are 2 ways to do this:
        1) lifecycle callbacks - afterPublishCreate one that I put in the Post model
        2) Just do it here. In this function
        The reason why I went with #1 is because this allows us greater flexibility at pretty much no
        performance cost - we would still be publishing the Post publically, so if we ever want implement
        some sort of realtime post counter (e.g. "There have been 666 new posts since last update, click this to go to hell"),
        it would be easier because we wouldn't have to create any new sockets to that, just subscribe any client to posts
        */
        return res.redirect('panel');
      }
    });
  },
  fetch: function(req, res) {
    /*
    By default this one will fetch last 30 messages
    If req.param('filter') is equal to true (GET /Post/fetch?filter=1) AND session.userID exists (i.e. logged in), it will
    get the posts according to the follow list.
    */

    if(req.param('filter') == true && req.session.user) {
      User.findOneById(req.session.user).populate('following').exec(function(err, user){//we get the logged in chap and populate his following list
        if(user){
          var following = _.pluck(user.following,'id'); //make a list of follow target ids... don't ask
          following.push(user);
          Post.find().where({userID: following}).sort("createdAt DESC").populate('userID').exec(function(err, posts){ //find all posts by users from following list
            _.forEach(posts, function(post){
              if(post.userID) {
                delete post.userID.password;
              } else {
                post.userID = false;
              }
              post.following = true; //if we're filtering then this will be true
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
    }else if(req.session.user){
      User.findOneById(req.session.user).populate('following').exec(function(err, user){
        if(user){
          var following = _.pluck(user.following,'id');
          Post.find().sort("createdAt DESC").populate('userID').exec(function(err, posts){
            _.forEach(posts, function(post){
              if(post.userID) {
                delete post.userID.password;
                if(following.indexOf(post.userID.id) != -1){ //in the index view, we need to know whether the post is by a followed dude
                  post.following = true;
                }else{
                  post.following = false;
                }
              } else {
                post.userID = false;
                post.following = false;
              }
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
      Post.find().sort("createdAt DESC").populate('userID').exec(function(err, posts){
        _.forEach(posts, function(post){
          if(post.userID) {
            delete post.userID.password;
          } else {
            post.userID = false;
          }
          post.following = false;
        });
        return res.json(posts);
      });
    }
  },
  fetchById: function(req,res){ //this is very redundant T________T
    if(req.session.user){
      User.findOneById(req.session.user).populate('following').exec(function(err, user){
        if(user){
          var following = _.pluck(user.following,'id');
          Post.find().where({userID: req.params.id}).sort("createdAt DESC").populate('userID').exec(function(err, posts){
            _.forEach(posts, function(post){
              if(post.userID) {
                delete post.userID.password;
                if(following.indexOf(post.userID.id) != -1){ //in the index view, we need to know whether the post is by a followed dude
                  post.following = true;
                }else{
                  post.following = false;
                }
              } else {
                post.userID = false;
                post.following = false;
              }
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
      Post.find().where({userID: req.params.id}).sort("createdAt DESC").populate('userID').exec(function(err, posts){
        _.forEach(posts, function(post){
          if(post.userID) {
            delete post.userID.password;
          } else {
            post.userID = false;
          }
          post.following = false;
        });
        return res.json(posts);
      });
    }
  }
};
