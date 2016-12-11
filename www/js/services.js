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


angular.module('pague-me.services', ['ngStorage', 'firebase'])
	.constant('firebaseConfig', {
		'url': "https://pague-me.firebaseio.com",
		'ref': function (path) { return firebase.database().ref(path); }
	})
	.service('firebaseAuthService', ['$rootScope', 'firebaseConfig', '$firebaseAuth', function ($rootScope, firebaseConfig, $firebaseAuth) {
		var self = this;
		var auth = $firebaseAuth();


		self.facebookSignIn = function () {
			var dfSignIn = auth.$signInWithPopup("facebook", { scope: "email,user_friends" });

			dfSignIn.then(function (firebaseUser) {
				var user = angular.extend(firebaseUser.user.toJSON(), { credential: firebaseUser.credential });

				$rootScope.$broadcast('auth.stateChanged', user);

				var a = [firebaseUser, auth.$getAuth()]

				//console.log(JSON.stringify(a));
			}).catch(function (error) {
				console.warn("Authentication failed:", error);
			});

			return dfSignIn;
		};

		self.signOut = function () {
			var dfSignOut;

			dfSignOut = auth.$signOut();


			dfSignOut.then(function (response) {
				$rootScope.$broadcast('auth.stateChanged', null);
			});

			return dfSignOut;
		};

		self.getCurrentUser = function () {
			return auth.$getAuth();
		};

		self.isUserSignedIn = function () {
			var authData = auth.$getAuth();

			return authData;
		};


		auth.$onAuthStateChanged(function (userContext) {
			//do something
		});

	}])
	.service('firebaseService', ['firebaseConfig', '$firebaseObject', '$firebaseArray', '$firebaseAuth', function (firebaseConfig, $firebaseObject, $firebaseArray, $firebaseAuth) {
		var self = this;
		//var ref = firebase.database().ref();
		//var $firebaseObject = $firebaseObject(ref);


		self.ref = function (path) {
			return firebaseConfig.ref(path);
		};

		self.query = function (ref) {
			ref = ref || firebaseConfig.ref();
			return $firebaseObject(ref);
		}

		self.queryObject = function (collectionName) {
			var ref = firebaseConfig.ref().child(collectionName);

			return $firebaseObject(ref);
		};

		self.queryCollection = function (collectionName) {
			var ref = firebaseConfig.ref().child(collectionName);

			return $firebaseArray(ref);
		};
	}])
	.service('facebookAuthService', ['ngFB', '$localStorage', '$firebaseAuth', 'firebaseAuthService', function (ngFB, $localStorage, $firebaseAuth, firebaseAuthService) {
		var self = this;
		var authData = null;

		self.login = function () {
			return ngFB.login({ scope: 'user_friends' })
		};

		self.logout = function () {
			return ngFB.logout();
		};

		self.getLoginStatus = function () {
			return ngFB.getLoginStatus().then(function (response) {
				if (response.status === 'connected') {
					// the user is logged in and has authenticated your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token 
					// and signed request each expire
					var uid = response.authResponse.userID;
					var accessToken = response.authResponse.accessToken;

				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facedebt, 
					// but has not authenticated your app
				} else {
					// the user isn't logged in to Facedebt.
				}

				console.debug(response.status);
			});
		};

		self.getAccessToken = function () {
			var user;

			user = JSON.parse(window.localStorage['user'] || '{}');

			return user.providerData.accessToken;
		};

	}])
	.service('facebookService', ['$q', '$http', '$localStorage', 'ngFB', 'facebookAuthService', function ($q, $http, $localStorage, ngFB, facebookAuthService) {
		var self = this;

		self.getProfile = function () {
			var df = $q.defer();

			$http.get("https://graph.facebook.com/v2.0/me?access_token=" + facebookAuthService.getAccessToken()).then(function (response) {
				df.resolve(response.data);
			}, function (err) {
				df.reject(err);
			});

			return df.promise;
		};

		self.getFriends = function () {
			var df = $q.defer();

			$http.get("https://graph.facebook.com/v2.0/me?fields=friends&access_token=" + facebookAuthService.getAccessToken()).then(function (response) {
				df.resolve(response.data);
			}, function (err) {
				df.reject(err);
			});

			return df.promise;
		};
	}])


	.factory("User", function () {
		function _mapFirebaseUserObject(firebaseUser) {
			var userData = {};

			userData = {
				uid: firebaseUser.uid,
				name: firebaseUser.displayName,
				email: firebaseUser.email,
				photoURL: firebaseUser.photoURL
			};

			return new User(userData);
		};


		function _mapFacebookUserObject(firebaseUser) {
			var userData = {}, providerData = angular.copy(firebaseUser.providerData[0]);



			userData = angular.extend(_mapFirebaseUserObject(firebaseUser), {
				name: providerData.displayName,
				email: providerData.email,
				photoURL: providerData.photoURL,
				providerData: angular.extend(providerData, firebaseUser.credential)
			});

			return new User(userData);
		};


		function User(data) {
			if (data) {
				this.setData(data);
			}
			// Some other initializations related to user
		};


		User.createFacebookUser = function (userData) {
			return _mapFacebookUserObject(userData);
		};

		User.prototype = {
			setData: function (data) {
				angular.extend(this, data);
			}
		};

		return User;
	})
	.factory('userService', ['$rootScope', '$q', '$localStorage', '$firebaseObject', '$firebaseArray', 'firebaseService', 'User', function ($rootScope, $q, $localStorage, $firebaseObject, $firebaseArray, firebaseService, User) {
		var self = {}, service = {};

		self.ref = 'users'

		self.users = [];

		self.init = function () {
			self.users = service.getUsers();
		};

		service.findUserByFacebookId = function (facebookId) {
			var deferred = $q.defer();
			var query = self.users.$ref().orderByChild('providerData/uid').equalTo(facebookId);

			// query by 'providerData/uid'
			query.once("value", function (dataSnapshot) {
				var appUser;
				if (dataSnapshot.exists()) {
					appUser = Object.values(dataSnapshot.val())[0];
					deferred.resolve(appUser);
				} else {
					deferred.reject("Not found");
				}
			});

			return deferred.promise;
		};


		service.getUsers = function () {
			return firebaseService.queryCollection('users');
		};

		service.addUser = function (user) {
			var usersSet = self.users.$ref().child(user.uid)

			usersSet.set(user).then(function (response) {
				console.debug(response);
			});
		};

		service.removeUser = function (user) {
			self.users.$remove(user);
		};


		$rootScope.$on('auth.stateChanged', function (event, user) {
			if (user) {
				var appUser = User.createFacebookUser(user);

				$rootScope.user = appUser;
				$localStorage.user = JSON.stringify(appUser);
				window.localStorage['user'] = JSON.stringify(appUser);

				service.addUser(appUser);
			} else {
				$rootScope.user = null;
				delete $localStorage.user;
				delete window.localStorage['user'];
			}
		});


		self.init();

		return service;
	}])

	.factory('debtService', ['$q', 'firebaseService', '$firebaseArray', 'userService', 'Debt', function ($q, firebaseService, $firebaseArray, userService, Debt) {
		var self = {}, service = {};

		self.ref = 'debts';
		self.debts = [];

		self.init = function () {
			self.debts = self.getDebts();
		};


		self.findDebtsByCreditor = function (user_id) {
			return _findDebtsByProperty('creditor/uid', user_id);
		};

		self.findDebtsByDebitor = function (user_id) {
			return _findDebtsByProperty('debitor/uid', user_id);
		};

		self.getDebts = function () {
			return firebaseService.queryCollection('debts');
		};



		service.get = function (item_id) {
			var debt;

			debt = self.debts.$getRecord(item_id);

			return debt;
		};

		service.save = function (item) {
			var debt, promise;

			debt = self.debts.$getRecord(item.id); // retrieves record
			angular.extend(debt, item); // attach changes
			promise = self.debts.$save(debt); // save in firebase

			return promise;
		};

		service.add = function (item) {
			var deffered = self.debts.$add(item);

			deffered.then(function (response) {
				console.debug(response);
			}, function (response) {
				console.debug(response);
			});

			return deffered;
		};

		service.remove = function (item) {
			self.debts.$remove(item);
		};


		service.getUserDebts = function (user_id) {
			var userDebts = [], creditors, debitors;

			//creditors = self.debts.$ref().orderByChild("creditor").equalTo(user_id);
			//debitors = self.debts.$ref().orderByChild("debitor").equalTo(user_id);

			return userDebts.concat(creditors || [], debitors || []);
		};

		service.findDebtsByUser = function (user_id) {
			var deferred = $q.defer(), promise, queue;

			queue = [self.findDebtsByCreditor(user_id), self.findDebtsByDebitor(user_id)];
			promise = $q.all(queue);


			promise.then(function (response) {
				var result = angular.extend({}, response[0], response[1]);
				deferred.resolve(result)
			}, function (error) {
				deferred.reject(error)
			});

			return deferred.promise;
		};


		function _findDebtsByProperty(property, user_id) {
			var deferred = $q.defer();
			var query = self.debts.$ref().orderByChild(property).equalTo(user_id);


			// query by 'providerData/uid'
			query.once("value", function (dataSnapshot) {
				var debts = {};
				if (dataSnapshot.exists()) {
					var data = dataSnapshot.val();

					angular.forEach(data, function (item, key) {
						item.id = key;
						debts[key] = new Debt(item);
					});

					deferred.resolve(debts);
				} else {
					deferred.resolve([]);
				}
			});

			//TODO: return $firebaseArray(query).$loaded()


			return deferred.promise;
		};


		self.init();

		return service;
	}])
	.factory("Debt", function () {
		function Debt(debtData) {
			if (debtData) {
				this.setData(debtData);
			}
			// Some other initializations related to debt
		};

		Debt.prototype = {
			setData: function (debtData) {
				angular.extend(this, debtData);
			},
			createdAt: function () {
				return new Date(this._createdAt);
			},
			toJSON: function () {
				return angular.copy(this);
			}
		};

		return Debt;
	})


	.factory("DebtMapper", ['Debt', 'userService', function (Debt, userService) {
		Debt.create = function (data) {
			var debtData, debitor, creditor;


			if (data.isCreditor) {
				debitor = { uid: data['_friend'].uid, name: data['_friend'].name, photoURL: data['_me'].photoURL };
				creditor = { uid: data['_me'].uid, name: data['_me'].name, photoURL: data['_me'].photoURL };
			} else {
				debitor = { uid: data['_me'].uid, name: data['_me'].name, photoURL: data['_me'].photoURL };
				creditor = { uid: data['_friend'].uid, name: data['_friend'].name, photoURL: data['_me'].photoURL };
			}

			debtData = {
				value: data.value,
				notes: data.notes,
				creditor: creditor,
				debitor: debitor,
				pending: data.isCreditor ? true : false
			};



			return new Debt(debtData);
		};

		return Debt;
	}])

	.filter('pending', function () {
		return function (source, isPending) {
			if (!source) return source;

			var result = [];

			angular.forEach(source, function (value, i) {
				if (isPending == value.pending) {
					result.push(value);
				}
			});

			return result;
		}
	})
	.filter('debitors', function () {
		return function (source, search) {
			if (!source) return source;
			if (!search) return source;

			var result = {};

			angular.forEach(source, function (value, key) {
				if (value.debitor.uid == search) {
					result[key] = value;
				}
			});

			return result;
		}
	})
	.filter('creditors', function () {
		return function (source, search) {
			if (!source) return source;
			if (!search) return source;

			var result = {};

			angular.forEach(source, function (value, key) {
				if (value.creditor.uid == search) {
					result[key] = value;
				}
			});

			return result;
		}
	})
	.filter('debtFilter', function () {
		function _filter(source, search) {
			if (!source) { return source; }

			var result = [], defaultFilters;

			//default filter setting
			defaultFilters = {
				pending: false,
				paid: false,
				refusedAt: null
			};

			search = angular.extend({}, defaultFilters, search);

			angular.forEach(source, function (value, key) {
				var isFiltered = true;

				for (var x in search) {
					if (value.hasOwnProperty(x)) {
						var isEqual = false;

						// handle specific properties or simply compare
						switch (x) {
							case 'creditor':
							case 'debitor':
								isEqual = value[x].uid == search[x];
								break;
							default:
								isEqual = value[x] == search[x];
								break;
						};

						isFiltered = isFiltered && isEqual;

						if (!isEqual) {
							break;
						} //exit loop if filter not passed
					}
				}

				if (isFiltered) {
					result.push(value); // add item to filterd result
				}
			});

			return result;
		};

		return _filter;
	});