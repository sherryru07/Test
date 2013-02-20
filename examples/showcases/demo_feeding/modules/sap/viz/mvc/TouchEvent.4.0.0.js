sap.riv.module(
{
  qname : 'sap.viz.mvc.TouchEvent',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.Event',
  version : '4.0.0'
}
],
function Setup(FuncUtils, ObjectUtils, Event) {
	var $ = jQuery;
	if (!$) {
		FuncUtils.error('Cannot find jQuery');
	}
	/**
	 * Touch class
	 * 
	 * @name sap.viz.mvc.Touch
	 * @constructor
	 */
	var Touch = function(identifier, target, localXY, pageXY) {
		this._id = identifier;
		this._target = target;
		this._localXY = localXY;
		this._pageXY = pageXY;
	};
	var tp = Touch.prototype;
	/**
	 * Get the identifier of the touch
	 * 
	 * @name sap.viz.mvc.Touch#identifier
	 * @function
	 * @returns {Number}
	 */
	tp.identifier = function() {
		return this._id;
	};

	/**
	 * Get the target component of the touch
	 * 
	 * @name sap.viz.mvc.Touch#target
	 * @function
	 * @returns {sap.viz.mvc.UIComponent}
	 */
	tp.target = function() {
		return this._target;
	};

	/**
	 * Get the local XY of the touch in touch's target component's coordinate
	 * system
	 * 
	 * @name sap.viz.mvc.Touch#localXY
	 * @function
	 * @returns {Object}
	 * 
	 * <pre>
	 * { x: ##, y: ##}
	 * </pre>
	 */
	tp.localXY = function() {
		return {
			x : this._localXY.x,
			y : this._localXY.y
		};
	};

	/**
	 * Get the page XY of the touch in document's coordinate system
	 * 
	 * @name sap.viz.mvc.Touch#pageXY
	 * @function
	 * @returns {Object}
	 * 
	 * <pre>
	 * { x: ##, y: ##}
	 * </pre>
	 */
	tp.pageXY = function() {
		return {
			x : this._pageXY.x,
			y : this._pageXY.y
		};
	};
	/**
	 * Touch List class
	 * 
	 * @name sap.viz.mvc.TouchList
	 * @constructor
	 */
	var TouchList = function(tArray, tMap) {
		this.tA = tArray, this.tM = tMap;
	};

	var tlp = TouchList.prototype;
	/**
	 * Return the length of the list
	 * 
	 * @name sap.viz.mvc.TouchList#length
	 * @function
	 * @returns {Number}
	 * 
	 */
	tlp.length = function() {
		return this.tA.length;
	};
	/**
	 * Get the touch at specified index
	 * 
	 * @name sap.viz.mvc.TouchList#item
	 * @function
	 * @param {Number}
	 *            index
	 * @returns {sap.viz.mvc.Touch}
	 */
	tlp.item = function(index) {
		if (index >= 0 && (index < this.tA.length)) {
			return this.tA[index];
		}
	};
	/**
	 * Get the touch with specified identifier
	 * 
	 * @name sap.viz.mvc.TouchList#identifiedTouch
	 * @function
	 * @param {Number}
	 *            identifier
	 * @returns {sap.viz.mvc.Touch}
	 */
	tlp.identifiedTouch = function(identifier) {
		if (identifier) {
			return this.tM[identifier];
		}
	};
	/**
	 * This class defines Touch Event
	 * 
	 * @name sap.viz.mvc.TouchEvent
	 * @class
	 * @augments sap.viz.mvc.Event
	 */
	var TouchEvent = ObjectUtils.derive(Event,
	/**
	 * @lends sap.viz.mvc.TouchEvent
	 * 
	 */
	{
		constructor : function(type, target, canBubbling, touches, targetTouches, changedTouches) {
			this._relatedTarget = undefined;
			this._touches = touches;
			this._targetTouches = targetTouches;
			this._changedTouches = changedTouches;
		},

		/**
		 * Get the all touches on the screen.
		 * 
		 * @name sap.viz.mvc.TouchEvent#touches
		 * @function
		 * @returns {sap.viz.mvc.TouchList}
		 */
		touches : function() {
			return this._touches;
		},
		/**
		 * Get the touches initiated from the same target
		 * 
		 * @name sap.viz.mvc.TouchEvent#targetTouches
		 * @function
		 * @returns {sap.viz.mvc.TouchList}
		 */
		targetTouches : function() {
			return this._targetTouches;
		},
		/**
		 * Get the touches lead to the event
		 * 
		 * @name sap.viz.mvc.TouchEvent#changedTouches
		 * @function
		 * @returns {sap.viz.mvc.TouchList}
		 */
		changedTouches : function() {
			return this._changedTouches;
		}
	});
	var _buildTouchListFromTouchList = function(touchlist) {
		var tArray = [], tMap = {};
		for ( var i = 0, targetComp, touch, len = touchlist.length; i < len; i++) {
			targetComp = _findTargetComp(touchlist.item(i));
			if (targetComp) {
				// We only consider the touches originated from RIV component
				touch = _buildTouch(touchlist.item(i), targetComp);
				tArray.push(touch);
				tMap[touch.identifier()] = touch;
			}
		}
		return new TouchList(tArray, tMap);
	};

	var _buildTouchListFromTouchArray = function(touchArray) {
		var tArray = [], tMap = {};
		for ( var i = 0, targetComp, touch, len = touchArray.length; i < len; i++) {
			targetComp = _findTargetComp(touchArray[i]);
			if (targetComp) {
				// We only consider the touches originated from RIV component
				touch = _buildTouch(touchArray[i], targetComp);
				tArray.push(touch);
				tMap[touch.identifier()] = touch;
			}
		}
		return new TouchList(tArray, tMap);
	};

	var _findTargetComp = function(touch) {
		var cnode = $(touch.target);
		while (cnode.length && !cnode.data('selfComp')) {
			cnode = cnode.parent();
		}
		return cnode.data('selfComp');
	};

	var _buildTouch = function(touch, targetComp) {
		var targetCompPagePosition = targetComp.pagePosition();
		var localXY = {
			x : touch.pageX - targetCompPagePosition.x,
			y : touch.pageY - targetCompPagePosition.y
		};
		// binding to UIComponent instead of Element
		return new Touch(touch.identifier, targetComp, localXY, {
			x : touch.pageX,
			y : touch.pageY
		});
	};
	TouchEvent.buildFrom3TouchArray = function(type, target, touches, changedTouches, targetTouches, canBubbling) {
		var _touches = _buildTouchListFromTouchArray(touches);
		var _targetTouches = _buildTouchListFromTouchArray(targetTouches);
		var _changedTouches = _buildTouchListFromTouchArray(changedTouches);
		return new TouchEvent(type, target, canBubbling, _touches, _targetTouches, _changedTouches);
	};
	TouchEvent.buildFromDomTouchEvent = function(type, target, domTouchEvent, canBubbling) {
		var _touches = _buildTouchListFromTouchList(domTouchEvent.touches);
		var _targetTouches = _buildTouchListFromTouchList(domTouchEvent.targetTouches);
		var _changedTouches = _buildTouchListFromTouchList(domTouchEvent.changedTouches);
		return new TouchEvent(type, target, canBubbling, _touches, _targetTouches, _changedTouches);
	};
	return TouchEvent;
});