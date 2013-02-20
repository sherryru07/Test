sap.riv.module(
{
  qname : 'sap.viz.mvc.UIComponent',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.Observable',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.LinkedHashMap',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(Observable, ObjectUtils, LinkedHashMap, FuncUtils) {
	var $ = jQuery;
	if (!$) {
		FuncUtils.error('Cannot find jQuery');
	}

	/**
	 * The mask used to specify the auto resizing behavior
	 * 
	 * @name sap.viz.mvc.UIComponent.Autosizing
	 * @class
	 */
	var ar = {
		/**
		 * Mark width & height is not flexible when its parent component's size
		 * changed
		 * 
		 * @field
		 * 
		 */
		None : 0,
		/**
		 * Mark the left margin is flexible
		 * 
		 * @field
		 */
		FlexibleLeftMargin : 1 << 0,
		/**
		 * Mark the width is flexible
		 * 
		 * @field
		 */
		FlexibleWidth : 1 << 1,
		/**
		 * Mark the right margin is flexible
		 * 
		 * @field
		 */
		FlexibleRightMargin : 1 << 2,
		/**
		 * Mark the top margin is flexible
		 * 
		 * @field
		 */
		FlexibleTopMargin : 1 << 3,
		/**
		 * Mark the height is flexible
		 * 
		 * @field
		 */
		FlexibleHeight : 1 << 4,
		/**
		 * Mark the bottom margin is flexible
		 * 
		 * @field
		 */
		FlexibleBottomMargin : 1 << 5
	};

	var id = 0;
	var nextId = function() {
		return id++;
	};

	/**
	 * This class defines UI component which serves as the super class of every
	 * controls
	 * 
	 * @name sap.viz.mvc.UIComponent
	 * @class
	 * @augments sap.viz.base.utils.Observable
	 */
	var UIComponent = ObjectUtils
			.derive(
					Observable,
					/**
					 * @lends sap.viz.mvc.UIComponent
					 * 
					 */
					{
						events : [ 'widthChanged', 'heightChanged', 'sizeChanged', 'positionChanged', 'anchorChanged',
								'beforeShow', 'afterShow', 'beforeHide', 'afterHide', 'focusin', 'focusout', 'focus',
								'blur', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mousemove', 'click',
								'dblclick', 'touchstart', 'touchmove', 'touchend', 'touchcancel' ],
						/**
						 * @constructs
						 * @param {Object}
						 *            options the options to initialize the UI
						 *            component
						 * @param {Boolean}
						 *            [options.hidden] whether the UI component
						 *            is hidden
						 * @param {Integer}
						 *            [options.autoresizingMask] the bitwise
						 *            combination of the autoresizing mask,
						 *            default is
						 *            {@link  sap.viz.mvc.UIComponent.Autosizing#None}
						 * @param {Object}
						 *            [options.anchor] the anchor point of the
						 *            UI component, default is
						 * 
						 * <pre>
						 * {
						 * 	x : 0.5,
						 * 	y : 0.5
						 * }
						 * </pre>
						 * 
						 * @param {Object}
						 *            [options.position] the position of the UI
						 *            component, default is
						 * 
						 * <pre>
						 * {
						 * 	x : 0,
						 * 	y : 0
						 * }
						 * </pre>
						 * 
						 * @param {Object}
						 *            [options.size] the size of the UI
						 *            component, default is
						 * 
						 * <pre>
						 * {
						 * 	w : 0,
						 * 	h : 0
						 * }
						 * </pre>
						 */
						constructor : function(options) {
							options = options || {};

							var _nextId = nextId();

							this._id = options.id ? options.id + '_' + _nextId : _nextId;

							this._attached = false;// a internal flag indicates
							// if the underlying div is
							// attached to DOM tree

							this._container = undefined;// DOM div container for
							// this ui component

							this._superComp = undefined;

							this._subComps = new LinkedHashMap();

							this._hidden = false;

							this._clipToBound = true;

							this._parentVisible = false;

							this._printable = true;

							this._autoresizeSubComponents = true;

							this._autoresizingMask = ar.None;

							this._gestureDetectors = [];

							this._bounds = {
								x : 0,
								y : 0,
								width : 1,
								height : 1
							};
							this._position = {
								x : 0,
								y : 0
							};
							this._anchorPoint = {
								x : 0.5,
								y : 0.5
							};
							this._init_(options);
						},

						_init_ : function(options) {
							this._container = $(document.createElement('div')).attr('id', this._id).css('position',
									'absolute').css({
								'font-size' : '10px',
								'box-sizing' : 'border-box',
								'-moz-box-sizing' : 'border-box',
								'-ms-box-sizing' : 'border-box',
								'-webkit-box-sizing' : 'border-box'
							}).data('selfComp', this);
							if (options.clipToBound === false) {
								this._container.css('overflow', 'visible');
								this._clipToBound = false;
							} else {
								this._container.css('overflow', 'hidden');
							}
							if (options.hidden === true) {
								this._container.css('display', 'none');
								this._hidden = true;
							}
							if (options.autoSizingMask != undefined) {
								this._autoresizingMask = options.autoSizingMask;
							}
							if (options.anchor) {
								this._anchorPoint.x = options.anchor.x;
								this._anchorPoint.y = options.anchor.y;
								delete options.anchor;
							}
							if (options.position) {
								this._position.x = options.position.x;
								this._position.y = options.position.y;

								this._container
										.css('left', this._position.x - this._anchorPoint.x * this._bounds.width);
								this._container
										.css('top', this._position.y - this._anchorPoint.y * this._bounds.height);
								delete options.position;
							}

							if (options.size) {
								this._bounds.width = options.size.w;
								this._bounds.height = options.size.h;
								this._container.width(this._bounds.width);
								this._container.height(this._bounds.height);
								delete options.size;
							}

							this._registerMandatoryHandler();

						},

						_registerMandatoryHandler : function() {
							this.on([ {
								eventName : 'sizeChanged',
								listener : this._updateContainerSize,
								scope : this
							}, {
								eventName : 'heightChanged',
								listener : this._updateContainerHeight,
								scope : this
							}, {
								eventName : 'widthChanged',
								listener : this._updateContainerWidth,
								scope : this
							}, {
								eventName : 'positionChanged',
								listener : this._updateContainerPos,
								scope : this
							}, {
								eventName : 'anchorChanged',
								listener : this._updateContainerAnchor,
								scope : this
							} ]);
						},

						_updateContainerSize : function(os, ns) {
							this._container.width(ns.width);
							this._container.height(ns.height);
							if (this._anchorPoint.x !== 0 || this._anchorPoint.y !== 0) {
								this._container.css('left', this._position.x - this._anchorPoint.x * ns.width);
								this._container.css('top', this._position.y - this._anchorPoint.y * ns.height);
							}
							this.doContentResize(os, ns);
							this._layout(os, ns);
						},

						_updateContainerWidth : function(ow, nw) {
							this._container.width(nw);
							if (this._anchorPoint.x !== 0 || this._anchorPoint.y !== 0) {
								this._container.css('left', this._position.x - this._anchorPoint.x * nw);
							}
							var os = {
								height : this._bounds.height,
								width : ow
							}, ns = {
								height : this._bounds.height,
								width : nw
							};
							this.doContentResize(os, ns);
							this._layout(os, ns);
						},

						_updateContainerHeight : function(oh, nh) {
							this._container.height(nh);
							if (this._anchorPoint.x !== 0 || this._anchorPoint.y !== 0) {
								this._container.css('top', this._position.y - this._anchorPoint.y * nh);
							}
							var os = {
								height : oh,
								width : this._bounds.width
							}, ns = {
								height : nh,
								width : this._bounds.width
							};
							this.doContentResize(os, ns);
							this._layout(os, ns);
						},

						_updateContainerPos : function(op, np) {
							this._container.css('left', np.x - this._anchorPoint.x * this._bounds.width);
							this._container.css('top', np.y - this._anchorPoint.y * this._bounds.height);
						},

						_updateContainerAnchor : function(oap, nap) {
							this._container.css('left', this._position.x - nap.x * this._bounds.width);
							this._container.css('top', this._position.y - nap.y * this._bounds.height);
						},

						_markAttached_ : function() {
							this._attached = true;
							var subCompItr = this._subComps.getIterator();
							while (subCompItr.hasMore()) {
								subCompItr.next().value._markAttached_();
							}
							this._handleSubCompShow(this);
						},

						_markDetached_ : function() {
							this._attached = false;
							var subCompItr = this._subComps.getIterator();
							while (subCompItr.hasMore()) {
								subCompItr.next().value._markDetached_();
							}
						},

						/**
						 * Get the id of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#id
						 * @function
						 * @returns {String} the unique id of the component
						 */
						id : function() {
							return this._id;
						},
						/**
						 * Mark the component as hidden, if the component is
						 * already marked as hidden, nothing will happen;
						 * Whether the component will be shown and whether the
						 * events <b>beforeHide</b>, <b>afterHide</b> and the
						 * call-back methods <b>doBeforeHide</b>,
						 * <b>doAfterHide</b> will get triggered depend on
						 * whether two more conditions are true: 1, all of its
						 * ancestors are marked as shown. 2, the component is
						 * currently attached to DOM.
						 * 
						 * @name sap.viz.mvc.UIComponent#markHide
						 * @function
						 * @returns {this}
						 */
						markHide : function() {
							if (this._hidden === false) {
								if (this._attached && this._parentVisible) {
									this.doBeforeHide();
									this.fireEvent('beforeHide');
								}
								this._hidden = true;
								this._container.css('display', 'none');
								if (this._attached && this._parentVisible) {
									this.doAfterHide();
									this.fireEvent('afterHide');
									var subCompItr = this._subComps.getIterator();
									while (subCompItr.hasMore()) {
										this._handleSubCompHide(subCompItr.next().value);
									}
								}
							}
							return this;
						},

						_handleSubCompHide : function(comp) {
							if (comp._parentVisible && !comp._hidden) {
								comp.doBeforeHide();
								comp.fireEvent('beforeHide');
								comp.doAfterHide();
								comp.fireEvent('afterHide');
							}
							// mark all the descendant components's
							// parentVisible as false.
							comp._parentVisible = false;
							var subCompItr = comp._subComps.getIterator();
							while (subCompItr.hasMore()) {
								comp._handleSubCompHide(subCompItr.next().value);
							}
						},

						/**
						 * Mark the component as shown, if the component is
						 * already marked as shown, nothing will happen; Whether
						 * the component will be shown and whether the events
						 * <b>beforeShow</b>, <b>afterShow</b> and the
						 * call-back methods <b>doBeforeShow</b>,
						 * <b>doAfterShow</b> will get triggered depend on
						 * whether two more conditions are true: 1, all of its
						 * ancestors are marked as shown. 2, the component is
						 * currently attached to DOM.
						 * 
						 * @name sap.viz.mvc.UIComponent#markShow
						 * @function
						 * @returns {this}
						 */
						markShow : function() {
							if (this._hidden === true) {
								if (this._attached && this._parentVisible) {
									this.doBeforeShow();
									this.fireEvent('beforeShow');
								}
								this._hidden = false;
								this._container.css('display', 'block');
								if (this._attached && this._parentVisible) {
									this.doAfterShow();
									this.fireEvent('afterShow');
									var subCompItr = this._subComps.getIterator();
									while (subCompItr.hasMore()) {
										this._handleSubCompShow(subCompItr.next().value);
									}
								}
							}
							return this;
						},

						_handleSubCompShow : function(comp) {
							// whether parent is visible
							var superComp = comp.superComponent();
							comp._parentVisible = !superComp._hidden && superComp._parentVisible;
							if (comp._parentVisible && !comp._hidden) {
								// whether needs to show
								comp.doBeforeShow();
								comp.fireEvent('beforeShow');
								comp.doAfterShow();
								comp.fireEvent('afterShow');
							}
							var subCompItr = comp._subComps.getIterator();
							while (subCompItr.hasMore()) {
								comp._handleSubCompShow(subCompItr.next().value);
							}
						},

						clipToBound : function(clipToBound) {
							if (clipToBound !== undefined) {
								if (this._clipToBound !== clipToBound) {
									this._clipToBound = clipToBound;
									if (this._clipToBound) {
										this._container.css('overflow', 'hidden');
									} else {
										this._container.css('overflow', 'visible');
									}
								}
								return this;
							} else {
								return this._clipToBound;
							}
						},

						/**
						 * Get the current visibility of the component, the
						 * visibility is affected by the component's
						 * hidden/shown status, whether it's attached to DOM,
						 * whether it's ancestor components are shown.
						 * 
						 * 
						 * @name sap.viz.mvc.UIComponent#visibility
						 * @function
						 * @returns {Boolean}
						 */
						visibility : function() {
							return !this._hidden && this._attached && this._parentVisible;
						},

						/**
						 * Get and set the printable property of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#printable
						 * @function
						 * @param {undefined|Boolean}
						 *            printable
						 * @returns {this|Boolean}
						 */
						printable : function(printable) {
							if (printable !== undefined) {
								if (this._printable !== printable) {
									this._printable = printable;
								}
								return this;
							} else {
								return this._printable;
							}
						},

						/**
						 * Get and set whether the component should resize
						 * automatically when its parent's size changed
						 * 
						 * @name sap.viz.mvc.UIComponent#printable
						 * @function
						 * @param {undefined|Boolean}
						 *            autoresize
						 * @returns {this|Boolean}
						 */
						autoresizeSubComponents : function(autoresize) {
							if (autoresize !== undefined) {
								if (this._autoresizeSubComponents !== autoresize) {
									this._autoresizeSubComponents = autoresize;
								}
								return this;
							} else {
								return this._autoresizeSubComponents;
							}
						},

						/**
						 * Get and set the autoresizing mask of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#autoresizingMask
						 * @function
						 * @param {undefined|Integer}
						 *            mask
						 * @returns {this|Integer}
						 */
						autoresizingMask : function(mask) {
							if (mask !== undefined) {
								if (this._autoresizingMask !== mask) {
									this._autoresizingMask = mask;
								}
								return this;
							} else {
								return this._autoresizingMask;
							}
						},
						/**
						 * Get and set the bounds of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#bounds
						 * @function
						 * @param {undefined|Object}
						 *            bounds the new bounds of the component:
						 * 
						 * <pre>
						 * {
						 *      x : ##,
						 *      y : ##,
						 *      width : ##,
						 *      height : ##
						 * }
						 * </pre>
						 * 
						 * @returns {this|Object }
						 */
						bounds : function(bounds) {
							if (bounds) {
								var ob = this._bounds, nb = bounds;
								this._bounds.x = nb.x;
								this._bounds.y = nb.y;
								if (ob.width !== nb.width || ob.height !== nb.height) {
									var os = {
										width : ob.width,
										height : ob.height
									};
									var ns = {
										width : nb.width,
										height : nb.height
									};
									this._bounds.width = nb.width;
									this._bounds.height = nb.height;
									this.fireEvent('sizeChanged', os, ns);
								}
								return this;
							} else {
								return ObjectUtils.extend({}, this._bounds);
							}
						},
						/**
						 * Get the position of the component, the position is in
						 * Page coordinate system
						 * 
						 * @name sap.viz.mvc.UIComponent#pagePosition
						 * @function
						 * 
						 * <pre>
						 * {
						 *      x : ##,
						 *      y : ##,
						 * }
						 * </pre>
						 * 
						 * @returns {Object}
						 */
						pagePosition : function() {
							var offset = this._container.offset();
							return {
								x : offset.left,
								y : offset.top
							};
						},
						/**
						 * Get and set the position of the component, the
						 * position is in it's direct super component's
						 * coordinate system
						 * 
						 * @name sap.viz.mvc.UIComponent#position
						 * @function
						 * @param {undefined|Object}
						 *            position the new position of the
						 *            component:
						 * 
						 * <pre>
						 * {
						 *      x : ##,
						 *      y : ##,
						 * }
						 * </pre>
						 * 
						 * @returns {this|Object }
						 */
						position : function(position) {
							if (position) {
								var op = this._position, np = position;
								if (op.x !== np.x || op.y !== np.y) {
									var o = {
										x : op.x,
										y : op.y
									};
									var n = {
										x : np.x,
										y : np.y
									};
									op.x = np.x;
									op.y = np.y;
									this.fireEvent('positionChanged', o, n);
								}
								return this;
							} else {
								return ObjectUtils.extend({}, this._position);
							}
						},
						/**
						 * Get and set the size of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#size
						 * @function
						 * @param {undefined|Object}
						 *            size the new size of the component:
						 * 
						 * <pre>
						 * {
						 *      width : ##,
						 *      height : ##,
						 * }
						 * </pre>
						 * 
						 * @returns {this|Object}
						 */
						size : function(size) {
							if (size) {
								var os = {
									width : this._bounds.width,
									height : this._bounds.height
								};
								if (os.width !== size.width || os.height !== size.height) {
									this._bounds.width = size.width;
									this._bounds.height = size.height;
									this.fireEvent('sizeChanged', os, size);
								}
								return this;
							} else {
								return {
									width : this._bounds.width,
									height : this._bounds.height
								};
							}
						},
						/**
						 * Get and set the width of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#width
						 * @function
						 * @param {undefined|Number}
						 *            width the new width of the component:
						 * 
						 * 
						 * @returns {this|Number}
						 */
						width : function(width) {
							if (width) {
								var ow = this._bounds.width;
								if (ow !== width) {
									this._bounds.width = width;
									this.fireEvent('widthChanged', ow, width);
								}
								return this;
							} else {
								return this._bounds.width;
							}
						},
						/**
						 * Get and set the height of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#height
						 * @function
						 * @param {undefined|Number}
						 *            height the new height of the component:
						 * 
						 * 
						 * @returns {this|Number}
						 */
						height : function(height) {
							if (height) {
								var oh = this._bounds.height;
								if (oh !== height) {
									this._bounds.height = height;
									this.fireEvent('heightChanged', oh, height);
								}
								return this;
							} else {
								return this._bounds.height;
							}
						},
						/**
						 * Get and set the anchor of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#anchorPoint
						 * @function
						 * @param {undefined|Object}
						 *            anchorPoint the new anchor of the
						 *            component:
						 * 
						 * <pre>
						 * {
						 *      x : ##,
						 *      y : ##,
						 * }
						 * </pre>
						 * 
						 * @returns {this|Object }
						 */
						anchorPoint : function(anchorPoint) {
							if (anchorPoint) {
								var oap = this._anchorPoint, nap = anchorPoint;
								if (oap.x !== nap.x || oap.y !== nap.y) {
									var o = {
										x : oap.x,
										y : oap.y
									};
									var n = {
										x : nap.x,
										y : nap.y
									};
									oap.x = nap.x;
									oap.y = nap.y;
									this.fireEvent('anchorChanged', o, n);
								}
								return this;
							} else {
								return ObjectUtils.extend({}, this._anchorPoint);

							}
						},
						/**
						 * Get and set the frame of the component
						 * 
						 * @name sap.viz.mvc.UIComponent#frame
						 * @function
						 * @param {undefined|Object}
						 *            rect the new frame of the component:
						 * 
						 * <pre>
						 * {
						 *      x : ##,
						 *      y : ##,
						 *      width : ##,
						 *      height : ##
						 * }
						 * </pre>
						 * 
						 * @returns {this|Object }
						 */
						frame : function(rect) {
							if (rect) {
								var ob = this._bounds, op = this._position;
								var npx = rect.x + rect.width * this._anchorPoint.x;
								var npy = rect.y + rect.height * this._anchorPoint.y;
								var posChanged = false, o = undefined, n = undefined, sizeChanged = false,os = {
										width : ob.width,
										height : ob.height
									};
									ns = {
										width : rect.width,
										height : rect.height
									};
								if (ob.width !== rect.width || ob.height !== rect.height) {
									ob.width = rect.width;
									ob.height = rect.height;
									sizeChanged = true;
								}
								if (op.x !== npx || op.y !== npy) {
									o = {
										x : op.x,
										y : op.y
									};
									n = {
										x : npx,
										y : npy
									};
									op.x = npx;
									op.y = npy;
									posChanged = true;
								}
								if (posChanged) {
									this.fireEvent('positionChanged', o, n);
								}
								if (sizeChanged || (os.width===5 && os.height===5)) {
									this.fireEvent('sizeChanged', os, ns);
								}
								return this;
							} else {
								return {
									x : this._position.x - this._anchorPoint.x * this._bounds.width,
									y : this._position.y - this._anchorPoint.y * this._bounds.height,
									width : this._bounds.width,
									height : this._bounds.height
								};
							}
						},
						/**
						 * Get the parent component
						 * 
						 * @name sap.viz.mvc.UIComponent#superComponent
						 * @function
						 * @param {sap.viz.mvc.UIComponent}
						 * 
						 */
						superComponent : function() {
							return this._superComp;
						},
						/**
						 * Get the parent component
						 * 
						 * @name sap.viz.mvc.UIComponent#subComponents
						 * @function
						 * @param {sap.viz.base.utils.LinkedHashMap}
						 * 
						 */
						subComponents : function() {
							return this._subComps;
						},
						/**
						 * Add a component as a child component, the visibility
						 * related events and call-back methods will get
						 * triggered on the component tree rooted at the
						 * detached component, if the component in the tree is
						 * visible.
						 * 
						 * @name sap.viz.mvc.UIComponent#addSubComponent
						 * @function
						 * @param {this}
						 *            return this component
						 * @throws {ExistedParent}
						 */
						addSubComponent : function(subComp) {
							if (subComp) {
								if (subComp._superComp === undefined) {
									subComp._superComp = this;
									this._subComps.add(subComp.id(), subComp);
									this._container.append(subComp._container);
									if (this._attached) {
										subComp._markAttached_();
									}
									return this;
								} else {
									throw new Error('The component already has a parent component');
								}
							}
						},
						/**
						 * Detach this component from its parent, the detached
						 * component is not destroyed and could be reattached
						 * later. the visibility related events and call-back
						 * methods will get triggered on the component tree
						 * rooted at the detached component, if the component in
						 * the tree is visible.
						 * 
						 * @name sap.viz.mvc.UIComponent#detachFromSuperComponent
						 * @function
						 */
						detachFromSuperComponent : function() {
							if (this._superComp) {
								if (this._superComp._attached) {
									this._superComp._handleSubCompHide(this);
									this._markDetached_();
								}
								this._superComp._subComps.remove(this.id());
								this._container.detach();
								this._superComp = undefined;
							}
						},
						/**
						 * Remove this component from its parent, the remove
						 * component is destroyed including its subcomponent,
						 * and should not intend for reuse.
						 * 
						 * @name sap.viz.mvc.UIComponent#detachFromSuperComponent
						 * @function
						 */
						removeFromSuperComponent : function() {
							if (this._superComp) {
								this._superComp._subComps.remove(this.id());
								this._container.remove();
								if (this._superComp._attached)
									this._markDetached_();
								this._superComp = undefined;

							}
						},
						/**
						 * Insert a component as a child component before other
						 * component, the visibility related events and
						 * call-back methods will get triggered on the component
						 * tree rooted at the detached component, if the
						 * component in the tree is visible.
						 * 
						 * @name sap.viz.mvc.UIComponent#insertBeforeSubComponent
						 * @function
						 * @param {sap.viz.mvc.UIComponent}
						 *            subComp the component to insert
						 * @param {sap.viz.mvc.UIComponent}
						 *            beforeComp the component to be inserted
						 *            before
						 */
						insertBeforeSubComponent : function(subComp, beforeComp) {
							if (subComp && beforeComp) {
								if (subComp._superComp === undefined) {
									var newKey = subComp.id();
									var beforeKey = beforeComp.id();
									if (this._subComps.has(beforeKey) && newKey !== beforeKey) {
										subComp._superComp = this;
										this._subComps.insertBefore(newKey, subComp, beforeKey);
										subComp._container.before(beforeComp._container);
										if (this._attached) {
											subComp._markAttached_();
										}
									}
								} else {
									throw new Error('The component already has a parent component');
								}
							}
						},
						/**
						 * Insert a component as a child component after other
						 * component, the visibility related events and
						 * call-back methods will get triggered on the component
						 * tree rooted at the detached component, if the
						 * component in the tree is visible.
						 * 
						 * @name sap.viz.mvc.UIComponent#insertAfterSubComponent
						 * @function
						 * @param {sap.viz.mvc.UIComponent}
						 *            subComp the component to insert
						 * @param {sap.viz.mvc.UIComponent}
						 *            afterComp the component to be inserted
						 *            before
						 */
						insertAfterSubComponent : function(subComp, afterComp) {
							if (subComp && afterComp) {
								if (subComp._superComp === undefined) {
									var newKey = subComp.id();
									var afterKey = afterComp.id();
									if (this._subComps.has(afterKey) && newKey !== afterKey) {
										subComp._superComp = this;
										this._subComps.insertAfter(newKey, subComp, afterKey);
										subComp._container.after(afterComp._container);
										if (this._attached) {
											subComp._markAttached_();
										}
									}
								} else {
									throw new Error('The component already has a parent component');
								}
							}
						},
						/**
						 * Bring the sub component to the front of other sub
						 * components
						 * 
						 * @name sap.viz.mvc.UIComponent#bringToFront
						 * @function
						 * @param {sap.viz.mvc.UIComponent}
						 *            subComp the sub component to move
						 */
						bringToFront : function(subComp) {
							if (subComp && this._subComps.has(subComp.id())
									&& this._subComps.getLastInsert().id() !== subComp.id()) {
								this._subComps.moveToLast(subComp.id());
								subComp._container.detach();
								this._container.append(subComp._container);
							}
						},
						/**
						 * Send the sub component to the back of other sub
						 * component
						 * 
						 * @name sap.viz.mvc.UIComponent#sendToBack
						 * @function
						 * @param {sap.viz.mvc.UIComponent}
						 *            subComp the sub component to move
						 */
						sendToBack : function(subComp) {
							if (subComp && this._subComps.has(subComp.id())
									&& this._subComps.getFirstInsert().id() !== subComp.id()) {
								this._subComps.moveToFirst(subComp.id());
								subComp._container.detach();
								this._container.prepend(subComp._container);
							}
						},

						/**
						 * Convert the point in parent's coordinate system to
						 * local point
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointFromSuper
						 * @function
						 * @param {Object}
						 *            pointInSuper
						 * @returns {Object}
						 */
						convertPointFromSuper : function(pointInSuper) {
							var frame = this.frame();
							return {
								x : pointInSuper.x - frame.x,
								y : pointInSuper.y - frame.y
							};
						},
						/**
						 * Convert the point to point in parent's coordinate
						 * system
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointToSuper
						 * @function
						 * @param {Object}
						 *            pointInLocal
						 * @returns {Object}
						 */
						convertPointToSuper : function(pointInLocal) {
							var frame = this.frame();
							return {
								x : pointInLocal.x + frame.x,
								y : pointInLocal.y + frame.y
							};
						},
						/**
						 * Convert the point in global coordinate system to
						 * local point
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointFromGlobal
						 * @function
						 * @param {Object}
						 *            globalPoint
						 * @returns {Object}
						 */
						convertPointFromGlobal : function(globalPoint) {
							var path = [ this ];
							var currentLevel = this;
							var pointInProgress = globalPoint;
							while (currentLevel._superComp) {
								path.push(currentLevel._superComp);
								currentLevel = currentLevel._superComp;
							}
							while (path.length) {
								currentLevel = path.pop();
								pointInProgress = currentLevel.convertPointFromSuper(pointInProgress);
							}
							return pointInProgress;
						},

						/**
						 * Convert the point to point in global coordinate
						 * system
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointToGlobal
						 * @function
						 * @param {Object}
						 *            pointInLocal
						 * @returns {Object}
						 */
						convertPointToGlobal : function(pointInLocal) {
							var currentLevel = this;
							var pointInProgress = pointInLocal;
							while (currentLevel) {
								pointInProgress = currentLevel.convertPointToSuper(pointInProgress);
								currentLevel = currentLevel._superComp;
							}
							return pointInProgress;
						},

						/**
						 * Convert the point in source component's coordinate
						 * system to local coordinate system. Two components
						 * should rooted at same component.
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointFromComp
						 * @function
						 * @param {Object}
						 *            pointInSourceComp
						 * @param {sap.viz.mvc.UIComponent}
						 *            sourceComp
						 * @returns {Object}
						 */
						convertPointFromComp : function(pointInSourceComp, sourceComp) {
							return this.convertPointFromGlobal(sourceComp.convertPointToGlobal(pointInSourceComp));
						},

						/**
						 * Convert the point in local coordinate system to
						 * target Component's coordinate system. Two components
						 * should rooted at same component.
						 * 
						 * @name sap.viz.mvc.UIComponent#convertPointToComp
						 * @function
						 * @param {Object}
						 *            pointInLocal
						 * @param {sap.viz.mvc.UIComponent}
						 *            targetComp
						 * @returns {Object}
						 */
						convertPointToComp : function(pointInLocal, targetComp) {
							return targetComp.convertPointFromGlobal(this.convertPointToGlobal(pointInLocal));
						},

						_resizeSubComp : function(subComp, oldsize, newsize) {
							var origFrame = subComp.frame();
							var x = origFrame.x, y = origFrame.y, width = origFrame.width, height = origFrame.height;
							var ml = x, mr = oldsize.width - x - width, mt = y, mb = oldsize.height - y - height;
							var wdiff = newsize.width - oldsize.width, hdiff = newsize.height - oldsize.height;
							var arMask = subComp._autoresizingMask;
							var horizontalMask = ar.FlexibleLeftMargin | ar.FlexibleWidth | ar.FlexibleRightMargin;
							var verticalMask = ar.FlexibleTopMargin | ar.FlexibleHeight | ar.FlexibleBottomMargin;
							switch (arMask & horizontalMask) {
							case ar.None:
								if (ml !== 0) {
									x += wdiff * ml / (ml + mr);
								}
								break;
							case ar.FlexibleLeftMargin:
								x += wdiff;
								break;
							case ar.FlexibleLeftMargin | ar.FlexibleRightMargin:
							case ar.FlexibleRightMargin:
								break;
							case ar.FlexibleWidth:
								width += wdiff;
								break;
							case ar.FlexibleLeftMargin | ar.FlexibleWidth:
								if (width !== 0) {
									x += wdiff * ml / (ml + width);
									width += wdiff * width / (ml + width);
								}
								break;
							case ar.FlexibleRightMargin | ar.FlexibleWidth:
								if (width !== 0) {
									width += wdiff * width / (mr + width);
								}
								break;
							case ar.FlexibleLeftMargin | ar.FlexibleWidth | ar.FlexibleRightMargin:
								if (oldsize.width !== 0) {
									var r = wdiff / oldsize.width;
									x += x * r;
									width += width * r;
								}
								break;
							}
							switch (arMask & verticalMask) {
							case ar.None:
								if (mt !== 0) {
									y += hdiff * mt / (mt + mb);
								}
								break;
							case ar.FlexibleTopMargin:
								y += hdiff;
								break;
							case ar.FlexibleTopMargin | ar.FlexibleBottomMargin:
							case ar.FlexibleBottomMargin:
								break;
							case ar.FlexibleHeight:
								height += hdiff;
								break;
							case ar.FlexibleTopMargin | ar.FlexibleHeight:
								if (height !== 0) {
									y += hdiff * mt / (mt + height);
									height += hdiff * height / (mt + height);
								}
								break;
							case ar.FlexibleBottomMargin | ar.FlexibleHeight:
								if (height != 0) {
									height += hdiff * height / (mb + height);
								}
								break;
							case ar.FlexibleTopMargin | ar.FlexibleHeight | ar.FlexibleBottomMargin:
								if (oldsize.height) {
									var r = hdiff / oldsize.height;
									y += y * r;
									height += height * r;
								}
								break;
							}
							return {
								x : x,
								y : y,
								height : height,
								width : width
							};
						},

						_layout : function(oldsize, newsize) {
							if (this._autoresizeSubComponents) {
								var subCompItr = this._subComps.getIterator();
								var subComp, newFrame;
								while (subCompItr.hasMore()) {
									subComp = subCompItr.next().value;
									newFrame = this._resizeSubComp(subComp, oldsize, newsize);
									subComp.frame(newFrame);
								}
							} else if (this.doLayout != FuncUtils.noop && this.doLayout !== undefined) {
								this.doLayout();
							}
						},

						_fireEvent_ : function(event) {
							this.fireEvent(event.type(), event);
							if (this._superComp && event.shouldBubble()) {
								event._setCurrentTarget_(this._superComp);
								this._superComp._fireEvent_(event);
							}
						},

						_fireMouseEvent_ : function(event) {
							this.fireEvent(event.type(), event);
							if (this._superComp && event.shouldBubble()) {
								event._setCurrentTarget_(this._superComp);
								event._setCurrentLocalXY_({
									x : event.currentLocalXY().x + this._position.x - this._anchorPoint.x
											* this._bounds.width,
									y : event.currentLocalXY().y + this._position.y - this._anchorPoint.y
											* this._bounds.height
								});
								this._superComp._fireMouseEvent_(event);
							}
						},

						_fireTouchEvent_ : function(event) {
							this.fireEvent(event.type(), event);
							if (this._superComp && event.shouldBubble()) {
								event._setCurrentTarget_(this._superComp);
								this._superComp._fireTouchEvent_(event);
							}
						},

						/**
						 * Remove all listeners currently attached to the
						 * component
						 * 
						 * @name sap.viz.mvc.UIComponent#purgeListeners
						 * @function
						 */
						purgeListeners : function() {
							this.callParent('purgeListeners');
							this._registerMandatoryHandler();
						},
						/**
						 * Remove all listeners currently listening on the given
						 * event
						 * 
						 * @name sap.viz.mvc.UIComponent#removeAllListeners
						 * @function
						 * @param {String}
						 *            eventName
						 */
						removeAllListeners : function(eventName) {
							this.callParent('removeAllListeners', eventName);
							switch (eventName) {
							case 'sizeChanged':
								this.on({
									eventName : 'sizeChanged',
									listener : this._updateContainerSize,
									scope : this
								});
								break;
							case 'heightChanged':
								this.on({
									eventName : 'heightChanged',
									listener : this._updateContainerHeight,
									scope : this
								});
								break;
							case 'widthChanged':
								this.on({
									eventName : 'widthChanged',
									listener : this._updateContainerWidth,
									scope : this
								});
								break;
							case 'positionChanged':
								this.on({
									eventName : 'positionChanged',
									listener : this._updateContainerPos,
									scope : this
								});
								break;
							case 'anchorChanged':
								this.on({
									eventName : 'anchorChanged',
									listener : this._updateContainerAnchor,
									scope : this
								});
								break;
							}
						},
						/**
						 * Add a gesture detector to this component
						 * 
						 * @name sap.viz.mvc.UIComponent#addGestureDetector
						 * @function
						 * @param {sap.viz.mvc.GestureDetector}
						 *            detector
						 */
						addGestureDetector : function(detector) {
							if (detector !== undefined) {
								detector._setOwnerComp_(this);
								this._gestureDetectors.push(detector);
							}
						},
						/**
						 * remove a previously added gesture detector to this
						 * component
						 * 
						 * @name sap.viz.mvc.UIComponent#addGestureDetector
						 * @function
						 * @param {sap.viz.mvc.GestureDetector}
						 *            detector
						 */
						removeGestureDetector : function(detector) {
							for ( var i = 0, len = this._gestureDetectors.length; i < len; i++) {
								if (this._gestureDetectors[i] === detector) {
									this._gestureDetectors.splice(i, 1);
									detector._setOwnerComp_(undefined);
									len--;
								}
							}
						},

						/**
						 * Returns the farthest descendant uicomponent in the
						 * hierarchy rooted at this component, that contains the
						 * specified point.
						 * 
						 * @name sap.viz.mvc.UIComponent#hitTest
						 * @param {POINT}
						 *            localXY
						 * @returns {sap.viz.mvc.UIComponent#}
						 */
						hitTest : function(localXY) {
							var pStack = [ {
								comp : this,
								pointInLocal : localXY,
								subCompsItr : this._subComps.getIterator(true)
							} ];
							var levelInTest, localPoint, comp, subCompsItr;
							while (pStack.length) {
								levelInTest = pStack[pStack.length - 1];
								comp = levelInTest.comp;
								localPoint = levelInTest.pointInLocal;
								subCompsItr = levelInTest.subCompsItr;
								if (comp.visibility()) {
									if (subCompsItr.hasMore()) {
										var subComp = subCompsItr.next().value;
										pStack.push({
											comp : subComp,
											pointInLocal : subComp.convertPointFromSuper(localPoint),
											subCompsItr : subComp._subComps.getIterator(true)
										});
										continue;
									} else if (comp.containsPoint(localPoint)) {
										// find the top layer which contains the
										// point and can
										// respond to event
										return comp;
									}
									pStack.pop();
								} else {
									pStack.pop();
								}
							}
						},

						/**
						 * Test whether the given local point(point in local
						 * coordinate system) is contained in the component's
						 * boundary
						 * 
						 * @name sap.viz.mvc.UIComponent#containsPoint
						 * @function
						 * @param {Object}
						 *            localPoint the point to test
						 * @returns {Boolean}
						 */
						containsPoint : function(localPoint) {
							var bounds = this.bounds();
							return localPoint.x >= bounds.x && localPoint.x <= (bounds.x + bounds.width)
									&& localPoint.y >= bounds.y && localPoint.y <= (bounds.y + bounds.height);
						},

						printTo : function(drawingCtx) {
							drawingCtx.clearRect(0, 0, this._bounds.width, this._bounds.height);
							this.doPrint(drawingCtx);
						},

						/**
						 * Implement this method to do adhoc sub-components
						 * layout, this method will be called on super component
						 * when its size changed.
						 * 
						 * @name sap.viz.mvc.UIComponent#doLayout
						 * @function
						 */
						doLayout : FuncUtils.noop,

						/**
						 * Resize component's visual content, when the
						 * component's size changed, this method will be invoked
						 * before layout sub components
						 * 
						 * @name sap.viz.mvc.UIComponent#doContentResize
						 * @function
						 * @param {Object}
						 *            os the old size of the component
						 * @param {Object}
						 *            ns the new size of the component
						 */
						doContentResize : FuncUtils.noop,

						/**
						 * Print the component visual content into the passed-in
						 * drawing context
						 * 
						 * @name sap.viz.mvc.UIComponent#doPrint
						 * @function
						 * @param {sap.viz.graphic.DrawingContext}
						 */
						doPrint : FuncUtils.noop,

						/**
						 * This method will get called before the component
						 * becoming hidden
						 * 
						 * @name sap.viz.mvc.UIComponent#doBeforeHide
						 * @function
						 */
						doBeforeHide : FuncUtils.noop,
						/**
						 * This method will get called after the component is
						 * hided
						 * 
						 * @name sap.viz.mvc.UIComponent#doAfterHide
						 * @function
						 */
						doAfterHide : FuncUtils.noop,
						/**
						 * This method will get called before the component
						 * becoming visible
						 * 
						 * @name sap.viz.mvc.UIComponent#doBeforeShow
						 * @function
						 */
						doBeforeShow : FuncUtils.noop,
						/**
						 * This method will get called after the component is
						 * visible
						 * 
						 * @name sap.viz.mvc.UIComponent#doAfterShow
						 * @function
						 */
						doAfterShow : FuncUtils.noop
					});
	UIComponent.Autosizing = ar;
	return UIComponent;
});