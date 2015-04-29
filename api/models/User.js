/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {

    // The user's name or callsign
    username: {
      type: 'string',
      required: true,
      unique: true
    },

    avatar: {
      type: 'string'
    },

    // The user's email address
    // e.g. jonsnow@winterfell.net
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    password: {
      type: "string",
      required: true
    },

    admin: {
        type: 'boolean',
        defaultsTo: false
    },

    followers: {
      collection: 'User',
      via: 'following'
    },

    following: {
      collection: 'User',
      via: 'followers'
    },

    posts: {
      collection: 'Post',
      via: 'userID'
    },

    shutup: {
      type: 'integer',
      defaultsTo: 0
    },

    lastShutUp: {
      type: 'datetime'
    }
  },
  beforeCreate: function (attrs, next) {
    var sanitized = sanitizer.encryptPassword(attrs);
    if(typeof sanitized.error !== 'undefined'){
      return res.json(sanitized.error);
    }
    if(sanitized.password){
      next();
    } else {
      return res.json({error: 'Unexpected error occured while creating user'})
    }
  },
  beforeUpdate: function(attrs, next) {
    if(typeof attrs.password !== 'undefined'){
      var sanitized = sanitizer.encryptPassword(attrs);
      if(typeof sanitized.error !== 'undefined'){
        return res.json(sanitized.error);
      }
      if(sanitized.password){
        next();
      } else {
        return res.json({error: 'Unexpected error occured while creating user'})
      }
    } else {
      next();
    }
  }
};
