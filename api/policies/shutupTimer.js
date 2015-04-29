/**
 * Created by Stanislav on 28.4.2015.
 */
module.exports = function(req, res, next){
  console.log('policy timer triggered');
  if(typeof req.session.shutup == 'undefined'){ //if this is run for the first time
    var shutup = {
      you: req.session.user,
      targets: [] //collection of your shutup calls
    };
    console.log('policy timer lifecycle check - session new: '+ shutup.you);
  } else {
    var shutup = req.session.shutup;
    console.log('policy timer lifecycle check - session exists: '+ shutup.you);
  }
  var stamp = _.find(shutup.targets, function(stamp){
    if(shutup.targets.length == 0) return false;
    return stamp.target == req.param('target');
  }); //find the stamp if exists
  console.log('policy timer lifecycle check - stamp: '+ JSON.stringify(stamp));
  if(stamp){
    console.log('policy timer lifecycle check - stamp: running timer check');
    if ((Date.now() - (stamp.time)) > appConfig.shutupInterval*1000){
      console.log('policy timer lifecycle check - stamp: interval passed. Current config: ' + appConfig.shutupInterval);
      stamp.time = Date.now();
    } else {
      var error = {
        description: 'You already shut them up less than '+appConfig.shutupInterval+' seconds ago! Hold your hate.',
        details: req.param('target')
      };
      console.log('policy timer lifecycle check - timer too short: '+ stamp.target);
      return res.json(error);
    }
  } else {
    shutup.targets.push({target: req.param('target'), time: Date.now()});
    console.log('policy timer lifecycle check - target new: '+ shutup.targets.length);
  }

  req.session.shutup = shutup;
  console.log('policy timer lifecycle check - policy passed: '+ req.session.shutup.you);
  next();
};
