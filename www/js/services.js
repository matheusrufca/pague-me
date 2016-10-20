angular.module('starter.services', ['ngOpenFB'])

.factory('Chats', function () {
	// Might use a resource here that returns a JSON array

	// Some fake testing data
	var chats = [{
		id: 0,
		name: 'Ben Sparrow',
		lastText: 'You on your way?',
		face: 'img/ben.png'
	}, {
		id: 1,
		name: 'Max Lynx',
		lastText: 'Hey, it\'s me',
		face: 'img/max.png'
	}, {
		id: 2,
		name: 'Adam Bradleyson',
		lastText: 'I should buy a boat',
		face: 'img/adam.jpg'
	}, {
		id: 3,
		name: 'Perry Governor',
		lastText: 'Look at my mukluks!',
		face: 'img/perry.png'
	}, {
		id: 4,
		name: 'Mike Harrington',
		lastText: 'This is wicked good ice cream.',
		face: 'img/mike.png'
	}];

	return {
		all: function () {
			return chats;
		},
		remove: function (chat) {
			chats.splice(chats.indexOf(chat), 1);
		},
		get: function (chatId) {
			for (var i = 0; i < chats.length; i++) {
				if (chats[i].id === parseInt(chatId)) {
					return chats[i];
				}
			}
			return null;
		}
	};
})
.service('facebookAuthService', ['ngFB', function (ngFB) {
	var self = this;

	self.login = function () {
		return ngFB.login({ scope: 'user_friends' })
	};

	self.logout = function () {
		return ngFB.logout();
	};

	self.getLoginStatus = function () {
		return ngFB.getLoginStatus(function (response) {
			if (response.status === 'connected') {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;
			} else if (response.status === 'not_authorized') {
				// the user is logged in to Facebook, 
				// but has not authenticated your app
			} else {
				// the user isn't logged in to Facebook.
			}
		});
	};
}])
.service('facebookService', ['ngFB', function (ngFB) {
	var self = this;

	self.getFriends = function () {
		return ngFB.api({
			path: '/me',
			params: { fields: 'friends' }
		});
	};
}]);


angular.module('dev', ['firebase'])
	.constant('firebaseConfig', {
		'url': "https://pague-me.firebaseio.com",
		//'ref': new Firebase("https://pague-me.firebaseio.com")
	})
	.service('firebaseAuthService', ['firebaseConfig', '$firebaseAuth', function (firebaseConfig, $firebaseAuth) {
		var self = this;
		var auth = $firebaseAuth();

		self.facebookSignIn = function () {
			var dfSignIn = auth.$signInWithPopup("facebook");

			dfSignIn.then(function (firebaseUser) {
				console.log("Signed in as:", firebaseUser.uid);
			}).catch(function (error) {
				console.log("Authentication failed:", error);
			});

			return dfSignIn;
		};
	}])
	.service('firebaseService', ['firebaseConfig', '$firebaseObject', '$firebaseArray', '$firebaseAuth', function (firebaseConfig, $firebaseObject, $firebaseArray, $firebaseAuth) {
		var self = this;
		//var ref = firebase.database().ref();
		//var $firebaseObject = $firebaseObject(ref);


		self.getCollection = function (collectionName) {
			var ref = firebase.database().ref().child(collectionName);

			return $firebaseArray(ref);
		};
	}]);




angular.module('pague-me.services', ['dev'])
	.service('usersService', ['firebaseService', function (firebaseService) {
		var self = this;

		function init() {
			self.users = firebaseService.getCollection('users');
		};



		self.getUsers = function () {
			self.users = firebaseService.getCollection('users');
			return users;
		};

		self.addUser = function (user) {
			self.users.$add(user);
		};

		self.removeUser = function (user) {
			self.users.$remove(user);
		};

		init();
	}]);



