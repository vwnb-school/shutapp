/**
 * ownOnly
 *
 * @module      :: Policy
 * @description :: Simple policy to keep users from editing other than own data
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  //check if the record's id is equal to session's user id
  if (req.params.id == req.session.user) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
