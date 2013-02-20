sap.riv.module(
{
  qname : 'sap.viz.base.Math',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
}
],
function Setup(UADetector) {
    var OptMath = {
        PI : Math.PI,
        E : Math.E,
        LN10 : Math.LN10,
        LN2 : Math.LN2,
        LOG2E : Math.LOG2E,
        LOG10E : Math.LOG10E,
        SQRT1_2 : Math.SQRT1_2,
        SQRT2 : Math.SQRT2,

        abs : (function() {
            if(UADetector.isSafari() || (UADetector.isIE() && parseFloat(UADetector.version()) < 9)) {
                return function(n) {
                    return n < 0 ? -n : n;
                };
            } else {
                return Math.abs;
            }
        })(),

        acos : (function() {
            return Math.acos;
        })(),

        asin : (function() {
            return Math.asin;
        })(),

        atan : (function() {
            return Math.atan;
        })(),

        atan2 : (function() {
            return Math.atan2;
        })(),

        /**
         * Get the ceil of a number.
         *
         * @name sap.viz.base.Math#ceil
         * @function
         * @param {n}
         *            n must not be NaN
         * @returns {Number} the ceil of number
         */
        ceil : (function() {
            // if (UADetector.isFirefox()) {
            // return function(n) {
            // var i = n | 0;
            // return n <= 0 ? i : (i == n ? i : i + 1);
            // };
            // }
            // else if (UADetector.isChrome()) {
            // return function(n) {
            // return n <= 0 ? n | 0 : Math.ceil(n);
            // };
            // }
            // else {
            return Math.ceil;
            // }
        })(),

        cos : (function() {
            return Math.cos;
        })(),

        exp : (function() {
            return Math.exp;
        })(),

        /**
         * Get the floor of a number.
         *
         * @name sap.viz.base.Math#floor
         * @function
         * @param {n}
         *            n must not be NaN
         * @returns {Number} the floor of number
         */
        floor : (function() {
            // if(UADetector.isFirefox()) {
            // return function(n) {
            // var a = n | 0;
            // return n < 0 ? (a == n ? a : a - 1) : a;
            // };
            // } else
            return Math.floor;
        })(),

        log : (function() {
            return Math.log;
        })(),

        /**
         * Get the maximum number in an array.
         *
         * @name sap.viz.base.Math#max
         * @function
         * @param {array}
         *            array must be an array of Number
         * @returns {Number} the maximum number in array
         */
        max : (function() {
            // if(UADetector.isIE() && parseFloat(UADetector.version()) < 9) {
                return Math.max;
            // } else
                // return function() {
                    // var max = arguments[0];
                    // var length = arguments.length;
                    // for(var i = 1; i < length; i++) {
                        // max = arguments[i] > max ? arguments[i] : max;
                    // }
                    // return max;
                // };
        })(),

        /**
         * Get the minimum number in an array.
         *
         * @name sap.viz.base.Math#min
         * @function
         * @param {array}
         *            array must be an array of Number
         * @returns {Number} the minimum number in array
         */
        min : (function() {
            // if(UADetector.isIE() && parseFloat(UADetector.version()) < 9) {
                return Math.min;
			// }
			// else return function(){
		        // var min = arguments[0];
		        // var length = arguments.length;
				// for (var i=1; i<length; i++){
					// min = arguments[i] > min ? min : arguments[i];
				// }
				// return min;
            // };
        })(),

        pow : (function() {
            return Math.pow;
        })(),

        random : (function() {
            return Math.random;
        })(),

        /**
         * Get the round of a number.
         *
         * @name sap.viz.base.Math#round
         * @function
         * @param {n}
         *            n must not be NaN
         * @returns {Number} the round of number
         */
        round : (function() {
            return Math.round;
            //			if(UADetector.isFirefox() || (UADetector.isIE() && parseFloat(UADetector.version()) < 9)){
            //				return function(n) {
            //					return (n >= 0) ? (n + 0.5) | 0 : (n - 0.4999999999999999) | 0;
            //				};
            //			}
            //			else if(UADetector.isChrome()){
            //				return function(n) {
            //					return Math.floor(n + 0.5);
            //				};
            //			}
            //			else return Math.round;
        })(),

        sin : (function() {
            return Math.sin;
        })(),

        sqrt : (function() {
            return Math.sqrt;
        })(),

        tan : (function() {
            return Math.tan;
        })()
    };
    return OptMath;
});