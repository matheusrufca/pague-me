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

.controller('LoginController', function ($scope, $state, $ionicModal, $timeout, firebaseAuthService, userService) {
	self.init = function () {
		var isLoginNeeded = firebaseAuthService.isUserSignedIn()

		if (!isLoginNeeded) {
			$state.go('tab.dash'); //go to dashboard if user is logged in
		}
	};





	$scope.login = function (authMethod) {
		firebaseAuthService.facebookSignIn().then(function (response) {
			console.log(JSON.stringify(response));
			userService.addUser(response.user);
			$state.go('tab.dash');
		}).catch(function (response) {
			console.log(JSON.stringify(response));
		});
	};


	self.init();
})

.controller('ProfileController', function ($scope, ngFB, userService) {
	ngFB.api({
		path: '/me',
		params: { fields: 'id,name' }
	}).then(
        function (user) {
        	$scope.user = user;

        	userService.addUser(user);
        	console.log(JSON.stringify(user));
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
