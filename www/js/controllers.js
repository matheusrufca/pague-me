angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('DashCtrl', function ($scope, $state, firebaseAuthService, facebookService, debtService) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	$scope.$on('$ionicView.enter', function (e) {
		self.init();
	});



	var self = {};





	$scope.debts = [];


	self.init = function () {
		var isSignedIn = firebaseAuthService.isUserSignedIn();

		if (isSignedIn) {
			$scope.debts = $scope.getDebts();
		} else {
			$state.go('tab.login'); // the user isn't logged in to Facebook. go to login state
		}
	};


	$scope.getDebts = function () {
		return debtService.getUserDebts($scope.user.uid);
	};
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

.controller('ProfileController', function ($rootScope, $scope, facebookAuthService, firebaseAuthService, facebookService) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:

	$scope.$on('$ionicView.enter', function (e) {
		self.init();
	});

	var self = {};

	self.init = function () {
		$scope.getProfile();
		$scope.getFriends();
	};


	$scope.friends = [];


	$scope.getProfile = function () {
		facebookService.getProfile().then(
        function (data) {
        	$rootScope.user = angular.extend($rootScope.user, data);

        },
        function (error) {
        	console.warn('Facebook error: ' + error.error_description);
        });
	};

	$scope.getFriends = function () {
		facebookService.getFriends().then(
        function (data) {

        	$rootScope.user.friends = (data.friends.data || []).map(function (item) {
        		var usrPicture = "https://graph.facebook.com/" + item.id + "/picture?type=small";

        		return angular.extend(item, { picture: usrPicture });
        	});

        },
        function (error) {
        	console.warn('Facebook error: ' + error.error_description);
        });
	};


	$rootScope.$watchCollection('user.friends', function (newValue, oldValue) {
		$scope.friends = newValue || [];
	});
})


.controller('TabsController', function ($scope, firebaseAuthService) {


	$scope.showLogin = function () {
		return !firebaseAuthService.isUserSignedIn()
	};

})




	.controller('DebtDetailController', function ($rootScope, $scope, $state, $stateParams, facebookService, debtService, Debt) {
		var self = {};

		$scope.debt = new Debt();

		$scope.MyVar = [];

		$scope.selectedFriends = [];


		self.init = function () {
			self.getFriends();
		};



		$scope.selectedFriends = [];

		$scope.availableFriends = [
			{
				code: "GC",
				label: "Chrome",
				icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/chrome-24.png",
				url: "https://www.google.it/chrome"
			},
			{
				code: "FF",
				label: "Firefox",
				icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/firefox-24.png",
				url: "https://www.mozilla.org/firefox"
			},
			{
				code: "AS",
				label: "Safari",
				icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/safari-24.png",
				url: "http://www.apple.com/safari/"
			},
			{
				code: "IE",
				label: "Internet Explorer",
				icon: "https://cdn1.iconfinder.com/data/icons/logotypes/32/internet-explorer-24.png",
				url: "http://windows.microsoft.com/internet-explorer"
			}
		];




		self.getFriends = function () {
			facebookService.getFriends().then(
			function (data) {
				var mappedFriends = (data.friends.data || []).map(function (item) {
					var usrPicture = "https://graph.facebook.com/" + item.id + "/picture?type=small";

					return angular.extend(item, { picture: usrPicture });
				});

				$rootScope.user.friends = angular.copy(mappedFriends);
			},
			function (error) {
				console.warn('Facebook error: ' + error.error_description);
			});
		};


		$scope.save = function () {
			var item = angular.copy($scope.debt);

			if (item) {
				debtService.add(item);
			}
		};


		$rootScope.$watchCollection('user.friends', function (newValue, oldValue) {
			if (newValue) { _fillFriendsSelect(newValue); }
		});



		function _fillFriendsSelect(data) {
			var mappedData = (data || []).map(function (item, i) {
				return angular.extend(item, { label: item.name, value: item.id });
			});

			$scope.availableFriends = mappedData;
		};


		self.init();
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
