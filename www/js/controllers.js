angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('DashCtrl', function ($scope, $state, facebookAuthService, facebookService) {
	var self = {};

	self.init = function () {
		facebookAuthService.getLoginStatus().then(function (response) {
			if (response.status === 'connected') {
				$scope.getFriends(); // get friends
			} else {
				$state.go('tab.login'); // the user isn't logged in to Facebook. go to login state
			}
		});
	};

	$scope.getFriends = function () {
		facebookService.getFriends().then(function (response) {
			console.debug(JSON.stringify(response));
		});
	};


	self.init();
})


.controller('AccountCtrl', function ($scope, $state, facebookAuthService) {
	$scope.settings = {
		enableFriends: true
	};


	$scope.logout = function () {
		facebookAuthService.logout().then(function () {
			$state.go('tab.login');
		});
	};
})

.controller('LoginController', function ($scope, $state, $ionicModal, $timeout, facebookAuthService) {
	self.init = function () {
		facebookAuthService.getLoginStatus().then(function (response) {
			if (response.status === 'connected') {
				$state.go('tab.dash');
			}
		});
	};

	//This method is executed when the user press the "Login with facebook" button
	$scope.facebookSignIn = function () {
		var callback = function (response) {
			if (response.status === 'connected') {
				console.log('Facebook login succeeded');
				$state.go('tab.profile'); // go do dashboard
			} else {
				console.log('Facebook login failed');
				alert('Facebook login failed');
			};
		}

		facebookAuthService.login().then(callback); //login on facebook
	};



	self.init();
})

.controller('ProfileController', function ($scope, ngFB) {
	ngFB.api({
		path: '/me',
		params: { fields: 'id,name' }
	}).then(
        function (user) {
        	$scope.user = user;
        },
        function (error) {
        	alert('Facebook error: ' + error.error_description);
        });
})


.controller('ChatsCtrl', function ($scope, Chats) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.chats = Chats.all();
	$scope.remove = function (chat) {
		Chats.remove(chat);
	};
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
});
