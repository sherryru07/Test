sap.riv.module(
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'},
[

],
function Setup() {
	var class2type = {
		'[object Boolean]' : 'boolean',
		'[object Number]' : 'number',
		'[object String]' : 'string',
		'[object Function]' : 'function',
		'[object Array]' : 'array',
		'[object Date]' : 'date',
		'[object RegExp]' : 'regexp',
		'[object Object]' : 'object'
	};

	var hasOwn = Object.prototype.hasOwnProperty;
	// Used for trimming whitespace
	var rdigit = /\d/;

	var type = function(obj) {
		return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
	};

	/**
	 * Type Utilities for common variable type related tasks
	 * 
	 * @name sap.viz.base.utils.TypeUtils
	 * @class
	 */
	var typeUtils = {

		/**
	     * Returns a boolean value indicating whether the parameter is of type function
	     *
	     * @param {object}
	     * @returns {boolean}
	     */
		// See test/unit/core.js for details concerning isFunction.
		// Since version 1.3, DOM methods and functions like alert
		// aren't supported. They return false on IE (#2968).
		isFunction : function(obj) {
			return type(obj) === "function";
		},

		/**
	     * Returns a boolean value indicating whether the parameter is of type array
	     *
	     * @param {object}
	     * @returns {boolean}
	     */
		isArray : Array.isArray || function(obj) {
			return type(obj) === "array";
		},

		/**
	     * Returns a boolean value indicating whether the parameter is of type string
	     *
	     * @param {object}
	     * @returns {boolean}
	     */
		isString : function(obj) {
			return type(obj) === "string";
		},

		/**
	     * Returns a boolean value indicating whether the parameter is a non-empty string
	     *
	     * @param {object}
	     * @returns {boolean} 
	     */
		isNonEmptyString : function(obj) {
			return this.isString(obj) && obj.length !== 0;
		},

		/**
	     * Returns a boolean value indicating whether the parameter is an empty string
	     *
	     * @param {object}
	     * @returns {boolean} 
	     */
		isEmptyString : function(obj) {
			return this.isString(obj) && obj.length === 0;
		},

		/**
	     * Returns a boolean value indicating whether the parameter is NaN
	     *
	     * @param {object}
	     * @returns {boolean} 
	     */
		isNaN : function(obj) {
			return obj === null || obj === undefined || !rdigit.test(obj) || isNaN(obj);
		},

		/**
	     * Returns a boolean value indicating whether the parameter is a number
	     *
	     * @param {object}
	     * @returns {boolean} Caution: isNumber(Infinity) returns false.
	     */
		isNumber : function(n) {
			return !this.isNaN(parseFloat(n)) && isFinite(n);
		},

		/**
	     * Returns a boolean value indicating whether the parameter is defined
	     *
	     * @param {object}
	     * @returns {boolean} 
	     */
		isDefined : function(v) {
			return typeof (v) !== 'undefined';
		},

		/**
	     * Returns a boolean value indicating whether the parameter is undefined
	     *
	     * @param {object}
	     * @returns {boolean} 
	     */
		isUndefined : function(v) {
			return typeof (v) === 'undefined';
		},

		/**
	     * Returns a boolean value indicating whether the parameter is a plain object
	     *
	     * @param {object}
	     * @returns {boolean}
	     * Caution: A plain object is an object that has no prototype method and
	     *  no parent class. Null, undefined, DOM nodes and window object are not considered as plain object.
	     */
		isPlainObject : function(obj) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the
			// constructor property.
			// Make sure that DOM nodes and window objects don't pass through,
			// as well
			if (!obj || type(obj) !== "object" || obj.nodeType
					|| (obj && typeof obj === "object" && "setInterval" in obj)) {
				return false;
			}

			// Not own constructor property must be Object
			if (obj.constructor && !hasOwn.call(obj, "constructor")
					&& !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.

			var key;
			for (key in obj) {
			}

			return key === undefined || hasOwn.call(obj, key);
		},

		/**
	     * Returns a boolean value indicating whether the parameter is an empty object
	     *
	     * @param {object}
	     * @returns {boolean}
	     * Caution: An empty is a plain object without any properties.
	     */
		isEmptyObject : function(obj) {
			for ( var name in obj) {
				return false;
			}
			return this.isPlainObject(obj);
		},

		/**
	     * Returns a boolean value indicating whether the parameter is undefined or null
	     *
	     * @param {object}
	     * @returns {boolean}
	     */
		isExist : function(o) {
			if ((typeof (o) === 'undefined') || (o === null)) {
				return false;
			}
			return true;
		}
	};

	return typeUtils;
});