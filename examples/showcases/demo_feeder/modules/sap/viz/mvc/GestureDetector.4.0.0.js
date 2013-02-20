sap.riv.module(
{
  qname : 'sap.viz.mvc.GestureDetector',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(FuncUtils) {
	/**
	 * The mask used to specify gesture detector's state
	 * 
	 * @name sap.viz.mvc.GestureDetector.TransitionState
	 * @class
	 */
	var ts = {
		/**
		 * Possible State. Gesture Detector is ready to detect gesture
		 * 
		 * @field
		 * 
		 */
		Possible : 0,
		/**
		 * Began State. Gesture Detector is ready to detect continuous gesture
		 * 
		 * @field
		 * 
		 */
		Began : 1,
		/**
		 * Began State. Gesture Detector is continuous to detect continuous
		 * gesture
		 * 
		 * @field
		 * 
		 */
		Changed : 2,
		/**
		 * Recognized State. Discrete Gesture is detected
		 * 
		 * @field
		 * 
		 */
		Recognized : 3,// Recognized == Ended
		/**
		 * Ended State. Continuous Gesture is detected
		 * 
		 * @field
		 * 
		 */
		Ended : 3,
		/**
		 * Ended State. Continuous Gesture is stop to detected
		 * 
		 * @field
		 * 
		 */
		Cancelled : 4,
		/**
		 * Ended State. Detector fails to detect in current touch sequence
		 * 
		 * @field
		 * 
		 */
		Failed : 5
	};

	/**
	 * The base abstract gesture detector class
	 * 
	 * @name sap.viz.mvc.GestureDetector
	 * @constructor
	 */
	var GestureDetector = function() {
		this._grOwnerComp;
		this._grEnabled = true;
		this._grTouchTotal = 0;
		this._grTouchTracker = {};
		this._grState = ts.Possible;
		this._grActions = [];
		this._grCancelTouches = true;
	};
	var grp = GestureDetector.prototype;

	grp._setOwnerComp_ = function(ownerComp) {
		this._grOwnerComp = ownerComp;
	};
	/**
	 * Get the attached UI component
	 * 
	 * @name sap.viz.mvc.GestureDetector#attachedComponent
	 * @function
	 * @returns {sap,riv.vizkit.UIComponent}
	 */
	grp.attachedComponent = function() {
		return this._grOwnerComp;
	};

	/**
	 * Add a gesture action function which will get triggered when gesture
	 * detected.
	 * 
	 * @name sap.viz.mvc.GestureDetector#addGestureAction
	 * @function
	 * @param {Function}
	 *            actionFn, function to be called when gesture detected.
	 * @returns {Boolean}
	 */
	grp.addGestureAction = function(actionFn) {
		var added = false;
		for ( var i = 0, len = this._grActions.length; i < len; i++) {
			if (this._grActions[i] === actionFn) {
				added = true;
				break;
			}
		}
		if (!added) {
			this._grActions.push(actionFn);
		}
		return !added;
	};

	/**
	 * Remove a previously added gesture action
	 * 
	 * @name sap.viz.mvc.GestureDetector#removeGestureAction
	 * @function
	 * @param {Function}
	 *            actionFn, the function to be removed.
	 * @returns {Boolean}
	 */
	grp.removeGestureAction = function(actionFn) {
		var found = false;
		for ( var i = 0, len = this._grActions.length; i < len; i++) {
			if (this._grActions[i] === actionFn) {
				found = true;
				this._grActions.splice(i, 1);
				break;
			}
		}
		return found;
	};

	/**
	 * Return the current global location of the gesture, the location is
	 * calculated as the center of the current touches. Caution: This function
	 * only return meaningful point value IF and ONLY IF the current state of
	 * this gesture detector is in Recognizing state, a.k.a Began, Changed,
	 * Cancelled, Ended, Recognized, otherwise undefined will return.
	 * 
	 * @function
	 * @returns {Object}
	 */
	grp.globalLocOfGesture = function() {
		var state = this.state();
		if (this._grEnabled
				&& (state === ts.Began || state === ts.Changed || state === ts.Cancelled || state === ts.Ended || state === ts.Recognized)) {
			var count = 0;
			var ttracker = this._grTouchTracker, xy;
			var x = y = 0;
			for ( var tId in ttracker) {
				xy = ttracker[tId].globalXY;
				x += xy.x;
				y += xy.y;
				count++;
			}
			if (count) {
				return {
					x : x / count,
					y : y / count
				};
			}
		} else {
			return;
		}
	};

	/**
	 * Return a list of identifier of touches currently involved in the gesture
	 * detection, Caution: This function only return meaningful array of touches
	 * IF and ONLY IF the current state of this gesture detector is in
	 * Recognizing state, a.k.a Began, Cancelled, Ended, Recognized, otherwise
	 * empty array will return.
	 * 
	 * @function
	 * @returns {Array}
	 */
	grp.involvedTouchePoints = function() {
		var ret = [];
		var state = this.state();
		if (this._grEnabled
				&& (state === ts.Began || state === ts.Cancelled || state === ts.Ended || state === ts.Recognized)) {
			var ttracker = this._grTouchTracker;
			for ( var tId in ttracker) {
				ret.push(tId);
			}
		}
		return ret;
	};

	/**
	 * Return the current global location of all the current touches, the
	 * location is calculated as the center of the touches currently contacting
	 * with the screen.
	 * 
	 * @function
	 * @returns {Object}
	 */
	grp.globalLocOfTouchPoints = function() {
		var count = 0;
		var ttracker = this._grTouchTracker, xy;
		var x = y = 0;
		for ( var tId in ttracker) {
			xy = ttracker[tId].globalXY;
			x += xy.x;
			y += xy.y;
			count++;
		}
		if (count) {
			return {
				x : x / count,
				y : y / count
			};
		}
	};

	/**
	 * Return the number of touches currently contacting with the screen
	 * 
	 * @function
	 * @returns {Number}
	 */
	grp.totalTouches = function() {
		return this._grTouchTotal;
	};

	/**
	 * Get or set whether canceling previous touches when a gesture detected.
	 * Default is yes.
	 * 
	 * @function
	 * @returns {Boolean|this}
	 */
	grp.cancelTouches = function(cancel) {
		if (cancel !== undefined) {
			this._grCancelTouches = cancel;
			return this;
		} else {
			return this._grCancelTouches;
		}
	};
	/**
	 * Get or set the enable status of the gesture detector. If the gesture
	 * detector is in detecting some continuous gesture it will immediately
	 * transit to cancelled state. Default is yes.
	 * 
	 * @function
	 * @returns {Boolean|this}
	 */
	grp.enable = function(enable) {
		if (enable !== undefined) {
			this._grEnabled = enable;
			if (!enable) {
				if (this._grState === ts.Began || this._grState === ts.Cancelled) {
					this.state(ts.Cancelled);
				} else {
					this.state(ts.Failed);
				}
			}
		} else {
			return this._grEnabled;
		}
	};

	grp.touchBegin = function(touchStartEvent) {
		var newTouches = touchStartEvent.changedTouches;
		var ttracker = this._grTouchTracker;
		var ownerComp = this._grOwnerComp;
		var pagePosition = ownerComp.pagePosition();
		for ( var i = 0, t, len = newTouches.length; i < len; i++) {
			t = newTouches.item(i);
			ttracker[t.identifier] = {
				globalXY : ownerComp.convertPointToGlobal({
					x : t.pageX - pagePosition.x,
					y : t.pageY - pagePosition.y
				})
			};
			this._grTouchTotal++;
		}
		if (this._grEnabled
				&& (this._grState === ts.Possible || this._grState === ts.Began || this._grState === ts.Changed)) {
			this.doTouchBegin(touchStartEvent);
		}
	};
	/**
	 * Gesture Detector uses this method to receive touches in moving phase of a
	 * touch sequence. This method should be overridden in subclass.
	 * <P>
	 * <b>Method of superclass must be called in first place when overriding</b>
	 * </p>
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#touchMove
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchMoveEvent
	 */
	grp.touchMove = function(touchMoveEvent) {
		if (this._grEnabled
				&& (this._grState === ts.Possible || this._grState === ts.Began || this._grState === ts.Changed)) {
			var movedTouches = touchMoveEvent.changedTouches;
			var ownerComp = this._grOwnerComp;
			var pagePosition = ownerComp.pagePosition();
			var ttracker = this._grTouchTracker;
			for ( var i = 0, t, len = movedTouches.length; i < len; i++) {
				t = movedTouches.item(i);
				if (ttracker[t.identifier]) {
					ttracker[t.identifier].globalXY = ownerComp.convertPointToGlobal({
						x : t.pageX - pagePosition.x,
						y : t.pageY - pagePosition.y
					});
				}
			}
			this.doTouchMove(touchMoveEvent);
		}
	};
	/**
	 * Gesture Detector uses this method to receive touches in ending phase of a
	 * touch sequence. This method should be overridden in subclass.
	 * <P>
	 * <b>Method of superclass must be called in first place when overriding</b>
	 * </p>
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#touchEnd
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchEndEvent
	 */
	grp.touchEnd = function(touchEndEvent) {
		var endedTouches = touchEndEvent.changedTouches;
		var ttracker = this._grTouchTracker;
		var ownerComp = this._grOwnerComp;
		var pagePosition = ownerComp.pagePosition();
		for ( var i = 0, t, tId, track, len = endedTouches.length; i < len; i++) {
			t = endedTouches.item(i);
			tId = t.identifier;
			track = ttracker[tId];
			if (track) {
				track.globalXY = ownerComp.convertPointToGlobal({
					x : t.pageX - pagePosition.x,
					y : t.pageY - pagePosition.y
				});
				this._grTouchTotal--;
			}
		}
		if (this._grEnabled
				&& (this._grState === ts.Possible || this._grState === ts.Began || this._grState === ts.Changed)) {
			this.doTouchEnd(touchEndEvent);
		}
		// Reset the detector only when all fingers lifted and in 'ending' state
		if (!this._grTouchTotal
				&& (this._grState === ts.Recognized || this._grState === ts.Failed || this._grState === ts.Cancelled)) {
			this.reset();
		}
	};
	/**
	 * Gesture Detector uses this method to receive touches in cancellation
	 * phase of a touch sequence. This method should be overridden in subclass.
	 * <P>
	 * <b>Method of superclass must be called in first place when overriding</b>
	 * </p>
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#touchCancel
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchCancelEvent
	 */
	grp.touchCancel = function(touchCancelEvent) {
		var cancelledTouches = touchCancelEvent.changedTouches;
		var ttracker = this._grTouchTracker;
		var ownerComp = this._grOwnerComp;
		var pagePosition = ownerComp.pagePosition();
		for ( var i = 0, t, tId, track, len = cancelledTouches.length; i < len; i++) {
			t = cancelledTouches.item(i);
			tId = t.identifier;
			track = ttracker[tId];
			if (track) {
				track.globalXY = ownerComp.convertPointToGlobal({
					x : t.pageX - pagePosition.x,
					y : t.pageY - pagePosition.y
				});
				this._grTouchTotal--;
			}
		}
		if (this._grEnabled
				&& (this._grState === ts.Possible || this._grState === ts.Began || this._grState === ts.Changed)) {
			this.doTouchCancel(touchCancelEvent);
		}
		// Reset the detector only when all fingers lifted and in 'ending' state
		if (!this._grTouchTotal
				&& (this._grState === ts.Recognized || this._grState === ts.Failed || this._grState === ts.Cancelled)) {
			this.reset();
		}
	};
	/**
	 * Gesture Detector uses this method to receive touches in start phase of a
	 * touch sequence. This method should be overridden in subclass.
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#doTouchBegin
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchStartEvent
	 */
	grp.doTouchBegin = FuncUtils.noop;
	/**
	 * Gesture Detector uses this method to receive touches in moving phase of a
	 * touch sequence. This method should be overridden in subclass.
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#doTouchMove
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchMoveEvent
	 */
	grp.doTouchMove = FuncUtils.noop;
	/**
	 * Gesture Detector uses this method to receive touches in ending phase of a
	 * touch sequence. This method should be overridden in subclass.
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#doTouchEnd
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchEndEvent
	 */
	grp.doTouchEnd = FuncUtils.noop;
	/**
	 * Gesture Detector uses this method to receive touches in cancellation
	 * phase of a touch sequence. This method should be overridden in subclass.
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#doTouchCancel
	 * @function
	 * @param {DOMTouchEvent}
	 *            touchCancelEvent
	 */
	grp.doTouchCancel = FuncUtils.noop;
	/**
	 * Gesture Detector uses this method to reset the internal state, before
	 * start to do next around recognition.
	 * <P>
	 * <b>Method of superclass must be called in first place when overriding</b>
	 * </p>
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#reset
	 * @function
	 */
	grp.reset = function() {
		this._grState = ts.Possible;
		// this._grTouchTotal = 0;
		this._grTouchTracker = {};
	};
	/**
	 * Get the current state of gesture detector
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#state
	 * @function
	 * @param {sap.viz.mvc.GestureDetector.TransitionState}
	 *            transState
	 */
	grp.state = function(transState) {
		return this._grState;
	};

	/**
	 * Gesture Detector uses this method to set it's state. Subclass should set
	 * correct state at right time, usually in
	 * doTouchBegin/doTouchMove/doTouchEnd/doTouchCancel method.
	 * 
	 * 
	 * @name sap.viz.mvc.GestureDetector#_state_
	 * @function
	 * @param {sap.viz.mvc.GestureDetector.TransitionState}
	 *            transState
	 */
	grp._setState_ = function(transState) {
		switch (transState) {
		case ts.Possible:
			break;
		case ts.Began:
			this._grState = ts.Began;
			for ( var i = 0, grActions = this._grActions, len = grActions.length; i < len; i++) {
				grActions[i](this);
			}
			break;
		case ts.Changed:
			if (this._grState === ts.Began) {
				this._grState = ts.Changed;
			}
			for ( var i = 0, grActions = this._grActions, len = grActions.length; i < len; i++) {
				grActions[i](this);
			}
			break;
		case ts.Cancelled:
			this._grState = ts.Cancelled;
			for ( var i = 0, grActions = this._grActions, len = grActions.length; i < len; i++) {
				grActions[i](this);
			}
			// this.reset();
			break;
		case ts.Failed:
			this._grState = ts.Failed;
			// this.reset();
			break;
		case ts.Ended:
		case ts.Recognized:
			this._grState = transState;
			for ( var i = 0, grActions = this._grActions, len = grActions.length; i < len; i++) {
				grActions[i](this);
			}
			// this.reset();
			break;
		}
	};

	GestureDetector.TransitionState = ts;
	return GestureDetector;
});