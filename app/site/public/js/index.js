requirejs([
  'knockout',
  'constants',
  'jquery',
  'jquery.cookie'
], function (ko, constants, $) {

  $(document).ready(function() {
    function checkInputs(viewModel) {
      viewModel.email(viewModel.email().trim());
      viewModel.password(viewModel.password().trim());
      viewModel.confirmedPassword(viewModel.confirmedPassword().trim());

      return viewModel.isRegistration()
            ? viewModel.email().length > 5 &&
              viewModel.email().indexOf("@") !== -1 &&
              viewModel.password().length > 3 &&
              viewModel.confirmedPassword().length > 3 &&
              viewModel.password() === $viewModel.confirmedPassword()
            : viewModel.email().length > 5 &&
              viewModel.password().length > 3;
    }

    function tryToLogin(viewModel) {
      var accountCookie = $.cookie("engine-a");
      //if(!accountCookie) {
      //  return;
      //}

      viewModel.showLoadingImage(true);
      $.post("/api/tryToLogin", {password: "viewModel.userName"},
        function (jData) {
          var data = JSON.parse(jData)
          //alert(data.d);
        })
        .fail(function (data, t, r) {
          // on error
        })
        .always(function () {
            viewModel.showLoadingImage(false);
        });

    }


    // knockout view model
    function IndexViewModel() {
      var self = this;

      self.email = ko.observable('');
      self.password = ko.observable('');
      self.confirmedPassword = ko.observable('');
      self.isRegistration = ko.observable(false);
      self.errorMessage = ko.observable('');
      self.hasError = ko.observable(false);
      self.showLoadingImage = ko.observable(false);

      self.loginOrRegistrationClick = function() {
        var checkInputsResult = checkInputs(self);
        if(!checkInputsResult) {
          self.errorMessage('Заполните поля и проверьте правильность введенных данных!')
          self.hasError(true);
          return;
        }

        alert('ok');
      }

      self.closeErrorClick = function() {
        self.errorMessage('')
        self.hasError(false);
      }


    }

    var viewModel = new IndexViewModel();
    ko.applyBindings(viewModel);


    tryToLogin(viewModel);
  });
});
