module.exports = function(req, res, next) {
  if (req.param('password')) {
    sails.updatingPassword = true;
  } else {
    sails.updatingPassword = false;
  }
  next();
}
