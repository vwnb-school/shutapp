/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,
  connection: 'remoteSQL',

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
    }
  },
<<<<<<< HEAD
  
  followers: {
    collection: 'User',
    via: 'id'
  },
  
  follows: {    
    collection: 'User',
    via: 'id'  
  },
=======
>>>>>>> cce0101022a94b2ba2c1813ef570e67e133a21dd
  beforeCreate: function (attrs, next) {
    var bcrypt = require('bcryptjs');

    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(attrs.confirmation, salt, function (err, hash) {
        if (err) return next(err);
        attrs.confirmation = hash;
      });
      bcrypt.hash(attrs.password, salt, function (err, hash) {
        if (err) return next(err);
        attrs.password = hash;
        return next();
      });
    });
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> cce0101022a94b2ba2c1813ef570e67e133a21dd
=======

>>>>>>> cce0101022a94b2ba2c1813ef570e67e133a21dd
  }
};

