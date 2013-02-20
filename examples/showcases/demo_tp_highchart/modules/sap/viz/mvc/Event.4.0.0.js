sap.riv.module(
{
  qname : 'sap.viz.mvc.Event',
  version : '4.0.0'},
[

],
function Setup() {
	/**
	 * Event class
	 * 
	 * @name sap.viz.mvc.Event
	 * @constructor
	 */
	var Event = function(type, target, canBubbling) {
		this._type = type;
		this._target = this._currentTarget = target;
		this._canBubbling = canBubbling !== undefined ? canBubbling : true;
		this._timestamp = +new Date;
	};

	var Ep = Event.prototype;

	Ep._setCurrentTarget_ = function(currentTarget) {
		this._currentTarget = currentTarget;
	};

	/**
	 * Get the type of the event
	 * 
	 * @name sap.viz.mvc.Event#type
	 * @function
	 * @returns {String}
	 */
	Ep.type = function() {
		return this._type;
	};

	/**
	 * Get the timestamp of the event
	 * 
	 * @name sap.viz.mvc.Event#timestamp
	 * @function
	 * @returns {Integer}
	 */
	Ep.timestamp = function() {
		return this._timestamp;
	};

	/**
	 * Get the target component the event is originated from
	 * 
	 * @name sap.viz.mvc.Event#target
	 * @function
	 * @returns {sap.viz.mvc.UIComponent}
	 */
	Ep.target = function() {
		return this._target;
	};

	/**
	 * Get the current target component the event is currently going through it
	 * can be different with the target component
	 * 
	 * @name sap.viz.mvc.Event#currentTarget
	 * @function
	 * @returns {sap.viz.mvc.UIComponent}
	 */
	Ep.currentTarget = function() {
		return this._currentTarget;
	};

	/**
	 * Whether the event is in the bubbling phase
	 * 
	 * @name sap.viz.mvc.Event#isInBubbling
	 * @function
	 * @returns {Boolean}
	 * 
	 */
	Ep.isInBubbling = function() {
		return this._target.id() != this._currentTarget.id();
	};
	/**
	 * Whether the event should be bubbled
	 * 
	 * @name sap.viz.mvc.Event#shouldBubble
	 * @function
	 * @returns {Boolean}
	 * 
	 */
	Ep.shouldBubble = function() {
		return this._canBubbling;
	};
	/**
	 * Stop the event propagation in the bubbling phase
	 * 
	 * @name sap.viz.mvc.Event#stopPropagation
	 * @function
	 * 
	 */
	Ep.stopPropagation = function() {
		this._canBubbling = false;
	};
	return Event;
});