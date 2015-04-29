module.exports = {
  clean: function(object, values) {
    /*
    @object: req parameters
    @values: values to strip
     */
    var illegal = values || ['password', 'confirmation', 'admin'];
    var currentUser = req.session.user || 'absolutely fucking nobody'; //you see when we do an _.include on this, it won't match! Hah!

    function deleteIllegal(value){
      if(_.includes(illegal, value))
        delete value;
      return false;
    }

    if (_.includes(object, currentUser)){
      return object; //if this is an own record we are retrieving, no problemo
    }
    _.invoke(object, deleteIllegal);
    return object;
  },
  encryptPassword: function(attrs) {
    /*
    @attrs: req object
     */
    if(attrs){
      if(typeof attrs.password === 'undefined')
        return {error: 'Invalid object'}
      if(typeof attrs.confirmation === 'undefined')
        return {error: 'Plz type in the password again into confirmation field'}

      var bcrypt = require('bcryptjs');
      var salt = bcrypt.genSaltSync(10);
      var hashPass = bcrypt.hashSync(attrs.password, salt);
      var hashConf = bcrypt.hashSync(attrs.confirmation, salt);
      if(hashPass == hashConf) {
        delete attrs.confirmation;
        attrs.password = hashPass;
        return attrs;
      } else {
        return {error: 'WROOONG! Your confirmation doesn\'t match your password'};
      }
    } else {
      return {error: 'An unexpected error occured while encrypting password'};
    }
  }
};
