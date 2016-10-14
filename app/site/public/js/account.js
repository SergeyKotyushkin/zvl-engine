define([
  'jquery',
  'knockout',
  'bootstrap'
], function ($, ko) {

  $(document).ready(function() {

    // post functions
    function changeUsername(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/changeUsername', { newUsername: viewModel.profilePanelViewModel().username }, function(data) {
        if(!data.success) {
          viewModel.errorMessage(data.message);
          viewModel.hasError(true);
          return;
        }

        viewModel.username(data.message);
        viewModel.profilePanelViewModel().username(data.message);
      })
      .fail(function(err) {
        viewModel.errorMessage(renderModel.labels.messages.serverError);
        viewModel.hasError(true);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }


    // knockout view models
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
        alert('back');
      }

      self.title.subscribe(function(newTitle) {
        document.title = newTitle;
      });
    }


    function ProfilePanelViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.username = ko.observable(null);
      self.oldPassword = ko.observable(null);
      self.newPassword = ko.observable(null);
      self.newConfirmedPassword = ko.observable(null);

      self.updateUsernameClick = function() {
        self.username(self.username().trim());
        if(self.username().length < 3) {
          self.parent().errorMessage(renderModel.labels.account.messages.usernameLength);
          self.parent().hasError(true);
          return;
        }

        if(self.username() === self.parent().username()) {
          self.parent().errorMessage(renderModel.labels.account.messages.usernameSimilar);
          self.parent().hasError(true);
          return;
        }

        changeUsername(self.parent());
      }

      self.updatePasswordClick = function() {
        alert('update password');
      }
    }


    function TeamPanelUserViewModel() {
      var self = this;

      self.userId = ko.observable(null);
      self.username = ko.observable(null);

      self.setCaptainClick = function(user) {
        alert('set captain');
      }

      self.removeFromTeamClick = function(user) {
        alert('remove from team');
      }
    }

    function TeamPanelViewModel() {
      var self = this;

      self.isEmpty = ko.observable(true);
      self.name = ko.observable(null);
      self.isCapitan = ko.observable(false);
      self.captainId = ko.observable(null);
      self.usernameForAdd = ko.observable(null);
      self.newTeamName = ko.observable(null);

      self.users = ko.observableArray([]);

      self.inviteUserClick = function() {
        alert('invite user');
      }

      self.leaveTeamClick = function() {
        alert('leave team');
      }

      self.createTeamClick = function() {
        alert('create team');
      }
    }


    function InvitePanelInviteViewModel() {
      var self = this;

      self.fromTeamName = ko.observableArray(null);

      self.commitClick = function() {
        alert('commit');
      }

      self.cancelClick = function() {
        alert('cancel');
      }
    }

    function InvitePanelViewModel() {
      var self = this;

      self.invites = ko.observableArray([]);
    }


    function EmptyTeamsPanelEmptyTeamViewModel() {
      var self = this;

      self.name = ko.observableArray(null);

      self.enterTeamClick = function() {
        alert('enter team');
      }
    }

    function EmptyTeamsPanelViewModel() {
      var self = this;

      self.emptyTeams = ko.observableArray([]);
    }


    function GamePanelGameTeamViewModel() {
      var self = this;

      self.id = ko.observable(null);
      self.name = ko.observable(null);
    }

    function GamesPanelGameViewModel() {
      var self = this;

      self.name = ko.observableArray(null);
      self.enableActive = ko.observableArray(false);
      self.enableStatistics = ko.observableArray(false);

      self.teams = ko.observableArray([]);

      self.enterTeamClick = function() {
        alert('enter team');
      }

      self.editGameTeamsClick = function() {
        alert('edit game teams');
      }

      self.editGameClick = function() {
        alert('edit game');
      }

      self.removeGameClick = function() {
        alert('remove game');
      }
    }

    function GamesPanelViewModel() {
      var self = this;

      self.games = ko.observableArray([]);

      self.createGameClick = function() {
        alert('create game');
      }
    }

    function AllTeamsTeamViewModel() {
      var self = this;

      self.id = ko.observable(null);
      self.name = ko.observable(null);
      self.isChecked = ko.observable(false);
    }

    function AccountViewModel() {
      var self = this;

      self.userId = ko.observable(null);
      self.username = ko.observable(null);
      self.email = ko.observable(null);
      self.isAdmin = ko.observable(0);
      self.errorMessage = ko.observable('');
      self.hasError = ko.observable(false);

      self.layoutAuthViewModel = ko.observable(new LayoutAuthViewModel(self));
      self.profilePanelViewModel = ko.observable(new ProfilePanelViewModel(self));
      self.teamPanelViewModel = ko.observable(new TeamPanelViewModel());
      self.invitePanelViewModel = ko.observable(new InvitePanelViewModel());
      self.emptyTeamsPanelViewModel = ko.observable(new EmptyTeamsPanelViewModel());
      self.gamesPanelViewModel = ko.observable(new GamesPanelViewModel());

      self.allTeams = ko.observableArray([]);

      self.commitGameTeamsClick = function() {
        alert('commit game teams');
      }

      self.closeErrorClick = function() {
        self.errorMessage('')
        self.hasError(false);
      }
    }

    var viewModel = new AccountViewModel();
    ko.applyBindings(viewModel);

    viewModel.layoutAuthViewModel().title(renderModel.labels.account.title);
    viewModel.layoutAuthViewModel().buttonBackLabel(renderModel.labels.account.buttonBackLabel);
    viewModel.layoutAuthViewModel().buttonBackPopup(renderModel.labels.account.buttonBackPopup);
    viewModel.layoutAuthViewModel().showBack(true);

    viewModel.userId(renderModel.layoutAuthRenderModel.user.id);
    viewModel.username(renderModel.layoutAuthRenderModel.user.username);
    viewModel.email(renderModel.layoutAuthRenderModel.user.email);
    viewModel.isAdmin(renderModel.layoutAuthRenderModel.user.isAdmin);
    viewModel.profilePanelViewModel().username(viewModel.username());
  });
});
