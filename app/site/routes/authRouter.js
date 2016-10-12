function init(router) {
  var authenticator = require('../tools/authenticator');
  var userModel = require(__common + '/models/user');

  router.post('/auth/signup', function (req, res, next) {
    userModel.create({
			username: req.body.email,
			email: req.body.email,
			password: req.body.password,
		}, function (err, user) {
      var message = '';
      var success = false;

      if(!err && user.authenticate(req.body.password)) {
          var publicModel = {
            email: user.email,
            isAuthenticated: true
          };

          authenticator.sign(res, publicModel);
          success = true;
      }

      var culture = req.cookies.culture
        ? req.cookies.culture
        : constants.settings.common.defaultCulture;

      if(err) {
        message = err.errors[Object.keys(err.errors)[0]].message;
      }

      res.json({
				message: message,
				success: success,
        location: success ? ['/', culture, '/center'].join('') : ''
			});
    });
  });

}

module.exports = {
  init: init
}
