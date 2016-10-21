angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('DashCtrl', function ($scope, $state, facebookAuthService, facebookService) {
	var self = {};

	self.init = function () {
		facebookAuthService.getLoginStatus().then(function (response) {
			if (response && response.status === 'connected') {
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


.controller('AccountCtrl', function ($rootScope, $scope, $state, firebaseAuthService) {
	$scope.settings = {
		enableFriends: true
	};


	$scope.signOut = function () {
		firebaseAuthService.signOut().then(function () {
			$rootScope.user = null;

			$state.go('tab.login');

		});
	};
})

.controller('LoginController', function ($rootScope, $scope, $state, $ionicModal, $timeout, firebaseAuthService, userService) {
	self.init = function () {
		var isLoginNeeded = firebaseAuthService.isUserSignedIn()

		if (!isLoginNeeded) {
			$state.go('tab.dash'); //go to dashboard if user is logged in
		}
	};

	$scope.signIn = function () {
		firebaseAuthService.facebookSignIn().then(function (response) {
			$state.go('tab.dash');

			console.debug(JSON.stringify(response));
		}).catch(function (response) {
			console.debug(JSON.stringify(response));
		});
	};	


	self.init();
})

.controller('ProfileController', function ($scope, facebookAuthService, facebookAuthService, facebookService) {

	$scope.friends = [];


	facebookAuthService.getLoginStatus();


	function init() {
		$scope.getProfile();
	};


	$scope.getProfile = function () {
		facebookService.getProfile().then(
        function (data) {
        	$scope.user = data;
        },
        function (error) {
        	console.warn('Facebook error: ' + error.error_description);
        });
	};


	$scope.getFriends = function () {
		facebookService.getFriends().then(
        function (data) {

        	$scope.friends = data.friends.data;
        },
        function (error) {
        	console.warn('Facebook error: ' + error.error_description);
        });
	};


	

	init();
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
