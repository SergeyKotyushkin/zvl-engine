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
            _id: user._id,
            email: user.email,
            isAuthenticated: true
          };

          authenticator.sign(res, publicModel);
          success = true;
      }

      if(err) {
        message = err.errors[Object.keys(err.errors)[0]].message;
      }

      var culture = req.cookies.culture
        ? req.cookies.culture
        : constants.settings.common.defaultCulture;

      res.json({
				message: message,
				success: success,
        location: success ? ['/', culture, '/center'].join('') : ''
			});
    });
  });

  router.post('/auth/signin', function (req, res, next) {
    userModel.findOne({ email: req.body.email },
      function (err, user) {
        var success = false;
      	var message = '';

      	if (!err && user) {
          var checkPasswordResult = user.authenticate(req.body.password);
          if(checkPasswordResult) {
            var publicModel = {
              _id: user._id,
              email: user.email,
              isAuthenticated: true
            };

            authenticator.sign(res, publicModel);
            success = true;
          }

          user = null;
        }

        if(!user) {
          message = "Invalid credentials";
        }

        if(err) {
          message = err.errors[Object.keys(err.errors)[0]].message;
        }

        var culture = req.cookies.culture
          ? req.cookies.culture
          : constants.settings.common.defaultCulture;

        res.json({
          message: message,
          success: success,
          location: success ? ['/', culture, '/center'].join('') : '',
          err: err
        });
    });
  });

}

module.exports = {
  init: init
}
