requirejs([
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
          self.layoutViewModel().showLoadingImage(true);
          $.post('auth/signup', {
            email: self.email(),
            password: CryptoJS.MD5(self.password()).toString()
          }, function (data) {
            if(!data.success) {
              self.errorMessage('Creation was failed: ' + data.message);
              self.hasError(true);
              return;
            }

            window.location = data.location;
          })
          .fail(function(err) {
            self.errorMessage('Creation was failed with. Server error');
            self.hasError(true);
          })
          .always(function() {
            self.layoutViewModel().showLoadingImage(false);
          })
        } else {
          self.layoutViewModel().showLoadingImage(true);
          $.post('auth/signin', {
            email: self.email(),
            password: CryptoJS.MD5(self.password()).toString()
          }, function (data) {
            if(!data.success) {
              self.errorMessage('Sign up was failed: ' + data.message);
              self.hasError(true);
              return;
            }

            window.location = data.location;
          })
          .fail(function(err) {
            self.errorMessage('Sign up was failed. Server error');
            self.hasError(true);
          })
          .always(function() {
            self.layoutViewModel().showLoadingImage(false);
          })
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
