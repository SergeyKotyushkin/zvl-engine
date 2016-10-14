define([
  'jquery',
  'knockout',
  'constants',
  'bootstrap'
], function ($, ko, constants) {

  $(document).ready(function() {

    function signout(viewModel) {

      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/auth/signout', {}, function() {
        window.location.reload();
      })
      .fail(function(err) {
        viewModel.errorMessage(renderModel.labels.center.messages.signoutServerError);
        viewModel.hasError(true);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    // knockout view model
    function LayoutAuthViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.title = ko.observable(null);
      self.buttonBackLabel = ko.observable(null);
      self.buttonBackPopup = ko.observable(null);
      self.toAccountLabel = ko.observable(null);
      self.showLoadingImage = ko.observable(false);
      self.showBack = ko.observable(true);
      self.showToAccount = ko.observable(true);

      self.toAccountClick = function() {
        window.location = "account";
      }

      self.backClick = function() {
        signout(parent);
      }

      self.title.subscribe(function(newTitle) {
        document.title = newTitle;
      });
    }

    function GameAdvertismentViewModel() {
      var self = this;

      self.id = ko.observable(null);
      self.name = ko.observable(null);
      self.date = ko.observable(null);
      self.status = ko.observable(0);

      self.toGameClick = function(gameAdvertisment) {
        alert('to ' + gameAdvertisment.name());
      }
    }

    function CenterViewModel() {
      var self = this;

      self.username = ko.observable(null);

      self.gameAdvertismentViewModels = ko.observableArray([]);

      self.layoutAuthViewModel = ko.observable(new LayoutAuthViewModel(self));
    }

    var viewModel = new CenterViewModel();
    ko.applyBindings(viewModel);

    viewModel.layoutAuthViewModel().title(renderModel.labels.center.title);
    viewModel.layoutAuthViewModel().toAccountLabel(renderModel.layoutAuthRenderModel.user.username);
    viewModel.layoutAuthViewModel().buttonBackLabel(renderModel.labels.center.buttonBackLabel);
    viewModel.layoutAuthViewModel().buttonBackPopup(renderModel.labels.center.buttonBackPopup);
    viewModel.layoutAuthViewModel().showBack(true);
    viewModel.layoutAuthViewModel().showToAccount(true);

    viewModel.username(renderModel.layoutAuthRenderModel.user.username);

    viewModel.gameAdvertismentViewModels.removeAll();
    for(var i = 0; i < renderModel.nearGames.length; i++) {
      var gameAdvertismentViewModel = new GameAdvertismentViewModel();
      gameAdvertismentViewModel.id(renderModel.nearGames[i].id);
      gameAdvertismentViewModel.name(renderModel.nearGames[i].name);
      gameAdvertismentViewModel.date(renderModel.nearGames[i].date);
      gameAdvertismentViewModel.status(renderModel.nearGames[i].status);

      viewModel.gameAdvertismentViewModels.push(gameAdvertismentViewModel);
    }

  });
});
