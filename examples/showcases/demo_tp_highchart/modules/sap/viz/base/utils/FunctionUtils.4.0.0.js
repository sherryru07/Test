sap.riv.module(
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils) {
	var msgparas = /\{(\d+)\}/g;

	var emptyFn = function() {
	};

	var funcUtils = {
		/**
		 * empty function
		 * 
		 * @name sap.viz.base.utils.FunctionUtils#noop
		 * @function
		 */
		noop : emptyFn,

		/**
		 * function throwing unsupported exception
		 * 
		 * @name sap.viz.base.utils.FunctionUtils#unsupported
		 * @function
		 */
		unsupported : function() {
			throw new Error('Unsupported function!');
		},

		/**
		 * function throwing unimplemented exception
		 * 
		 * @name sap.viz.base.utils.FunctionUtils#unimplemented
		 * @function
		 */
		unimplemented : function() {
			throw new Error('Unimplemented function!');
		},

		/**
		 * function throwing error
		 * 
		 * @name sap.viz.base.utils.FunctionUtils#error
		 * @param {String}
		 *            msg the error message
		 * @function
		 */
		error : function(msg) {
			var args = arguments;
			if (args[0]) {
				var msg = args[0].replace(msgparas, function(m, n) {
					return args[parseInt(n) + 1];
				});
				throw msg;
			} else {
				throw 'unknown error!';
			}
		},

		createCallChain : function() {
			var len = arguments.length;
			if (len > 1) {
				var callChain = [];
				for ( var i = 0; i < len; i++) {
					if (TypeUtils.isFunction(arguments[i])) {
						callChain.push(arguments[i]);
					} else {
						funcUtils.error('Could not create call chain for non-function object');
					}
				}
				return (function() {
					for ( var i = 0; i < len; i++) {
						callChain[i].apply(this, arguments);
					}
				});
			} else {
				return TypeUtils.isFunction(arguments[0]) ? arguments[0] : emptyFn;
			}
		}
	};

	return funcUtils;
});