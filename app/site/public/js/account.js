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

    function setInvites(viewModel, invites) {
      viewModel.invitePanelViewModel().invites.removeAll();
      if(invites) {
        for(var i = 0; i < invites.length; i++) {
          var invite = new InvitePanelInviteViewModel(viewModel.invitePanelViewModel());
          invite.id(invites[i]._id);
          invite.fromTeamName(invites[i].fromTeamId.name);
          viewModel.invitePanelViewModel().invites.push(invite);
        }
      }
    }

    function setEmptyTeams(viewModel, emptyTeams) {
      viewModel.emptyTeamsPanelViewModel().emptyTeams.removeAll();
      for(var i = 0; i < emptyTeams.length; i++) {
        var emptyTeam = new EmptyTeamsPanelEmptyTeamViewModel(viewModel.emptyTeamsPanelViewModel());
        emptyTeam.id(emptyTeams[i]._id);
        emptyTeam.name(emptyTeams[i].name);
        viewModel.emptyTeamsPanelViewModel().emptyTeams.push(emptyTeam);
      }
    }


    // post functions
    function post(url, data, success, fail, always) {
      $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) { success(data); },
        error: function() { fail(); }
      })
      .always(function() { always(); })
    }

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

        viewModel.teamPanelViewModel().newTeamName(null);
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

    function inviteUserAnswer(viewModel, inviteId, answer) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      post('/account/inviteUserAnswer', { inviteId: inviteId, answer: answer }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        if(answer)
          window.location.reload();

        viewModel.invitePanelViewModel().invites.remove(function(invite) {
          return invite.id() === inviteId;
        });
        setMessage(viewModel, data.message, true);
      }, function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      },function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function setCaptain(viewModel, userId) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/setCaptain', { userId: userId }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.teamPanelViewModel().isCaptain(false);
        viewModel.teamPanelViewModel().captainId(userId);
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function removeFromTeam(viewModel, userId) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/removeFromTeam', { userId: userId }, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.teamPanelViewModel().users.remove(function(user) {
          return user.userId() === userId;
        });
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function leaveTeam(viewModel, userId) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/leaveTeam', {}, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        viewModel.teamPanelViewModel().isEmpty(true);
        viewModel.teamPanelViewModel().users.removeAll();
        viewModel.teamPanelViewModel().name(null);
        viewModel.teamPanelViewModel().captainId(null);
        viewModel.teamPanelViewModel().isCaptain(null);
        setEmptyTeams(viewModel, data.emptyTeams);
        setMessage(viewModel, data.message, true);
      })
      .fail(function(err) {
        setMessage(viewModel, renderModel.labels.messages.serverError, false);
      })
      .always(function() {
        viewModel.layoutAuthViewModel().showLoadingImage(false);
      });
    }

    function enterEmptyTeam(viewModel, teamId) {
      viewModel.layoutAuthViewModel().showLoadingImage(true);
      $.post('/account/enterEmptyTeam', {teamId: teamId}, function(data) {
        if(!data.success) {
          setMessage(viewModel, data.message, false);
          return;
        }

        setTeam(viewModel, data.team);
        viewModel.emptyTeamsPanelViewModel().emptyTeams.remove(function(emptyTeam) {
          return emptyTeam.id() === teamId;
        })
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
        window.location = "/";
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
        setCaptain(viewModel, self.userId());
      }

      self.removeFromTeamClick = function(user) {
        removeFromTeam(viewModel, self.userId())
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
        leaveTeam(self.parent());
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


    function InvitePanelInviteViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.id = ko.observable();
      self.fromTeamName = ko.observable(null);

      self.commitClick = function() {
        inviteUserAnswer(self.parent().parent(), self.id(), true);
      }

      self.cancelClick = function() {
        inviteUserAnswer(self.parent().parent(), self.id(), false);
      }
    }

    function InvitePanelViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.invites = ko.observableArray([]);
    }


    function EmptyTeamsPanelEmptyTeamViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
      self.id = ko.observable(null);
      self.name = ko.observable(null);

      self.enterTeamClick = function() {
        enterEmptyTeam(self.parent().parent(), self.id());
      }
    }

    function EmptyTeamsPanelViewModel(parent) {
      var self = this;

      self.parent = ko.observable(parent);
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
      self.invitePanelViewModel = ko.observable(new InvitePanelViewModel(self));
      self.emptyTeamsPanelViewModel = ko.observable(new EmptyTeamsPanelViewModel(self));
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
    setEmptyTeams(viewModel, renderModel.emptyTeams);
    setInvites(viewModel, renderModel.invites);
  });
});
