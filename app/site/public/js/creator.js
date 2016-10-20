define([
  'jquery',
  'knockout',
  'bootstrap'
], function ($, ko, constants) {

  $(document).ready(function() {

    function checkInputs(viewModel) {
      $(":text").each(function() {
        $(this).removeClass("empty-input");
      });

      var isEmpty = false;
      $(".time-input").each(function() {
        $(this).val($(this).val().trim());
        var condition = false;
        if($(this).hasClass("date-input")) {
          condition = checkDateTime($(this).val());
        } else {
          condition = checkTime($(this).val());
        }

        if(!condition) {
            $(this).addClass("empty-input");
            isEmpty = true;
        }
      });

      if (isEmpty) {
        setMessage(viewModel, renderModel.labels.creator.messages.fillDateFields, false);
        return false;
      }

      $(":text").each(function () {
        $(this).val($(this).val().trim());
        if (!$(this).val().length) {
            $(this).addClass("empty-input");
            $(this).focus();
            isEmpty = true;
        }
      });

      if (isEmpty) {
        setMessage(viewModel, renderModel.labels.creator.messages.fillTextFields, false);
        return false;
      }

      return true;
    }

    function checkDateTime(value) {
      return /^([\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2})$/.test(value) &&
        isNaN(Date.parse(value)) == false;
    }

    function checkTime(value) {
      if(!/^([\d]{2}:[\d]{2}:[\d]{2})$/.test(value))
        return false;

      var nums = value.split(':');
      return +nums[0] < 24 && +nums[1] < 60 && +nums[2] < 60
        ? [+nums[0], +nums[1], +nums[2]]
        : null;
    }

    function createTimeFromValues(values) {
      return [
        values[0] == 0 ? "00" : values[0],
        values[1] == 0 ? "00" : values[1],
        values[2] == 0 ? "00" : values[2]
      ].join(':');
    }

    function setMessage(viewModel, message, isSuccess) {
      if(isSuccess)
        viewModel.layoutAuthViewModel().successMessage(message);
      else
        viewModel.layoutAuthViewModel().errorMessage(message);

      viewModel.layoutAuthViewModel().hasError(!isSuccess);
      viewModel.layoutAuthViewModel().hasSuccess(isSuccess);
    }

    function setGame(viewModel, game) {
      viewModel.name(game.name);
      viewModel.timeStart(game.timeStart);
      viewModel.active(game.active);
      viewModel.statistics(game.statistics);
      viewModel.id(game._id);

      for (var i = 0; i < game.levels.length; i++) {
        var level = new LevelViewModel();

        level.name(game.levels[i].name);
        level.orderNumber(game.levels[i].orderNumber);
        level.text(game.levels[i].text);
        level.time(createTimeFromValues(game.levels[i].timeValues));

        for (var j = 0; j < game.levels[i].hints.length; j++) {
          var hint = new HintViewModel();

          hint.name(game.levels[i].hints[j].name);
          hint.orderNumber(game.levels[i].hints[j].orderNumber);
          hint.text(game.levels[i].hints[j].text);
          hint.time(createTimeFromValues(game.levels[i].hints[j].timeValues));

          for (var z = 0; z < game.levels[i].hints[j].images.length; z++) {
            var image = new ImageViewModel();

            image.orderNumber(game.levels[i].hints[j].images[z].orderNumber);
            image.url(game.levels[i].hints[j].images[z].url);

            hint.images.push(image);
          }

          level.hints.push(hint);
        }

        for (var j = 0; j < game.levels[i].sectors.length; j++) {
          var sector = new SectorViewModel();

          sector.orderNumber(game.levels[i].sectors[j].orderNumber);

          for (var z = 0; z < game.levels[i].sectors[j].answers.length; z++) {
            var answer = new AnswerViewModel();

            answer.text(game.levels[i].sectors[j].answers[z].text);

            sector.answers.push(answer);
          }

          level.sectors.push(sector);
        }

        for (var j = 0; j < game.levels[i].images.length; j++) {
          var image = new ImageViewModel();

          image.orderNumber(game.levels[i].images[j].orderNumber);
          image.url(game.levels[i].images[j].url);

          level.images.push(image);
        }

        viewModel.levels.push(level);
      }
    }

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
            if(!confirm(renderModel.labels.creator.messages.removeAnswer))
              return;

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
        self.timeValues = [];

        self.images = ko.observableArray([]);

        self.addImage = function () {
            self.images.push(new ImageViewModel());
        }

        self.removeImage = function (image) {
          if(!confirm(renderModel.labels.creator.messages.removeImage))
            return;

          self.images.remove(image);
        }

        self.time.subscribe(function(newValue) {
          var result = checkTime(newValue);

          self.timeValues = [];
          if(result)
            self.timeValues = result;
        });
    };

    function LevelViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.orderNumber = ko.observable(null);
        self.text = ko.observable(null);
        self.time = ko.observable(null);
        self.timeValues = [];

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
          if(!confirm(renderModel.labels.creator.messages.removeHint))
            return;

          self.hints.remove(hint);
        }

        self.removeImage = function (image) {
          if(!confirm(renderModel.labels.creator.messages.removeImage))
            return;

          self.images.remove(image);
        }

        self.removeSector = function (sector) {
          if(!confirm(renderModel.labels.creator.messages.removeSector))
            return;

          self.sectors.remove(sector);
        }


        self.time.subscribe(function(newValue) {
          var result = checkTime(newValue);

          self.timeValues = [];
          if(result)
            self.timeValues = result;
        });
    };

    function TeamViewModel() {
        var self = this;

        self.name = ko.observable(null);
        self.code = ko.observable(null);
    };

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
        if(!confirm(renderModel.labels.creator.messages.backQuestion))
          return;

        window.location = "account";
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


    function CreatorViewModel() {
        var self = this;

        self.id = ko.observable(null);

        self.header = ko.observable(null);
        self.statistics = ko.observable(false);
        self.active = ko.observable(false);
        self.name = ko.observable(null);
        self.timeStart = ko.observable(null);
        self.timeStartNumber = ko.observable(null);

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
          if(!confirm(renderModel.labels.creator.messages.removeLevel))
            return;

          self.levels.remove(level);
        }

        self.removeGame = function () {
          if(!confirm(renderModel.labels.creator.messages.removeGame))
            return;

          self.levels.removeAll();
          self.teams.removeAll();
          self.name = ko.observable(null);
          self.timeStart = ko.observable(null);
          self.statistics = ko.observable(false);
          self.active = ko.observable(false);
        }

        self.createGame = function() {
          if(!checkInputs(viewModel))
            return;

          createGame(self)
        }


        self.timeStart.subscribe(function(newValue) {
          self.timeStartNumber(checkDateTime(newValue) ? Date.parse(newValue) : null)
        });
    };

    var viewModel = new CreatorViewModel();

    ko.applyBindings(viewModel);

    viewModel.header(renderModel.header);
    viewModel.layoutAuthViewModel().title(renderModel.labels.creator.title);
    viewModel.layoutAuthViewModel().buttonBackLabel(renderModel.labels.creator.buttonBackLabel);
    viewModel.layoutAuthViewModel().buttonBackPopup(renderModel.labels.creator.buttonBackPopup);
    viewModel.layoutAuthViewModel().showBack(true);

    var game = renderModel.game;
    if(game)
      setGame(viewModel, game);
  });
});
