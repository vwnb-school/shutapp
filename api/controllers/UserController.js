/**
* UserController *
* @description :: Server-side logic for managing users
* @help        :: See /** http://links.sailsjs.org/docs/controllers
*/
module.exports = {
  subscribeAll: function(req, res){
    /*
    this one will just subscribe the logged in user to their follow list. The response messages explain it well enough.
    */
    if(req.session.user){
      User.findOneById(req.session.user).populate('following').exec(function(err, user){
        user.following.push(user); //this is mostly for the user panel so we get our own stuff on submit
        User.subscribe(req.socket, user.following, ['update']); //Does this carry over across different pages?
        console.log('subscribed '+req.socket+' to update');
        return res.json({success: 'Subscribed to personalized feed'});
      });
    } else {
      return res.json(['User not logged in, ignoring follower subscribe request']);
    }
  },
  shutup: function (req, res) {
    console.log('Shutup called on ' + req.param('target'));
    /* @req: {
        target: id of post's creator on which it's clicked
      }
      on success increments a shutup counter and emits a message to the target
      TODO: assign sessionAuth policy to this
      TODO: make a timer policy - this function should not be executed more than once every 3-4 minutes
      For the timer policy when shutup is first executed, create a new session variable storing "you", "target" and date.now()
      For subsequent calls, if that session entry exists, check the timer and deny or allow the function to proceed.
    */
    User.findOneById(req.param('target')).exec(function (err, user) {
      if (user) {
        if (typeof user.shutup !== 'number') user.shutup = 0;
        user.shutup++;
        user.lastShutUp = new Date() //TODO: if we want to know how many 'shutups per hour' someone got, we need a policy that can track this.
        user.lastShutUp = user.lastShutUp.toISOString();
        //it is easy to do - upon recieving a shutup create a session variable for 'shutupsPerUnitTime' and increment it according
        //to whatever unit you want.
        user.save(function (err, saved) {
          if (saved) {
            var success = {
              shutup: saved,
              you: req.session.user
            }
            //TODO: check if the target is online and if so, emit a message to him
            return res.json(success);
          } else {
            var error = {
              description: 'Failed to shutup. They get a pass on this one. ',
              details: user
            }
            return res.json(error);
          }
        })
      } else {
        var error = {
          description: 'Can\'t find your target.They may have been terminally shut already ',
          details: req.params.all()
        }
        return res.json(error);
      }
    });
  },
  signup: function (req, res) {
    res.view('signup');
  },
  follow: function (req, res) {
    /* This is a toggle action - if the association exists, it will be removed, else it will be added.
    @params: {
      follow: req.param('follow') -> User(id associated with the post),
      follower: User(id from the session)
    }
    @res: {
      success: {
        target: User id of target,
        you: User id of one who requested the follow
      }
      error: {
        description: String description of error
        details: Object: some object   }
    } */
    var error, success;
    var params = {
      follow: req.param('follow'),
      follower: req.session.user
    };
    User.findOneById(params.follow).populate('followers').exec(function (err, target) {
      if (err) {
        console.log(err);
        error = {
          description: "Error finding or populating your target's follower list",
          details: err
        };
        return res.json(error);
      }
      if (target) {
        console.log(target.followers);
        var exists = _.find(target.followers, function (follower) {
          return follower.id == params.follower;
        });
        if (exists) {
          target.followers.remove(params.follower);
        } else {
          target.followers.add(params.follower);
        }
        target.save(function (err, savedRecords) {
          if (err) {
            console.log(err);
            error = {
              description: "Error saving your target's follower list",
              details: err
            };
            return res.json(error);
          }
          if (savedRecords) {
            User.findOneById(params.follower).exec(function (err, you) {
              success = {
                target: {
                  name: savedRecords.username,
                  id: savedRecords.id,
                  avatar: savedRecords.avatar
                },
                you: you
              };
              success["action"] = exists ? 0 : 1; //1 follow, 0 unfollow
              return res.json(success);
            });
          } else {
            error = {
              description: "Records could not be updated",
              details: {
                requestedId: params.follow,
                target: target
              }
            };
            return res.json(error);
          }
        });
      } else {
        console.log(err);
        error = {
          description: "Error finding your target ",
          details: err
        };
        return res.json(error);
      }
    });
  },
  login: function (req, res) {
    var bcrypt = require('bcryptjs');
    User.findOneByEmail(req.param("email")).exec(function (err, user) {
      if (err) res.json({
        error: 'DB error'
      }, 500);
      if (user) {
        bcrypt.compare(req.param("password"), user.password, function (err, match) {
          if (err) res.json({
            error: 'Server error'
          }, 500);
          if (match) { /*  password match */
            req.session.user = user.id;
            return res.redirect('/panel');
          } else { /* invalid password */
            if (req.session.user) req.session.user = null;
            res.status(500).json({
              error: 'Invalid password'
            });
          }
        });
      } else {
        res.send('<h2>User not found WTFLOL! < /h2>');
      }
    });
  },
  logout: function (req, res) {
    req.session.user = null;
    return res.redirect("/");
  },
  displayPanel: function (req, res) {
    if (req.session.user) {
      User.findOneById(req.session.user).populate('following').exec(function (err, user) {
        //I pass the populated following list to panel for convenience - in case you want to quickly build a follow list there upon load
        if (err) return res.negotiate(err);
        if (user) {
          delete user.password;
          return res.view('panel', user);
        }
      });
    } else {
      return res.send('NOT SESSION EEZ BAD!');
    }
  },
  create: function (req, res, next) {
    var params = req.params.all();
    if (params.password != params.confirmation) {
      req.flash("Passowrds don't match ");
      return res.redirect('/signup');
    }
    var Gravatar = require('machinepack-gravatar'); /* Build the URL of a gravatar image for a particular email address. */
    Gravatar.getImageUrl({
      emailAddress: params.email,
      gravatarSize: 400,
      defaultImage: 'http://www.gravatar.com/avatar/00000000000000000000000000000000',
      rating: 'g',
      useHttps: true
    }).exec({
      'error': function () {
        params.avatar = 'http://www.gravatar.com/avatar/00000000000000000000000000000000';
        User.create(params, function userCreated(err, user) {
          if (err) {
            req.flash('err', err.ValidationError);
            return res.redirect('/signup');
          }
          res.location('/panel');
          return res.view('panel');
        });
      },
      'encodingFailed': function () {
        User.create(params).exec(function userCreated(err, user) {
          if (err) {
            req.flash('err', err.ValidationError);
            return res.redirect('/signup');
          }
          req.session.user = user.id;
          return res.redirect('/panel');
        });
      },
      'success': function (imgUrl) {
        params.avatar = imgUrl;
        User.create(params).exec(function userCreated(err, user) {
          if (err) {
            req.flash('err', err.ValidationError);
            return res.redirect('/signup');
          }
          req.session.user = user.id;
          return res.redirect('/panel');
        });
      }
    });


}  



};
