angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('DashCtrl', function ($scope) { })

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
})

.controller('AccountCtrl', function ($scope) {
	$scope.settings = {
		enableFriends: true
	};
})

.controller('LoginController', function ($scope, $state, $ionicModal, $timeout, ngFB) {
	//This method is executed when the user press the "Login with facebook" button
	$scope.facebookSignIn = function () {
		ngFB.login().then(
        function (response) {
        	if (response.status === 'connected') {
        		console.log('Facebook login succeeded');
        		//$scope.closeLogin();
        		$state.go('tab.profile');
        	} else {
        		alert('Facebook login failed');
        	}
        });
	};
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
});
