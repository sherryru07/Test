sap.riv.module(
{
  qname : 'sap.viz.mvc.MouseEvent',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.Event',
  version : '4.0.0'
}
],
function Setup(ObjectUtils, Event) {
	/**
	 * This class defines Mouse Event
	 * 
	 * @name sap.viz.mvc.MouseEvent
	 * @class
	 * @augments sap.viz.mvc.Event
	 */
	var MouseEvent = ObjectUtils.derive(Event,
	/**
	 * @lends sap.viz.mvc.MouseEvent
	 * 
	 */
	{
		constructor : function(type, target, canBubbling, localXY, pageXY) {
			this._relatedTarget = undefined;
			this._currentLocalXY = this._targetLocalXY = localXY;
			this._pageXY = pageXY;
		},

		_setCurrentLocalXY_ : function(currentLocalXY) {
			this._currentLocalXY = currentLocalXY;
		},

		_setRelatedTarget_ : function(relatedTarget) {
			this._relatedTarget = relatedTarget;
		},

		/**
		 * Get the XY according to target component's coordinates system
		 * 
		 * @name sap.viz.mvc.MouseEvent#targetLocalXY
		 * @function
		 * @returns {Object}
		 * 
		 * <pre>
		 * { x: ##, y: ##}
		 * </pre>
		 */
		targetLocalXY : function() {
			return {
				x : this._targetLocalXY.x,
				y : this._targetLocalXY.y
			};
		},

		/**
		 * Get the XY according to current component's coordinates system
		 * 
		 * @name sap.viz.mvc.MouseEvent#currentLocalXY
		 * @function
		 * @returns {Object}
		 * 
		 * <pre>
		 * { x: ##, y: ##}
		 * </pre>
		 */
		currentLocalXY : function() {
			return {
				x : this._currentLocalXY.x,
				y : this._currentLocalXY.y
			};
		},
		/**
		 * Get the page XY of the event
		 * 
		 * @name sap.viz.mvc.MouseEvent#pageXY
		 * @function
		 * @returns {Object}
		 * 
		 * <pre>
		 * { x: ##, y: ##}
		 * </pre>
		 */
		pageXY : function() {
			return {
				x : this._pageXY.x,
				y : this._pageXY.y
			};
		}
	});
	return MouseEvent;
});