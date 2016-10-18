define([
  'jquery',
  'knockout',
  'bootstrap',
  'cryptoJS'
], function ($, ko) {

  $(document).ready(function() {

    function setMessage(viewModel, message, isSuccess) {
      if(isSuccess)
        viewModel.successMessage(message);
      else
        viewModel.errorMessage(message);

      viewModel.hasError(!isSuccess);
      viewModel.hasSuccess(isSuccess);
    }

    function setTeam(viewModel, team) {
      viewModel.teamPanelViewModel().isEmpty(team.isEmpty);
      viewModel.teamPanelViewModel().users.removeAll();
      if(!viewModel.teamPanelViewModel().isEmpty()){
        viewModel.teamPanelViewModel().name(team.name);
        viewModel.teamPanelViewModel().captainId(team.captainId);
        viewModel.teamPanelViewModel().isCaptain(team.isCaptain);

        for(var i = 0; i < team.users.length; i++) {
          var teamUser = new TeamPanelUserViewModel(viewModel.teamPanelViewModel());
          teamUser.userId(team.users[i]._id);
          teamUser.username(team.users[i].username);
          viewModel.teamPanelViewModel().users.push(teamUser);
        }
      }
    }


    // post functions
    function changeUsername(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/changeUsername', { newUsername: viewModel.profilePanelViewModel().username }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.username(data.newUsername);
        viewModel.profilePanelViewModel().username(data.newUsername);
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function changePassword(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/changePassword', {
        oldPassword: CryptoJS.MD5(viewModel.profilePanelViewModel().oldPassword()).toString(),
        newPassword: CryptoJS.MD5(viewModel.profilePanelViewModel().newPassword()).toString()
      }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.profilePanelViewModel().oldPassword(null);
        viewModel.profilePanelViewModel().newPassword(null);
        viewModel.profilePanelViewModel().newConfirmedPassword(null);
        setMessage(viewModel, renderModel.labels.account.messages.passwordWasChanged, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function createTeam(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/createTeam', {
        newTeamName: viewModel.teamPanelViewModel().newTeamName()
      }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        setTeam(viewModel, data);
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function inviteUser(viewModel) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/inviteUser', { username: viewModel.teamPanelViewModel().usernameForAdd }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.teamPanelViewModel().usernameForAdd(null);
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
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
          setMessage(self.parent(), renderModel.labels.account.messages.usernameLength, false);
          return;
        }

        if(self.username() === self.parent().username()) {
          setMessage(self.parent(), renderModel.labels.account.messages.usernameSimilar, false);
          return;
        }

        changeUsername(self.parent());
      }

      self.updatePasswordClick = function() {
        self.newPassword(self.newPassword().trim());
        if(self.newPassword().length < 3) {
          setMessage(self.parent(), renderModel.labels.messages.passwordLength, false);
          return;
        }

        if(self.newPassword() !== self.newConfirmedPassword()) {
          setMessage(self.parent(), renderModel.labels.messages.passwordsMismatch, false);
          return;
        }

        changePassword(self.parent());
      }
    }


    function TeamPanelUserViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.userId = ko.observable(null);
      self.username = ko.observable(null);

      self.setCaptainClick = function(user) {
        alert('set captain');
      }

      self.removeFromTeamClick = function(user) {
        alert('remove from team');
      }
    }

    function TeamPanelViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.isEmpty = ko.observable(true);
      self.name = ko.observable(null);
      self.isCaptain = ko.observable(false);
      self.captainId = ko.observable(null);
      self.usernameForAdd = ko.observable(null);
      self.newTeamName = ko.observable(null);

      self.users = ko.observableArray([]);

      self.inviteUserClick = function() {
        inviteUser(self.parent());
      }

      self.leaveTeamClick = function() {
        alert('leave team');
      }

      self.createTeamClick = function() {
        self.newTeamName(self.newTeamName().trim());
        if(self.newTeamName().length < 3) {
          setMessage(self.parent(), renderModel.labels.messages.teamNameLength, false);
          return;
        }

        createTeam(self.parent());
      }
    }


    function InvitePanelInviteViewModel() {
      var self = this;

      self.id = ko.observable();
      self.fromTeamName = ko.observable(null);

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
      self.successMessage = ko.observable('');
      self.hasError = ko.observable(false);
      self.hasSuccess = ko.observable(false);

      self.layoutAuthViewModel = ko.observable(new LayoutAuthViewModel(self));
      self.profilePanelViewModel = ko.observable(new ProfilePanelViewModel(self));
      self.teamPanelViewModel = ko.observable(new TeamPanelViewModel(self));
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

      self.closeSuccessClick = function() {
        self.successMessage('')
        self.hasSuccess(false);
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

    setTeam(viewModel, renderModel.team);

    if(renderModel.invites) {
      for(var i = 0; i < renderModel.invites.length; i++) {
        var invite = new InvitePanelInviteViewModel();
        invite.id(renderModel.invites[i]._id);
        invite.fromTeamName(renderModel.invites[i].fromTeamId.name);
        viewModel.invitePanelViewModel().invites.push(invite);
      }
    }
  });
});
