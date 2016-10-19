define([
  'jquery',
  'knockout',
  'bootstrap'
], function ($, ko, constants) {

  $(document).ready(function() {

    function setMessage(viewModel, message, isSuccess) {
      if(isSuccess)
        viewModel.successMessage(message);
      else
        viewModel.errorMessage(message);

      viewModel.hasError(!isSuccess);
      viewModel.hasSuccess(isSuccess);
    }


    // knockout view model
    function AnswerViewModel() {
        var self = this;

        self.text = ko.observable(null);
    };

    function SectorViewModel() {
        var self = this;

        self.orderNumber = ko.observable(null);

        self.answers = ko.observableArray([]);

        self.addAnswer = function () {
            self.answers.push(new AnswerViewModel());
        }

        self.removeAnswer = function (answer) {
            self.answers.remove(answer);
        }
    };

    function ImageViewModel() {
        var self = this;

        self.url = ko.observable(null);
        self.orderNumber = ko.observable(null);
    };

    function HintViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.orderNumber = ko.observable(null);
        self.text = ko.observable(null);
        self.time = ko.observable(null);

        self.images = ko.observableArray([]);

        self.addImage = function () {
            self.images.push(new ImageViewModel());
        }

        self.removeImage = function (image) {
            self.images.remove(image);
        }
    };

    function LevelViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.orderNumber = ko.observable(null);
        self.text = ko.observable(null);
        self.time = ko.observable(null);

        self.hints = ko.observableArray([]);
        self.images = ko.observableArray([]);
        self.sectors = ko.observableArray([]);

        self.addHint = function () {
            self.hints.push(new HintViewModel());
        }

        self.addImage = function () {
            self.images.push(new ImageViewModel());
        }

        self.addSector = function () {
            self.sectors.push(new SectorViewModel());
        }

        self.removeHint = function (hint) {
            self.hints.remove(hint);
        }

        self.removeImage = function (image) {
            self.images.remove(image);
        }

        self.removeSector = function (sector) {
            self.sectors.remove(sector);
        }
    };

    function TeamViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.code = ko.observable(null);
    };

    function LayoutAuthViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.title = ko.observable(null);
      self.buttonBackLabel = ko.observable(null);
      self.buttonBackPopup = ko.observable(null);
      self.toAccountLabel = ko.observable(null);
      self.showLoadingImage = ko.observable(false);
      self.showBack = ko.observable(true);
      self.showToAccount = ko.observable(false);

      self.toAccountClick = function() { }

      self.backClick = function() {
        window.location = "/";
      }

      self.title.subscribe(function(newTitle) {
        document.title = newTitle;
      });
    }


    function CreatorViewModel() {
        var self = this;

        self.id = ko.observable(null);

        self.header = ko.observable(null);
        self.statistics = ko.observable(false);
        self.active = ko.observable(false);
        self.name = ko.observable(null);
        self.timeStart = ko.observable(null);

        self.levels = ko.observableArray([]);
        self.teams = ko.observableArray([]);

        self.layoutAuthViewModel = ko.observable(new LayoutAuthViewModel(self));

        self.addTeam = function () {
            self.teams.push(new TeamViewModel());
        }

        self.addLevel = function () {
            self.levels.push(new LevelViewModel());
        }

        self.removeTeam = function (team) {
            self.teams.remove(team);
        }

        self.removeLevel = function (level) {
            self.levels.remove(level);
        }

        self.removeGame = function () {
            self.levels.removeAll();
            self.teams.removeAll();
            self.name = ko.observable(null);
            self.timeStart = ko.observable(null);
            self.statistics = ko.observable(false);
            self.active = ko.observable(false);
        }

        self.createGame = function() {
            addGame();
        }
    };

    var viewModel = new CreatorViewModel();

    ko.applyBindings(viewModel);

    viewModel.header(renderModel.header);
    viewModel.layoutAuthViewModel().title(renderModel.labels.creator.title);
    //viewModel.layoutAuthViewModel().buttonBackLabel(renderModel.labels.creator.buttonBackLabel);
    //viewModel.layoutAuthViewModel().buttonBackPopup(renderModel.labels.creator.buttonBackPopup);
    viewModel.layoutAuthViewModel().showBack(true);
  });
});
