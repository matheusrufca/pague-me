angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('DashCtrl', function ($rootScope, $scope, $timeout, $filter, $state, firebaseAuthService, facebookService, debtService) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	$scope.$on('$ionicView.beforeEnter', function (e) {
		$timeout(self.init(), 100);
	});


	var self = {};

	$scope.debts = [];





	//TODO: bug on showing lenght pendingDebts length 
	$scope.pendingDebtsLength = 0;



	self.init = function () {
		var isSignedIn = firebaseAuthService.isUserSignedIn();

		if (isSignedIn) {
			$scope.debts = $scope.getDebts();
		} else {
			$state.go('tab.login'); // the user isn't logged in to Facebook. go to login state
		}
	};


	$scope.getDebts = function () {

		debtService.findDebtsByUser($rootScope.user.uid).then(function (result) {
			$scope.debts = Object.values(result);
		}, function (error) { });
		//return debtService.getUserDebts($scope.user.uid);
	};



	$scope.pendingDebts = function () {
		var filtered = $filter('pending')($scope.debts, true) || [];

		$scope.pendingDebtsLength = filtered.length;

		return filtered;
	};



	$scope.accept = function (debt) {
		debt.acceptedAt = new Date().getTime();
		debt.pending = false;
		self.save(debt);
	};

	$scope.refuse = function (debt) {
		debt.refusedAt = new Date().getTime();
		debt.pending = false;
		self.update(debt);
	};

	$scope.pay = function (debt) {
		debt.paid = true;
		debt.paidAt =  new Date().getTime();

		self.save(debt);
	};



	self.save = function (debt) {
		debtService.save(debt).then(function (response) {
			console.log(response);
			//$scope.getDebts();
		});;
	};



	//https://codepen.io/ionic/pen/uJkCz
	//http://codepen.io/loringdodge/pen/zGWLQm
	$scope.toggleItem = function (group) {
		if ($scope.isItemShown(group)) {
			$scope.shownItem = null;
		} else {
			$scope.shownItem = group;
		}
	};
	$scope.isItemShown = function (group) {
		return $scope.shownItem === group;
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




	.controller('DebtDetailController', function ($rootScope, $scope, $state, $stateParams, facebookService, userService, debtService, Debt, DebtMapper) {
		var self = {};


		self.formDebt = {
			isCreditor: true,
			selectedFriend: null
		};

		self.init = function () {
			$scope.debt = angular.copy(self.formDebt);
			self.getFriends();
		};

		$scope.availableFriends = [{}];

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


		$scope.save = function (formDebt) {
			var debt, debtData, friendAppUser;

			if (!formDebt) { return; }

			formDebt = angular.extend(formDebt, $scope.debt);

			userService.findUserByFacebookId(formDebt.selectedFriend.id).then(function (appUser) {
				debtData = angular.copy(formDebt);
				debtData['_friend'] = appUser;
				debtData['_me'] = $rootScope.user;

				debt = DebtMapper.create(debtData);


				debtService.add(debt).then(function (response) {
					$scope.resetForm(formDebt);
					$state.go('tab.dash');
				}, function (error) {
					//...
				});
			}, function (error) {
				//...
			});
		};

		$scope.resetForm = function (formDebt) {
			if (!formDebt) { return; }
			$scope.debt = angular.copy(self.formDebt);
			formDebt.$setPristine();
		};


		$rootScope.$watchCollection('user.friends', function (newValue, oldValue) {
			if (newValue) { _fillFriendsSelect(newValue); }
		});



		$scope.isFormValid = function (formDebt) {
			return formDebt.$valid && $scope.debt.selectedFriend;
		}

		function _fillFriendsSelect(data) {
			$scope.availableFriends = data;
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
