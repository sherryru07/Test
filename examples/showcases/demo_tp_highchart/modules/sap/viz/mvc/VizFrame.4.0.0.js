sap.riv.module(
{
  qname : 'sap.viz.mvc.VizFrame',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.UIComponent',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.GestureDetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.DomWatcher',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.Event',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.MouseEvent',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.TouchEvent',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Math',
  version : '4.0.0'
}
],
function Setup(FunctionUtils, ObjectUtils, UIComponent, GestureDetector, DomWatcher, Event, MouseEvent, TouchEvent,
		Math) {
	var $ = jQuery;
	if (!$) {
		FuncUtils.error('Cannot find jQuery');
	}
	var isInDomtree = function(node) {
		var bodyNode = undefined;
		do {
			if (node.nodeName == 'BODY') {
				bodyNode = node;
				break;
			} else {
				node = node.parentNode;
			}
		} while (node)
		return bodyNode;
	};

	var setFrame = function(vframe) {
		// set offset according to parent postion property
		var holder = vframe._holder;
		if (holder.css('position') == "static" || holder.css('position') == "fix") {
			var position = holder.position();
			vframe.frame({
				x : position.left,
				y : position.top,
				width : holder.width(),
				height : holder.height()
			});
		} else {
			vframe.frame({
				x : 0,
				y : 0,
				width : holder.width(),
				height : holder.height()
			});
		}
	};
	// callback on css change
	var func = function(changedProps) {
		for ( var i = 0, len = changedProps.length; i < len; i++) {
			if (changedProps[i] === "position") {
				setFrame(this);
				break;
			}
		}
	};

	var getHittedComponent = function(event) {
		var domEntity = $(event.target);
		while (!domEntity.data('selfComp')) {
		  if (!domEntity.length)
		    break;
			domEntity = domEntity.parent();
		}
		return domEntity.data('selfComp');
	};

	var ts = GestureDetector.TransitionState;
	var VizFrame = ObjectUtils
			.derive(
					UIComponent,
					{
						constructor : function(options) {
							if (options.container) {
								this._holder = $(options.container);
								if (!isInDomtree(this._holder.get(0))) {
									FunctionUtils.error('The holder DIV must be a child of Body element.');
								}
								// VizFrame's logical parent is always visible
								if (this._holder.css('display') === 'none') {
									this.markHide();
								}
								this.clipToBound(false);
								this._regDOMEventHandlers();
								this._holder.append(this._container);
								this.anchorPoint({
									x : 0,
									y : 0
								});
								setFrame(this);
								// watch position changes
								DomWatcher.watch(this._holder.get(0), "position", ObjectUtils.proxy(func, this));
								this._parentVisible = true;
								this._attached = true;
								// structure for event dispatching
								this._msTracking = [];
								this._touchSeqTracking = {};

							} else {
								throw new Error('you have to provide a container for viz frame');
							}
						},

						_regDOMEventHandlers : function() {
							this._container.bind('click', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('dblclick', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('focusin', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('focusout', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('focus', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('blur', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('mousedown', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('mouseup', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('mouseenter', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('mouseleave', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('mousemove', ObjectUtils.proxy(this._handleDomEvent, this));
							// Below events are supposed to be fired when the
							// element is attached/detached to/from document,
							// it's used to register touch listener correctly in
							// iOS Mobile Safari.
							this._container.bind('DOMNodeInsertedIntoDocument', ObjectUtils.proxy(
									this._registerDOMTouchHandler, this));
							this._container.bind('DOMNodeRemovedFromDocument', ObjectUtils.proxy(
									this._unregisterDOMTouchHandler, this));
						},

						_registerDOMTouchHandler : function() {
							this._container.bind('touchstart', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('touchmove', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('touchend', ObjectUtils.proxy(this._handleDomEvent, this));
							this._container.bind('touchcancel', ObjectUtils.proxy(this._handleDomEvent, this));
						},

						_unregisterDOMTouchHandler : function() {
							this._container.unbind('touchstart');
							this._container.unbind('touchmove');
							this._container.unbind('touchend');
							this._container.unbind('touchcancel');
						},

						_handleDomEvent : function(event) {
							event.preventDefault();
							var hittedComp = getHittedComponent(event);
							switch (event.type) {
							case 'mousemove':
								if (hittedComp) {
									var hittedCompPageXY = hittedComp.pagePosition();
									var localPoint = {
										x : event.pageX - hittedCompPageXY.x,
										y : event.pageY - hittedCompPageXY.y
									};
									if (this._msTracking.length) {
										if (this._msTracking[this._msTracking.length - 1] !== hittedComp) {
											var enteredComps = [];
											var entered = hittedComp;
											while (entered) {
												enteredComps.push(entered);
												entered = entered.superComponent();
											}
											var inCompCount = 0, checkFinished = false, minLen = Math.min(
													this._msTracking.length, enteredComps.length);
											while (true) {
												var left = undefined;
												if (!checkFinished
														&& this._msTracking[inCompCount] === enteredComps[enteredComps.length
																- 1 - inCompCount]) {
													inCompCount++;
													checkFinished = inCompCount === minLen;
												} else {
													while (this._msTracking.length > inCompCount) {
														left = this._msTracking.pop();
														var mlEvt = new MouseEvent('mouseleave', left, false, left
																.convertPointFromComp(localPoint, hittedComp), {
															x : event.pageX,
															y : event.pageY
														});
														mlEvt._setRelatedTarget_(hittedComp);
														left._fireMouseEvent_(mlEvt);
													}
													while (inCompCount < enteredComps.length) {
														var entered = enteredComps.shift();
														left = this._msTracking[enteredComps.length - 1];
														this._msTracking[enteredComps.length] = entered;
														var mlEvt = new MouseEvent('mouseenter', entered, false,
																entered.convertPointFromComp(localPoint, hittedComp), {
																	x : event.pageX,
																	y : event.pageY
																});
														mlEvt._setRelatedTarget_(left);
														entered._fireMouseEvent_(mlEvt);
													}
													break;
												}
											}
										}
									} else {
										var entered = hittedComp;
										do {
											this._msTracking.push(entered);
											entered._fireMouseEvent_(new MouseEvent('mouseenter', entered, false,
													localPoint, {
														x : event.pageX,
														y : event.pageY
													}));
											entered = entered.superComponent();
										} while (entered)
										this._msTracking.reverse();
									}
									hittedComp._fireMouseEvent_(new MouseEvent('mousemove', hittedComp, true,
											localPoint, {
												x : event.pageX,
												y : event.pageY
											}));
								} else {
									while (this._msTracking.length) {
										var left = this._msTracking.pop();
										var framePagePosition = this.pagePosition();
										left._fireMouseEvent_(new MouseEvent('mouseleave', left, false, {
											x : event.pageX - framePagePosition.x,
											y : event.pageY - framePagePosition.y
										}, {
											x : event.pageX,
											y : event.pageY
										}));
									}
								}
								break;
							case 'mouseleave':
								while (this._msTracking.length) {
									var left = this._msTracking.pop();
									var leftCompPageXY = left.pagePosition();
									left._fireMouseEvent_(new MouseEvent('mouseleave', left, false, {
										x : event.pageX - leftCompPageXY.x,
										y : event.pageY - leftCompPageXY.y
									}, {
										x : event.pageX,
										y : event.pageY
									}));
								}
								break;
							case 'mouseup':
								if (hittedComp) {
									var hittedCompPageXY = hittedComp.pagePosition();
									hittedComp._fireMouseEvent_(new MouseEvent('mouseup', hittedComp, true, {
										x : event.pageX - hittedCompPageXY.x,
										y : event.pageY - hittedCompPageXY.y
									}, {
										x : event.pageX,
										y : event.pageY
									}));
								}
								break;
							case 'mousedown':
								if (hittedComp) {
									var hittedCompPageXY = hittedComp.pagePosition();
									hittedComp._fireMouseEvent_(new MouseEvent('mousedown', hittedComp, true, {
										x : event.pageX - hittedCompPageXY.x,
										y : event.pageY - hittedCompPageXY.y
									}, {
										x : event.pageX,
										y : event.pageY
									}));
								}
								break;
							case 'dblclick':
								if (hittedComp) {
									if (this._focusedComp) {
										if (this._focusedComp.id() !== hittedComp.id()) {
											this._focusedComp._fireEvent_(new Event('blur', this._focusedComp, false));
											this._focusedComp._fireEvent_(new Event('focusout', this._focusedLayer,
													true));
											this._focusedComp = hittedComp;
											this._focusedComp._fireEvent_(new Event('focus', this._focusedComp, false));
											this._focusedComp
													._fireEvent_(new Event('focusin', this._focusedComp, true));
										}
									} else {
										this._focusedComp = hittedComp;
										this._focusedComp._fireEvent_(new Event('focus', this._focusedComp, false));
										this._focusedComp._fireEvent_(new Event('focusin', this._focusedComp, true));
									}
									var hittedCompPageXY = hittedComp.pagePosition();
									this._focusedComp._fireMouseEvent_(new MouseEvent('dblclick', this._focusedComp,
											true, {
												x : event.pageX - hittedCompPageXY.x,
												y : event.pageY - hittedCompPageXY.y
											}, {
												x : event.pageX,
												y : event.pageY
											}));
								} else {
									if (this._focusedComp) {
										this._focusedComp._fireEvent_(new Event('blur', this._focusedLayer, false));
										this._focusedComp._fireEvent_(new Event('focusout', this._focusedLayer, true));
										this._focusedComp = undefined;
									}
								}
								break;
							case 'click':
								if (hittedComp) {
									if (this._focusedComp) {
										if (this._focusedComp.id() !== hittedComp.id()) {
											this._focusedComp._fireEvent_(new Event('blur', this._focusedComp, false));
											this._focusedComp
													._fireEvent_(new Event('focusout', this._focusedComp, true));
											this._focusedComp = hittedComp;
											this._focusedComp._fireEvent_(new Event('focus', this._focusedComp, false));
											this._focusedComp
													._fireEvent_(new Event('focusin', this._focusedComp, true));
										}
									} else {
										this._focusedComp = hittedComp;
										this._focusedComp._fireEvent_(new Event('focus', this._focusedComp, false));
										this._focusedComp._fireEvent_(new Event('focusin', this._focusedComp, true));
									}
									var hittedCompPageXY = hittedComp.pagePosition();
									this._focusedComp._fireMouseEvent_(new MouseEvent('click', this._focusedComp, true,
											{
												x : event.pageX - hittedCompPageXY.x,
												y : event.pageY - hittedCompPageXY.y
											}, {
												x : event.pageX,
												y : event.pageY
											}));
								} else {
									if (this._focusedComp) {
										this._focusedComp._fireEvent_(new Event('blur', this._focusedComp, false));
										this._focusedComp._fireEvent_(new Event('focusout', this._focusedComp, true));
										this._focusedComp = undefined;
									}
								}
								break;
							case 'touchstart':
								for ( var i = 0, touch, changedTouches = event.originalEvent.changedTouches, len = changedTouches.length; i < len; i++) {
									touch = changedTouches.item(i);
									// 'false' means the touch hasn't been
									// marked
									// cancelled
									this._touchSeqTracking[touch.identifier] = false;
								}

								// Handle gesture Detection
								this._handleGestureDetect(hittedComp, event.originalEvent);
								var touchEvent = TouchEvent.buildFromDomTouchEvent('touchstart', hittedComp,
										event.originalEvent);
								hittedComp._fireTouchEvent_(touchEvent);
								break;
							case 'touchmove':
								// Handle gesture Detection and fire touchmove
								// event when no gesture currently detected
								if (!this._handleGestureDetect(hittedComp, event.originalEvent)) {
									var touchEvent = TouchEvent.buildFromDomTouchEvent('touchmove', hittedComp,
											event.originalEvent);
									hittedComp._fireTouchEvent_(touchEvent);
								}
								break;
							case 'touchend':
								// Handle gesture Detection
								this._handleGestureDetect(hittedComp, event.originalEvent);
								var uncancelledTouchesArray = [], cancelledTouchesArray = [], touchesArray = [], targetTouchesArray = [];
								for ( var i = 0, touch, changedTouches = event.originalEvent.changedTouches, len = changedTouches.length; i < len; i++) {
									touch = changedTouches.item(i);
									this._touchSeqTracking[touch.identifier] === true ? cancelledTouchesArray
											.push(touch) : uncancelledTouchesArray.push(touch);
									delete this._touchSeqTracking[touch.identifier];
								}

								if (uncancelledTouchesArray.length) {
									// Some touches are not cancelled, so we
									// have to split the event into two events,
									// one for cancelled touches, one for
									// uncancelled touches
									for ( var i = 0, touch, targetTouches = event.originalEvent.targetTouches, len = targetTouches.length; i < len; i++) {
										touch = targetTouches.item(i);
										targetTouchesArray.push(touch);
									}
									for ( var i = 0, touch, touches = event.originalEvent.touches, len = touches.length; i < len; i++) {
										touch = touches.item(i);
										touchesArray.push(touch);
									}
									var touchCancelEvent = TouchEvent.buildFrom3TouchArray('touchcancel', hittedComp,
											touchesArray, cancelledTouchesArray, targetTouchesArray);
									hittedComp._fireTouchEvent_(touchCancelEvent);
									var touchEndEvent = TouchEvent.buildFrom3TouchArray('touchend', hittedComp,
											touchesArray, uncancelledTouchesArray, targetTouchesArray);
									hittedComp._fireTouchEvent_(touchEndEvent);
								} else {
									// All ended touches are marked as cancelled
									var touchEvent = TouchEvent.buildFromDomTouchEvent('touchcancel', hittedComp,
											event.originalEvent);
									hittedComp._fireTouchEvent_(touchEvent);
								}
								// Fire touch event
								break;

							case 'touchcancel':
								// Handle gesture Detection
								this._handleGestureDetect(hittedComp, event.originalEvent);
								for ( var i = 0, touch, changedTouches = event.originalEvent.changedTouches, len = changedTouches.length; i < len; i++) {
									touch = changedTouches.item(i);
									delete this._touchSeqTracking[touch.identifier];
								}
								var touchEvent = TouchEvent.buildFromDomTouchEvent('touchcancel', hittedComp,
										event.originalEvent);
								hittedComp._fireTouchEvent_(touchEvent);
								break;
							}
						},

						_handleGestureDetect : function(hittedComponent, origTouchEvent) {
							var grs = [];
							var thisLevel = hittedComponent;
							// find the gesture recognizers responsible for the
							// gesture detection of the component hierarchy
							while (!thisLevel._gestureDetectors.length && thisLevel._superComp) {
								thisLevel = thisLevel._superComp;
							}
							grs = thisLevel._gestureDetectors;
							var someGestureDetected = false, gestureDetected, needToCancelTouches = false;
							for ( var i = 0, state, gd, len = grs.length; i < len; i++) {
								gd = grs[i];
								switch (origTouchEvent.type) {
								case 'touchstart':
									gd.touchBegin(origTouchEvent);
									break;
								case 'touchmove':
									gd.touchMove(origTouchEvent);
									break;
								case 'touchend':
									gd.touchEnd(origTouchEvent);
									break;
								case 'touchcancel':
									gd.touchCancel(origTouchEvent);
									break;
								}
								state = gd.state();
								gestureDetected = (state === ts.Began) || (state === ts.Changed)
										|| (state === ts.Recognized);
								someGestureDetected = someGestureDetected || gestureDetected;
								needToCancelTouches = needToCancelTouches || (gestureDetected && gd.cancelTouches());
							}
							if (needToCancelTouches) {
								for ( var i = 0, touch, changedTouches = origTouchEvent.changedTouches, len = changedTouches.length; i < len; i++) {
									touch = changedTouches.item(i);
									// Mark all changed touch as cancelled
									this._touchSeqTracking[touch.identifier] = true;
								}
							}
							return someGestureDetected;
						},

						hidden : function(hidden) {
							hidden ? this._holder.hide() : this._holder.show();
							if (hidden) {
								this.markHide();
							} else {
								this.markShow();
							}
						}
					});
	return VizFrame;
});