define([
  'jquery',
  'knockout',
  'constants',
  'cryptoJS',
  'jquery.cookie'
], function ($, ko, constants) {

  $(document).ready(function() {
    function checkInputs(viewModel) {
      viewModel.email(viewModel.email().trim());
      viewModel.password(viewModel.password().trim());
      viewModel.confirmedPassword(viewModel.confirmedPassword().trim());

      var emailRegex = /\S+@\S+\.\S+/;

      if(!emailRegex.test(viewModel.email()))
        return { success: false, messageKey: 'invalidEmail'};

      if(viewModel.password().length < 3)
        return { success: false, messageKey: 'passwordLength'};

      if(viewModel.isRegistration() && viewModel.password() !== viewModel.confirmedPassword())
        return { success: false, messageKey: 'passwordsMismatch'};

      return { success: true };
    }


    // Post functions
    function signupPost(viewModel) {

      viewModel.layoutViewModel().showLoadingImage(true);
      $.post('auth/signup', {
        email: viewModel.email(),
        password: CryptoJS.MD5(viewModel.password()).toString()
      }, function (data) {
        if(!data.success) {
          viewModel.errorMessage(renderModel.labels.index.messages.signupError + data.message);
          viewModel.hasError(true);
          return;
        }

        window.location = data.location;
      })
      .fail(function(err) {
        viewModel.errorMessage(renderModel.labels.index.messages.signupServerError);
        viewModel.hasError(true);
      })
      .always(function() {
        viewModel.layoutViewModel().showLoadingImage(false);
      });
    }

    function signinPost(viewModel) {

      viewModel.layoutViewModel().showLoadingImage(true);
      $.post('auth/signin', {
        email: viewModel.email(),
        password: CryptoJS.MD5(viewModel.password()).toString()
      }, function (data) {
        if(!data.success) {
          viewModel.errorMessage(renderModel.labels.index.messages.signinError + data.message);
          viewModel.hasError(true);
          return;
        }

        window.location = data.location;
      })
      .fail(function(err) {
        viewModel.errorMessage(renderModel.labels.index.messages.signinServerError);
        viewModel.hasError(true);
      })
      .always(function() {
        viewModel.layoutViewModel().showLoadingImage(false);
      })
    }


    // knockout view model
    function LayoutViewModel() {
      var self = this;

      self.title = ko.observable(null);
      self.showLoadingImage = ko.observable(false);

      self.title.subscribe(function(newTitle) {
        document.title = newTitle;
      });
    }

    function IndexViewModel() {
      var self = this;

      self.email = ko.observable('');
      self.password = ko.observable('');
      self.confirmedPassword = ko.observable('');
      self.isRegistration = ko.observable(false);
      self.errorMessage = ko.observable('');
      self.hasError = ko.observable(false);

      self.layoutViewModel = ko.observable(new LayoutViewModel());

      self.loginOrRegistrationClick = function() {
        self.hasError(false);

        var checkInputsResult = checkInputs(self);
        if(!checkInputsResult.success) {
          self.errorMessage(renderModel.labels.messages[checkInputsResult.messageKey]);
          self.hasError(true);
          return;
        }

        if(self.isRegistration()) {
          signupPost(self);
        } else {
          signinPost(self);
        }
      }

      self.closeErrorClick = function() {
        self.errorMessage('')
        self.hasError(false);
      }

    }

    var viewModel = new IndexViewModel();
    ko.applyBindings(viewModel);

    viewModel.layoutViewModel().title(renderModel.labels.index.title);
  });
});
