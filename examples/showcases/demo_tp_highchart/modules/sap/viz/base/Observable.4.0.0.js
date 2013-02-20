sap.riv.module(
{
  qname : 'sap.viz.base.Observable',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(typeUtils) {
	/**
	 * To utilize observable object, You have to extend your object from it, and
	 * set the 'events' property as Array of event name to the constructor 
	 * 
	 * @name sap.viz.base.Observable
	 * @constructor
	 */
	var ob = function(option) {
		this._events = {};
		var cclazz = this.constructor;
		while (cclazz) {
			var events = cclazz.prototype.events, len;
			if (events) {
				len = events.length;
				while (len--) {
					this.addEvents(events[len]);
				}
			}
			cclazz = cclazz.superclazz;
		}
		if (option) {
			if (option.listeners) {
				this.addListeners(option.listeners);
				delete option.listeners;
			}
		}
	};

	var obp = ob.prototype;

	/**
	 * Add events that could be monitored
	 * 
	 * @name sap.viz.base.Observable#addEvents
	 * @function
	 * @parameter {String|String|...} event1,event2,event3... variable length
	 *            arguments of String
	 */
	obp.addEvents = function(/* event1, event2,...,eventn */) {
		var es = this._events, a = arguments, len = arguments.length;
		while (len--) {
			if (typeof a[len] === 'string') {
				es[a[len]] = es[a[len]] || [];
			}
		}
	};
	/**
	 * Get the supported events
	 * 
	 * @name sap.viz.base.Observable#getSupportedEvents
	 * @function
	 * @return {Array} an array of event names
	 */
	obp.getSupportedEvents = function() {
		var ret = [];
		for ( var e in this._events) {
			ret.push(e);
		}
		return ret;
	};
	/**
	 * Add event listeners
	 * 
	 * @name sap.viz.base.Observable#addListeners
	 * @function
	 * @param {Object|[Object]}
	 *            o single event listener or array of event listener
	 * @param {String}
	 *            o.eventName the event to be monitored
	 * @param {Function}
	 *            o.listener the function to be called back when event is fired
	 * @param {Object}
	 *            [o.scope] the scope in which the listener will be executed
	 * @param {Object}
	 *            [o.optionalArgs] the additional arguments that will be passed
	 *            in the listener
	 */
	obp.addListeners = function(o) {
		var ls;
		if (typeUtils.isArray(o)) {
			ls = o;
		} else {
			ls = [ o ];
		}
		var len = ls.length, l, en;
		var es = this._events;
		while (len--) {
			l = ls[len];
			en = l.eventName;
			if (es.hasOwnProperty(en)) {
				var lList = es[en];
				if (!this.isListening(en, l.listener, l.scope)) {
					lList[lList.length] = {
						fn : l.listener,
						scp : l.scope,
						optArgs : l.optionalArgs
					};
				}
			}
		}
		return this;
	};

	/**
	 * Find the listener that registered before
	 * 
	 * @name sap.viz.base.Observable#findListener
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @param {Function}
	 *            fn the listener to find
	 * @param {Object}
	 *            [scope] the scope in which the listener will be executed, same
	 *            listener function could be registered under different scope
	 *            for the same event.
	 * 
	 * 
	 * @returns {-1|Integer} returning -1 means not found otherwise return the
	 *          position order in which the listener to be invoked
	 */
	obp.findListener = function(eventName, fn, scope) {
		var es = this._events;
		if (!es.hasOwnProperty(eventName)) {
			return -1;
		}
		var lList = es[eventName], len = lList.length, lis;
		while (len--) {
			lis = lList[len];
			if (scope) {
				if (lis.fn == fn && lis.scp == scope) {
					return len;
				}
			} else {
				if (lis.fn == fn) {
					return len;
				}
			}
		}
		return -1;
	};
	/**
	 * Check whether the listener is listening on the event
	 * 
	 * @name sap.viz.base.Observable#isListening
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @param {Function}
	 *            fn the listener to find
	 * @param {Object}
	 *            [scope] the scope in which the listener will be executed, same
	 *            listener function could be registered under different scope
	 *            for the same event.
	 * @returns {Boolean}
	 */
	obp.isListening = function(eventName, fn, scope) {
		return this.findListener(eventName, fn, scope) > -1;
	};

	/**
	 * Remove the previous registered listener listening on the given event
	 * 
	 * @name sap.viz.base.Observable#removeListener
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @param {Function}
	 *            fn the listener to find
	 * @param {Object}
	 *            [scope] the scope in which the listener will be executed, same
	 *            listener function could be registered under different scope
	 *            for the same event.
	 * @returns {this} return the observable object itself
	 */
	obp.removeListener = function(eventName, fn, scope) {
		var es = this._events;
		if (es.hasOwnProperty(eventName)) {
			var lList = es[eventName];
			var len = lList.length, idx;
			while (len--) {
				idx = this.findListener(eventName, fn, scope);
				if (idx > -1) {
					lList.splice(idx, 1);
					len = lList.length;
				}
			}
		}
		return this;
	};

	/**
	 * Remove all the listeners currently watching the event
	 * 
	 * @name sap.viz.base.Observable#removeAllListeners
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @returns {this} return the observable object itself
	 */
	obp.removeAllListeners = function(eventName) {
		var es = this._events;
		if (es.hasOwnProperty(eventName)) {
			es[eventName] = [];
		}
		return this;
	};
	/**
	 * Check whether there is any listener watching the event
	 * 
	 * @name sap.viz.base.Observable#hasListener
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @returns {Boolean}
	 */
	obp.hasListener = function(eventName) {
		return this._events[eventName] && this._events[eventName].length > 0;
	};

	/**
	 * Purge all listeners registered on the observable object
	 * 
	 * @name sap.viz.base.Observable#purgeListeners
	 * @function
	 * @param {String}
	 *            eventName the eventName to which the listener is monitoring
	 * @returns {Boolean}
	 */
	obp.purgeListeners = function() {
		var es = this._events;
		for ( var e in es) {
			es[e] = [];
		}
	};

	/**
	 * Fire a event, with optional details attached
	 * 
	 * @name sap.viz.base.Observable#fireEvent
	 * @function
	 * @param {String}
	 *            eventName name of the event to be fired
	 * @param {Object}
	 *            details variable length arguments,var1, var2..varn, the
	 *            details to be passed in each listener call.
	 */
	obp.fireEvent = function(eventName /* details */) {
		var details = Array.prototype.slice.call(arguments, 1);
		var es = this._events;
		if (es.hasOwnProperty(eventName)) {
			var lList = es[eventName], l;
			for ( var i = 0, len = lList.length; i < len; i++) {
				l = lList[i];
				if (l.optArgs) {
					details.push(l.optArgs);
				}
				l.fn.apply(l.scp || this || window, details);
			}
		}
	};

	/**
	 * Same as addListeners
	 * 
	 * @name sap.viz.base.Observable#on
	 * @function
	 * @see sap.viz.base.Observable#addListeners
	 */
	obp.on = obp.addListeners;
	/**
	 * Same as removeListener
	 * 
	 * @name sap.viz.base.Observable#un
	 * @function
	 * @see sap.viz.base.Observable#removeListener
	 */
	obp.un = obp.removeListener;
	return ob;
});