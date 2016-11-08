/// <reference path="../typings/firebase/firebase.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
var _ = {
    indexKey: function () {
        return '~~';
    },
    /**
     * Detects whether it is a node enviroment
     * @return {boolean}
     */
    isCommonJS: function () {
        return typeof module != 'undefined';
    },
    /**
     * Detects whether a value is a string
     * @param {any} value The possible string
     * @return {boolean}
     */
    isString: function (value) {
        return typeof value === 'string' || value instanceof String;
    },
    /**
     * Detects whether a value is an object
     * @param {any} value The possible object
     * @return {boolean}
     */
    isObject: function (value) {
        return value !== null && typeof value === 'object';
    },
    /**
     * Detects whether a string array has more than one key
     * @param {string[]} criteriaKeys The array of keys
     * @return {boolean}
     */
    hasMultipleCriteria: function (criteriaKeys) {
        return criteriaKeys.length > 1;
    },
    /**
     * Creates the key pattern for index properties
     * @param {string} propOne
     * @param {string} propTwo
     * @return {string}
     */
    createKey: function (propOne, propTwo) {
        return "" + propOne + _.indexKey() + propTwo;
    },
    /**
     * Retrieves the Firebase path, minus the full URL,
     * from a Firebase Reference
     * @param {Firebase} ref
     * @return {string}
     */
    getPathFromRef: function (ref) {
        var PATH_POSITION = 3;
        var pathArray = ref.toString().split('/');
        return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
    },
    /**
     * Merges two objects into one
     * @param {object} obj1
     * @param {object} obj2
     * @return {object}
     */
    merge: function (obj1, obj2) {
        var mergedHash = {};
        for (var prop in obj1) {
            mergedHash[prop] = obj1[prop];
        }
        for (var prop in obj2) {
            mergedHash[prop] = obj2[prop];
        }
        return mergedHash;
    },
    /**
     * Returns an array of keys for an object
     * @param {object} obj
     * @return {string[]}
     */
    keys: function (obj) {
        return Object.keys(obj);
    },
    /**
     * Returns an array of values for an object
     * @param {object} obj
     * @return {any[]}
     */
    values: function (obj) {
        return Object.keys(obj).map(function (key) { return obj[key]; });
    },
    /**
     * Universal base64 encode method
     * @param {string} data
     * @return {string}
     */
    encodeBase64: function (data) {
        if (this.isCommonJS()) {
            return new Buffer(data).toString('base64');
        }
        else {
            /* istanbul ignore next */
            return window.btoa(data);
        }
    },
    /**
     * Universal base64 decode method
     * @param {string} data
     * @return {string}
     */
    decodeBase64: function (encoded) {
        if (this.isCommonJS()) {
            return new Buffer(encoded, 'base64').toString('ascii');
        }
        else {
            return window.atob(encoded);
        }
    },
    /**
     * Creates an object from a keys array and a values array.
     * @param {any[]} keys
     * @param {any[]} values
     * @return {Object}
     * @example
     *  const keys = ['name', 'age'];
     *  const values = ['David', '27'];
     *  const object = _.arraysToObject(keys, value); // { name: 'David', age: '27' }
     */
    arraysToObject: function (keys, values) {
        var indexHash = {};
        var count = 0;
        keys.forEach(function (key) {
            var value = values[count];
            indexHash[key] = value;
            count++;
        });
        return indexHash;
    },
    /**
     * A function for lexicographically comparing keys. Used for
     * array sort methods.
     * @param {string} a
     * @param {string} b
     * @return {number}
     */
    lexicographicallySort: function (a, b) {
        return a.localeCompare(b);
    },
    /**
     * Creates an object with the key name and position in an array
     * @param {string[]} arr
     * @return {Object}
     * @example
     *  const keys = ['name', 'age', 'location'];
     *  const indexKeys = _.getKeyIndexPositions(keys);
     *    => { name: 0, age: 1, location: 2 }
     */
    getKeyIndexPositions: function (arr) {
        var indexOfKeys = {};
        arr.forEach(function (key, index) { return indexOfKeys[key] = index; });
        return indexOfKeys;
    },
    /**
     * Creates an object whose keys are lexicographically sorted
     * @param {string[]} keys
     * @param {any[]} values
     * @return {Object}
     * @example
     *  const keys = ['name', 'age', 'location'];
     *  const values = ['David', '28', 'SF'];
     *  const sortedObj = _.createSortedObject(keys, values);
     *    => { age: '28', location: 'SF', name: 'David' }
     */
    createSortedObject: function (keys, values) {
        var sortedRecord = {};
        var indexOfKeys = this.getKeyIndexPositions(keys);
        var sortedKeys = keys.sort(this.lexicographicallySort);
        sortedKeys.forEach(function (key) {
            var index = indexOfKeys[key];
            sortedRecord[key] = values[index];
        });
        return sortedRecord;
    },
    /**
     * Creates an object whose keys are lexicographically sorted
     * @param {obj} Object
     * @return {Object}
     * @example
     *  const record = { name: 'David', age: '28', location: 'SF' };
     *  const sortedObj = _.sortObjectLexicographically(record);
     *    => { age: '28', location: 'SF', name: 'David' }
     */
    sortObjectLexicographically: function (obj) {
        var keys = this.keys(obj);
        var values = this.values(obj);
        return this.createSortedObject(keys, values);
    }
};
/**
 * Querybase - Provides composite keys and a simplified query API.
 *
 * @param {Firebase} ref
 * @param {indexOn} string[]
 *
 * @example
 *  // Querybase for multiple equivalency
 *  const firebaseRef = firebase.database.ref().child('people');
 *  const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
 *
 *  // Automatically handles composite keys
 *  querybaseRef.push({
 *    name: 'David',
 *    age: 27
 *  });
 *
 *  const compositeRef = querybaseRef.where({
 *    name: 'David',
 *    age: 27
 *  })
 *  // .where() with multiple criteria returns a Firebase ref
 *  compositeRef.on('value', (snap) => console.log(snap.val());
 *
 *  // Querybase for single criteria, returns a Firebase Ref
 *  querybaseRef.where({ name: 'David'});
 *
 *  // Querybase for a single string criteria, returns
 *  // a QuerybaseQuery, which returns a Firebase Ref
 *  querybaseRef.where('name').startsWith('Da');
 *  querybaseRef.where('age').lessThan(30);
 *  querybaseRef.where('age').greaterThan(20);
 *  querybaseRef.where('age').between(20, 30);
 */
var Querybase = (function () {
    /**
     * The constructor provides the backing values
     * for the read-only properties
     */
    function Querybase(ref, indexOn) {
        var _this = this;
        this.INDEX_LENGTH = 3;
        // Check for constructor params and throw if not provided
        this._assertFirebaseRef(ref);
        this._assertIndexes(indexOn);
        this._assertIndexLength(indexOn);
        this.ref = function () { return ref; };
        this.indexOn = function () { return indexOn.sort(_.lexicographicallySort); };
        /* istanbul ignore next */
        this.key = this.ref().key;
        this.encodedKeys = function () { return _this.encodeKeys(_this.indexOn()); };
    }
    /**
     * Check for a Firebase Database reference. Throw an exception if not provided.
     * @parameter {Firebase}
     * @return {void}
     */
    Querybase.prototype._assertFirebaseRef = function (ref) {
        if (ref === null || ref === undefined || !ref.on) {
            throw new Error("No Firebase Database Reference provided in the Querybase constructor.");
        }
    };
    /**
     * Check for indexes. Throw an exception if not provided.
     * @param {string[]} indexes
     * @return {void}
     */
    Querybase.prototype._assertIndexes = function (indexes) {
        if (indexes === null || indexes === undefined) {
            throw new Error("No indexes provided in the Querybase constructor. Querybase uses the indexOn() getter to create the composite queries for the where() method.");
        }
    };
    /**
     * Check for indexes length. Throw and exception if greater than the INDEX_LENGTH value.
     * @param {string[]} indexes
     * @return {void}
     */
    Querybase.prototype._assertIndexLength = function (indexes) {
        if (indexes.length > this.INDEX_LENGTH) {
            throw new Error("Querybase supports only " + this.INDEX_LENGTH + " indexes for multiple querying.");
        }
    };
    /**
     * Save data to the realtime database with composite keys
     * @param {any} data
     * @return {void}
     */
    Querybase.prototype.set = function (data) {
        var dataWithIndex = this.indexify(data);
        this.ref().set(dataWithIndex);
    };
    /**
     * Update data to the realtime database with composite keys
     * @param {any} data
     * @return {void}
     */
    Querybase.prototype.update = function (data) {
        var dataWithIndex = this.indexify(data);
        this.ref().update(dataWithIndex);
    };
    /**
     * Push a child node to the realtime database with composite keys, if
     * there is more than one property in the object
     * @param {any} data
     * @return {FirebaseRef}
     */
    Querybase.prototype.push = function (data) {
        // TODO: Should we return a Querybase with the option 
        // to specify child indexes?
        if (!data) {
            return this.ref().push();
        }
        // If there is only one key there's no need to indexify
        if (_.keys(data).length === 1) {
            return this.ref().push(data);
        }
        // Create indexes with indexed data values
        var dataWithIndex = this.indexify(data);
        // merge basic data with indexes with data
        var indexesAndData = _.merge(dataWithIndex, data);
        var firebaseRef = this.ref().push();
        firebaseRef.set(indexesAndData);
        return firebaseRef;
    };
    /**
     * Remove the current value from the Firebase reference
     * @return {void}
     */
    Querybase.prototype.remove = function () {
        return this.ref().remove();
    };
    /**
     * Create a child reference with a specified path and provide
     * specific indexes for the child path
     * @param {any} data
     * @return {FirebaseRef}
     */
    Querybase.prototype.child = function (path, indexOn) {
        return new Querybase(this.ref().child(path), indexOn);
    };
    /**
     * Creates a QueryPredicate based on the criteria object passed. It
     * combines the keys and values of the criteria object into a predicate
     * and value string respectively.
     * @param {Object} criteria
     * @return {FirebaseRef}
     */
    Querybase.prototype._createQueryPredicate = function (criteria) {
        // Sort provided object lexicographically to match keys in database
        var sortedCriteria = _.sortObjectLexicographically(criteria);
        // retrieve the keys and values array
        var keys = _.keys(sortedCriteria);
        var values = _.values(sortedCriteria);
        // warn about the indexes for indexOn rules
        this._warnAboutIndexOnRule();
        // for only one criteria in the object, use the key and vaue
        if (!_.hasMultipleCriteria(keys)) {
            return {
                predicate: keys[0],
                value: values[0]
            };
        }
        // for multiple criteria in the object, 
        // encode the keys and values provided
        var criteriaIndex = this.encodeKey(keys.join(_.indexKey()));
        var criteriaValues = this.encodeKey(values.join(_.indexKey()));
        return {
            predicate: criteriaIndex,
            value: criteriaValues
        };
    };
    /**
     * Creates an orderByChild() FirebaseQuery from a string criteria.
     * @param {string} stringCriteria
     * @return {QuerybaseQuery}
     */
    Querybase.prototype._createChildOrderedQuery = function (stringCriteria) {
        return new QuerybaseQuery(this.ref().orderByChild(stringCriteria));
    };
    /**
     * Creates an equalTo() FirebaseQuery from a QueryPredicate.
     * @param {Object} criteria
     * @return {FirebaseRef}
     */
    Querybase.prototype._createEqualToQuery = function (criteria) {
        return this.ref().orderByChild(criteria.predicate).equalTo(criteria.value);
    };
    /**
     * Find a set of records by a set of criteria or a string property.
     * Works with equivalency only.
     * @param {Object} criteria
     * @return {FirebaseRef}
     * @example
     *   // set of criteria
     *   const firebaseRef = firebase.database.ref.child('people');
     *   const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
     *   querybaseRef.where({
     *    name: 'David',
     *    age: 27
     *   }).on('value', (snap) => {});
     *
     *   // single criteria property
     *   querybaseRef.where({ name: 'David' }).on('value', (snap) => {});
     *
     *   // string property
     *   querybaseRef.where('age').between(20, 30).on('value', (snap) => {});
     */
    Querybase.prototype.where = function (criteria) {
        // for strings create a QuerybaseQuery for advanced querying
        if (_.isString(criteria)) {
            return this._createChildOrderedQuery(criteria);
        }
        // Create the query predicate to build the Firebase Query
        var queryPredicate = this._createQueryPredicate(criteria);
        return this._createEqualToQuery(queryPredicate);
    };
    /**
     * Creates a set of composite keys with composite data. Creates every
     * possible combination of keys with respecive combined values. Redudant
     * keys are not included ('name~~age' vs. 'age~~name').
     * @param {any[]} indexes
     * @param {Object} data
     * @param {Object?} indexHash for recursive check
     * @return {Object}
     * @example
     *  const indexes = ['name', 'age', 'location'];
     *  const data = { name: 'David', age: 27, location: 'SF' };
     *  const compositeKeys = _createCompositeIndex(indexes, data);
     *
     *  // compositeKeys
     *  {
     *    'name~~age': 'David~~27',
     *    'name~~age~~location': 'David~~27~~SF',
     *    'name~~location': 'David~~SF',
     *    'age~~location': '27~~SF'
     *  }
     */
    Querybase.prototype._createCompositeIndex = function (indexes, data, indexHash) {
        if (!Array.isArray(indexes)) {
            throw new Error("_createCompositeIndex expects an array for the first parameter: found " + indexes.toString());
        }
        if (indexes.length === 0) {
            throw new Error("_createCompositeIndex expect an array with multiple elements for the first parameter. Found an array with length of " + indexes.length);
        }
        if (!_.isObject(data)) {
            throw new Error("_createCompositeIndex expects an object for the second parameter: found " + data.toString());
        }
        // create a copy of the array to not modifiy the original properties
        var propCop = indexes.slice();
        // remove the first property, this ensures no 
        // redundant keys are created (age~~name vs. name~~age)
        var mainProp = propCop.shift();
        // recursive check for the indexHash
        indexHash = indexHash || {};
        propCop.forEach(function (prop) {
            var propString = "";
            var valueString = "";
            // first level keys
            // ex: ['name', 'age', 'location']
            // -> 'name~~age'
            // -> 'name~~location'
            // -> 'age~~location'
            indexHash[_.createKey(mainProp, prop)] =
                _.createKey(data[mainProp], data[prop]);
            // create indexes for all property combinations
            // ex: ['name', 'age', 'location']
            //  -> 'name~~age~~location'
            propCop.forEach(function (subProp) {
                propString = _.createKey(propString, subProp);
                valueString = _.createKey(valueString, data[subProp]);
            });
            indexHash[mainProp + propString] = data[mainProp] + valueString;
        });
        // recursive check
        if (propCop.length !== 0) {
            this._createCompositeIndex(propCop, data, indexHash);
        }
        return indexHash;
    };
    /**
     * Encode (base64) all keys and data to avoid collisions with the
     * chosen Querybase delimiter key (_)
     * @param {Object} indexWithData
     * @return {Object}
     */
    Querybase.prototype._encodeCompositeIndex = function (indexWithData) {
        if (!_.isObject(indexWithData)) {
            throw new Error("_encodeCompositeIndex expects an object: found " + indexWithData.toString());
        }
        var values = _.values(indexWithData);
        var keys = _.keys(indexWithData);
        var encodedValues = this.encodeKeys(values);
        var encodedKeys = this.encodeKeys(keys);
        return _.arraysToObject(encodedKeys, encodedValues);
    };
    /**
     * Encode (base64) all keys and data to avoid collisions with the
     * chosen Querybase delimiter key (~~)
     * @param {Object} indexWithData
     * @return {Object}
     */
    Querybase.prototype.indexify = function (data) {
        var compositeIndex = this._createCompositeIndex(this.indexOn(), data);
        var encodedIndexes = this._encodeCompositeIndex(compositeIndex);
        return encodedIndexes;
    };
    /**
     * Encode (base64) a single key with the Querybase format
     * @param {string} value
     * @return {string}
     */
    Querybase.prototype.encodeKey = function (value) {
        return ("querybase" + _.indexKey()) + _.encodeBase64(value);
    };
    /**
     * Encode (base64) a set of keys with the Querybase format
     * @param {string[]} values
     * @return {string}
     */
    Querybase.prototype.encodeKeys = function (values) {
        var _this = this;
        return values.map(function (value) { return _this.encodeKey(value); });
    };
    /**
     * Print a warning to the console about using "._indexOn" rules for
     * the generated keys. This warning has a copy-and-pastable security rule
     * based upon the keys provided.
     * @param {string} value
     * @return {void}
     */
    Querybase.prototype._warnAboutIndexOnRule = function () {
        var indexKeys = this.encodedKeys();
        var _indexOnRule = "\n\"" + _.getPathFromRef(this.ref()) + "\": {\n  \"._indexOn\": [" + _.keys(indexKeys).map(function (key) { return "\"" + indexKeys[key] + "\""; }).join(", ") + "]\n}";
        console.warn("Add this rule to drastically improve performance of your Realtime Database queries: \n " + _indexOnRule);
    };
    return Querybase;
}());
/**
 * QuerybaseQuery - Provides a simple querying API
 *
 * A QuerybaseQuery is created through using a string criteria
 * on a Querybase reference. It is not meant to be directly created.
 *
 * @param {FirebaseQuery} query
 *
 * @example
 *  const firebaseRef = firebase.database.ref.child('people');
 *  const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
 *
 *  // Querybase for a single string criteria, returns
 *  // a QuerybaseQuery, which returns a Firebase Ref
 *  querybaseRef.where('name').startsWith('Da');
 *  querybaseRef.where('age').lessThan(30);
 *  querybaseRef.where('locaton').equalTo('SF');
 *  querybaseRef.where('age').greaterThan(20);
 *  querybaseRef.where('age').between(20, 30);
 */
var QuerybaseQuery = (function () {
    function QuerybaseQuery(query) {
        this.query = function () { return query; };
    }
    /**
     * Find a set of records smaller than the provided value.
     * @param {any} value
     * @return {FirebaseQuery}
     */
    QuerybaseQuery.prototype.lessThan = function (value) {
        return this.query().endAt(value);
    };
    /**
     * Find a set of records larger than the provided value.
     * @param {any} value
     * @return {FirebaseQuery}
     */
    QuerybaseQuery.prototype.greaterThan = function (value) {
        return this.query().startAt(value);
    };
    /**
     * Find a set of records the same as the provided value.
     * @param {any} value
     * @return {FirebaseQuery}
     */
    QuerybaseQuery.prototype.equalTo = function (value) {
        return this.query().equalTo(value);
    };
    /**
     * Find a set of records that begins with the provided value.
     * @param {string} value
     * @return {FirebaseQuery}
     */
    QuerybaseQuery.prototype.startsWith = function (value) {
        var firstChar = value.substr(0, 1);
        return this.query().startAt(firstChar).endAt(value + "\uF8FF");
    };
    /**
     * Find a set of records between the provided values.
     * @param {string} value
     * @return {FirebaseQuery}
     */
    QuerybaseQuery.prototype.between = function (valueOne, valueTwo) {
        return this.query().startAt(valueOne).endAt(valueTwo);
    };
    return QuerybaseQuery;
}());
var querybaseExport = {
    ref: function (ref, indexes) {
        return new Querybase(ref, indexes);
    }
};
// Export the modules for the current environment
if (_.isCommonJS()) {
    module.exports = querybaseExport;
    module.exports.Querybase = Querybase;
    module.exports.QuerybaseUtils = _;
    module.exports.QuerybaseQuery = QuerybaseQuery;
}
else {
    /* istanbul ignore next */
    window["querybase"] = querybaseExport;
    /* istanbul ignore next */
    window["querybase"]["Querybase"] = Querybase;
    /* istanbul ignore next */
    window["querybase"]["QuerybaseUtils"] = _;
    /* istanbul ignore next */
    window["querybase"]["QuerybaseQuery"] = QuerybaseQuery;
}
