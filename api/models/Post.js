/**
* Post.js
*
* @description :: Post-posting of the post by poster is posted to poster's follower's posts.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    userID: {
      model: 'user'
    },
    content: {
      type: 'string',
      required: 'true'
    },
    NSFW: {
      type: 'boolean',
      defaultsTo: false
    }
  },
  afterPublishCreate: function (post){
    User.findOneById(post.userID).exec(function(err,poster) {
      if(poster){
        post.userID = poster;
        var followers = User.subscribers(poster);
        console.log(followers);

        sails.sockets.emit(followers, "message", post);
      } else {
        console.log(err || post.userID);
      }
    });
  }
};
