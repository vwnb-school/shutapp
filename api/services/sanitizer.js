module.exports = {
  clean: function(object, values) {
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
  }
};
