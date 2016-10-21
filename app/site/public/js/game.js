define([
  'jquery',
  'knockout'
], function ($, ko) {

  $(document).ready(function() {

    // post methods
    function createGame(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.ajax({
        url: '/creator/create',
        type: "POST",
        data: ko.toJSON({game: viewModel}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
          if(!data.success) {
            setMessage(viewModel, data.message, false);
            return;
          }

          setMessage(viewModel, data.message, true);
          window.location = data.location;
        },
        error: function() {
          setMessage(viewModel, renderModel.labels.messages.serverError, false);
        }
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    // knockout view model
    function HintViewModel() {
      var self = this;

      self.text = ko.observable(null);
      self.images = ko.observableArray([]);
    }

    function ImageViewModel() {
      var self = this;

      self.url = ko.observable(null);
    }

    function LevelViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.text = ko.observable(null);

        self.hints = ko.observableArray([]);
        self.images = ko.observableArray([]);
        self.messages = ko.observableArray([]);
        self.sectors = ko.observableArray([]);

        self.removeAllHints = function () {
            $(".hintTimer").each(function() {
                $(this).countdown("destroy");
            });
            this.levelHints.removeAll();
        }

        self.timerHintAddFunction = function (element) {
            if (element.nodeType !== 1) {
                return;
            }

            var hintTimer = $(element).find(".hintTimer").slice(-1)[0];
            $(hintTimer).countdown("destroy");
            $(hintTimer).countdown({
                until: Date.parse($(hintTimer).attr("data-until")),
                onExpiry: function() {
                    getLevel();
                }
            });
        }

        self.timerHintRemoveFunction = function (element) {
            if (element.nodeType !== 1) {
                return;
            }

            var hintTimer = $(element).find(".hintTimer").slice(-1)[0];
            $(hintTimer).countdown("destroy");
        }
    }

    function LayoutAuthViewModel() {
      var self = this;

      self.title = ko.observable(null);
      self.buttonBackLabel = ko.observable(null);
      self.buttonBackPopup = ko.observable(null);
      self.toAccountLabel = ko.observable(null);
      self.showLoadingImage = ko.observable(false);
      self.showBack = ko.observable(true);
      self.showToAccount = ko.observable(false);
      self.errorMessage = ko.observable('');
      self.successMessage = ko.observable('');
      self.hasError = ko.observable(false);
      self.hasSuccess = ko.observable(false);

      self.toAccountClick = function() { }

      self.backClick = function() {
        window.location = "center";
      }

      self.closeErrorClick = function() {
        self.errorMessage('')
        self.hasError(false);
      }

      self.closeSuccessClick = function() {
        self.successMessage('')
        self.hasSuccess(false);
      }

      self.title.subscribe(function(newTitle) {
        document.title = newTitle;
      });
    }

    function GameViewModel() {
      var self = this;

      self.name = ko.observable(null);
      self.showEndOfTheGame = ko.observable(false);
      self.showLevel = ko.observable(false);
      self.showTimerStartOfTheGame = ko.observable(false);
      self.endGamePlace = ko.observable(null);

      self.levelViewModel = ko.observable(new LevelViewModel());
      self.layoutAuthViewModel = ko.observable(new LayoutAuthViewModel(self));
    }


    var viewModel = new GameViewModel();

    ko.applyBindings(viewModel);

    viewModel.layoutAuthViewModel().title(renderModel.labels.game.title);
    viewModel.layoutAuthViewModel().buttonBackLabel(renderModel.labels.game.buttonBackLabel);
    viewModel.layoutAuthViewModel().buttonBackPopup(renderModel.labels.game.buttonBackPopup);
    viewModel.layoutAuthViewModel().toAccountLabel(renderModel.username);
    viewModel.layoutAuthViewModel().showBack(true);
    viewModel.layoutAuthViewModel().showToAccount(true);

    if(!renderModel.name)
      window.location = 'center';

    viewModel.showLevel(true);

    var level = renderModel.level;
    viewModel.name(renderModel.name);
    viewModel.levelViewModel().name(level.name);
    viewModel.levelViewModel().text(level.text);
    for (var i = 0; i < level.hints.length; i++) {
      var hint = new HintViewModel();
      hint.text(level.hints[i].text);

      for (var j = 0; j < level.hints[i].images.length; j++) {
        var image = new ImageViewModel();
        image.url(level.hints[i].images[j].url);
        hint.images.push(image);
      }

      viewModel.levelViewModel().hints.push(hint);
    }

    for (var i = 0; i < level.images.length; i++) {
      var image = new ImageViewModel();
      image.url(level.images[i].url);
      viewModel.levelViewModel().images.push(image);
    }

    //for (var i = 0; i < renderModel.sectors.length; i++) {
    //  var image = new ImageViewModel();
    //  image.url(renderModel.sectors[i].url);
    //  viewModel.levelViewModel().images.push(image);
    //}

  });
});
