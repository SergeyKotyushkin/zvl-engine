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
      return viewModel.isRegistration()
            ? viewModel.email().length > 5 &&
              emailRegex.test(viewModel.email()) &&
              viewModel.password().length > 3 &&
              viewModel.confirmedPassword().length > 3 &&
              viewModel.password() === viewModel.confirmedPassword()
            : viewModel.email().length > 5 &&
              viewModel.password().length > 3;
    }


    // Post functions
    function signupPost(viewModel) {

      viewModel.layoutViewModel().showLoadingImage(true);
      $.post('auth/signup', {
        email: viewModel.email(),
        password: CryptoJS.MD5(viewModel.password()).toString()
      }, function (data) {
        if(!data.success) {
          viewModel.errorMessage('Sign up was failed: ' + data.message);
          viewModel.hasError(true);
          return;
        }

        window.location = data.location;
      })
      .fail(function(err) {
        viewModel.errorMessage('Sign up was failed with. Server error');
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
          viewModel.errorMessage('Sign in was failed: ' + data.message);
          viewModel.hasError(true);
          return;
        }

        window.location = data.location;
      })
      .fail(function(err) {
        viewModel.errorMessage('Sign in was failed. Server error');
        viewModel.hasError(true);
      })
      .always(function() {
        viewModel.layoutViewModel().showLoadingImage(false);
      })
    }


    // knockout view model
    function LayoutViewModel() {
      var self = this;

      self.showLoadingImage = ko.observable(false);
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
        if(!checkInputsResult) {
          self.errorMessage('Заполните поля и проверьте правильность введенных данных!')
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
  });
});
