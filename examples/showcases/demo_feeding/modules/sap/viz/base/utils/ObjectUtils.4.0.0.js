sap.riv.module(
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils, FuncUtils) {
	var emptyFn = function(){};
	var trimLeft = /^\s+/, trimRight = /\s+$/,
	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/, rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

	var trim = trim ? function(text) {
		return text == null ? "" : trim.call(text);
	} :
	// Otherwise use our own trimming functionality
	function(text) {
		return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
	};

	/**
	 * OO static utilities
	 * 
	 * @name sap.viz.base.utils.ObjectUtils
	 * @class
	 */
	var objUtils = {
		uuid : function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
		},
		
		proxy : function(fn, proxy, thisObject) {
			if (arguments.length === 2) {
				if (typeof proxy === "string") {
					thisObject = fn;
					fn = thisObject[proxy];
					proxy = undefined;

				} else if (proxy && !TypeUtils.isFunction(proxy)) {
					thisObject = proxy;
					proxy = undefined;
				}
			}

			if (!proxy && fn) {
				proxy = function() {
					return fn.apply(thisObject || this, arguments);
				};
			}
			// So proxy can be declared as an argument
			return proxy;
		},

		// Copy from jQuery
		extend : function() {
			var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

			// Handle a deep copy situation
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			}

			// Handle case when target is a string or something (possible in
			// deep
			// copy)
			if (typeof target !== "object" && !TypeUtils.isFunction(target)) {
				target = {};
			}

			// extend jQuery itself if only one argument is passed
			if (length === i) {
				target = this;
				--i;
			}

			for (; i < length; i++) {
				// Only deal with non-null/undefined values
				if ((options = arguments[i]) != null) {
					// Extend the base object
					for (name in options) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (TypeUtils.isPlainObject(copy) || (copyIsArray = TypeUtils.isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && TypeUtils.isArray(src) ? src : [];

							} else {
								clone = src && TypeUtils.isPlainObject(src) ? src : {};
							}
							// Never move original objects, clone them
							target[name] = objUtils.extend(deep, clone, copy);
							// Don't bring in undefined values
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
			// Return the modified object
			return target;
		},

		// args is for internal usage only
		each : function(object, callback, args) {
			var name, i = 0, length = object.length, isObj = length === undefined || TypeUtils.isFunction(object);

			if (args) {
				if (isObj) {
					for (name in object) {
						if (callback.apply(object[name], args) === false) {
							break;
						}
					}
				} else {
					for (; i < length;) {
						if (callback.apply(object[i++], args) === false) {
							break;
						}
					}
				}

				// A special, fast, case for the most common use of each
			} else {
				if (isObj) {
					for (name in object) {
						if (callback.call(object[name], name, object[name]) === false) {
							break;
						}
					}
				} else {
					for ( var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {
					}
				}
			}
			return object;
		},

		parseJSON : function(data) {
			if (typeof data !== "string" || !data) {
				return null;
			}

			// Make sure leading/trailing whitespace is removed (IE can't handle
			// it)
			data = trim(data);

			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {

				// Try to use the native JSON parser first
				return window && window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return "
						+ data))();

			} else {
				TypeUtils.error("Invalid JSON: " + data);
			}
		},

		/**
		 * make the subclass derived from passed-in superclass, the superclass's
		 * constructor will be automatically called.
		 * 
		 * @name sap.viz.base.utils.ObjectUtils.derive
		 * @function
		 * @param {Function}
		 *            subcls constructor of subclass or baseclass to extend
		 * @param {Function}
		 *            supercls or overide constructor of superclass, or object
		 *            literals to overide
		 * @return {Function} the constructor of the derived class with some
		 *         additional field: 'clazz' points to current constructor,
		 *         superclazz points to superclass' constructor. superclass in
		 *         prototype points to superclass's prototype
		 */
		derive : function(subcls, supercls) {
			var ret;
			var retp;
			if (typeof subcls === 'function') {
				if (typeof supercls === 'function') {
					if (supercls.prototype.constructor == Object.prototype.constructor) {
						supercls.prototype.constructor = supercls;
					}
					emptyFn.prototype = supercls.prototype;
					var h = new emptyFn();
					var sbp = subcls.prototype;
					for (var p in sbp) {
						if (sbp.hasOwnProperty(p)) {
							h[p] = sbp[p];
						}
					}
					ret = FuncUtils.createCallChain(supercls, subcls);
					retp = ret.prototype = h;
					retp.constructor = ret;
					retp.superclass = supercls.prototype;
					retp.callParent = (function() {
						var stack = [];
						return function() {
							var funcName = arguments[0];
							if (!stack.length) {
								stack.push({
									funcName : funcName,
									thisObj : this,
									level : 0
								});
							} else if (stack[stack.length - 1].funcName !== funcName
									|| stack[stack.length - 1].thisObj !== this) {
								stack.push({
									funcName : funcName,
									thisObj : this,
									level : 0
								});
							}

							var skip = stack[stack.length - 1].level;
							var currentProto = this.superclass;
							while (skip--) {
								currentProto = currentProto.superclass;
							}
							stack[stack.length - 1].level++;
							var args = [];
							for ( var i = 1; i < arguments.length; i++) {
								args.push(arguments[i]);
							}
							currentProto[funcName].apply(stack[stack.length - 1].thisObj, args);
							stack[stack.length - 1].level--;
							if (!stack[stack.length - 1].level) {
								stack.pop();
							}
						};
					})();
					ret.superclazz = supercls;
					return ret;
				} else if (typeof supercls === 'object') {
					var basecls = subcls;
					var mixin = supercls;
					var bcp = basecls.prototype;

					emptyFn.prototype = bcp;
					var h = new emptyFn();
					ret = FuncUtils.createCallChain(basecls, mixin.constructor);
					retp = ret.prototype = h;
					for (p in mixin) {
						if (mixin.hasOwnProperty(p)) {
							retp[p] = mixin[p];
						}
					}
					retp.constructor = ret;
					retp.superclass = basecls.prototype;
					retp.callParent = (function() {
						var stack = [];
						return function() {
							var funcName = arguments[0];
							if (!stack.length) {
								stack.push({
									funcName : funcName,
									thisObj : this,
									level : 0
								});
							} else if (stack[stack.length - 1].funcName !== funcName
									|| stack[stack.length - 1].thisObj !== this) {
								stack.push({
									funcName : funcName,
									thisObj : this,
									level : 0
								});
							}

							var skip = stack[stack.length - 1].level;
							var currentProto = this.superclass;
							while (skip--) {
								currentProto = currentProto.superclass;
							}
							stack[stack.length - 1].level++;
							var args = [];
							for ( var i = 1; i < arguments.length; i++) {
								args.push(arguments[i]);
							}
							currentProto[funcName].apply(stack[stack.length - 1].thisObj, args);
							stack[stack.length - 1].level--;
							if (!stack[stack.length - 1].level) {
								stack.pop();
							}
						};
					})();
					ret.superclazz = basecls;
				}
			}
			return ret;
		}
	};
	return objUtils;
});