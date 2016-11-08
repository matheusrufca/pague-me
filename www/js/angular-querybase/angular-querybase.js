/*--------------------------------------------------------------------------
 * https://github.com/davideast/Querybase
 *--------------------------------------------------------------------------*/
/** Angular Version **/

(function () {
	'use strict';

	angular.module('querybase', []);

	angular.module('querybase')
        .factory('$querybase', querybaseService);

	function querybaseService() {
		if (!window.querybase) {
			throw "Querybase not loaded";
		}

		return window.querybase;
	}
})();