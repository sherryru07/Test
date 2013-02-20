sap.riv.module(
{
  qname : 'sap.viz.mvc.VizApplication',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.Observable',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.ImageManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.VizFrame',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.UIComponent',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Logger',
  version : '4.0.0'
}
],
function Setup(Observable, FuncUtils, ObjectUtils, ImageManager, VizFrame, UIComponent, LOG) {

	var id = 0;
	function nextId() {
		return id++;
	}
	var Autosizing = UIComponent.Autosizing;
	var $ = jQuery;
	if (!$) {
		FuncUtils.error('Cannot find jQuery');
	}
	/**
	 * The main entry of a given visualization application. It implements most
	 * of the things that need to start a viz application, e.g. bootstrapping,
	 * preload images
	 * 
	 * @name sap.viz.mvc.VizApplication
	 * @constructor
	 * @param {Object}
	 *            options the options that needs to start the application
	 * @param {String}
	 *            options.wrapperDivEl the wrapper DIV element
	 * @param {Constructor}
	 *            options.delegateClass the constructor of your custom viz app
	 *            delegate
	 * @param {Object}
	 *            [launchOption] the additional option that will pass to the
	 *            {@link sap.viz.mvc.VizAppDelegate#appDidFinishLaunching}
	 */
	var VizApplication = function(options) {
		var _nextId = nextId();
		this._id = options.id ? options.id + '_' + _nextId : _nextId;
		LOG.debug("Chart Application[" + this._id + "] initializing.", "perf");
		if (!options.delegateClass) {
			FuncUtils.error('You have to specify a delegate for visualization custom behavior.');
		}
		if (!options.wrapperDivEl) {
			FuncUtils.error('You have to specify a div element for holding the visualization.');
		}
		this._vizFrame = new VizFrame({
			container : options.wrapperDivEl
		});
		//this._canvasForPrinting = CanvasHelper.createCanvasElement(1, 1);
		this._delegate = new options.delegateClass();
		var assets = this._delegate.getPreloadAssets();
		ImageManager.loadImages(assets, undefined, ObjectUtils.proxy(function() {
			this._delegate._afterLaunched(this, options.launchOption);
		}, this));
		var comsItr = this._vizFrame.subComponents().getIterator();
		while (comsItr.hasMore()) {
			LOG.debug("application[" + this._id + "]" + "component[" + comsItr.nextValue().id() + "] initialized.",
					"perf");
		}
		this._eventBridge = new Observable();
		this._addEvents(this._delegate.getSupportedEvents());

	};

	var ap = VizApplication.prototype;

	ap.id = function() {
		return this._id;
	};

	/**
	 * Get and set the size of the application
	 * 
	 * @name sap.viz.mvc.VizApplication#size
	 * @param {undefined|Object}
	 *            size undefined or new size of the application
	 * @returns {this|Object} when set the size the return is this object, when
	 *          get the size the return will be the size
	 * 
	 */
	ap.size = function(size) {
		if (size !== undefined) {
			this._vizFrame.size(size);
			return this;
		} else {
			return this._vizFrame.size();
		}
	};

	/**
	 * Get and set the visibility of the application
	 * 
	 * @name sap.viz.mvc.VizApplication#hidden
	 * @param {undefined|Boolean}
	 *            hidden undefined or boolean value indicating whether the
	 *            application should be hided.
	 * @returns {this|Object} when set the hidden status the return is this
	 *          object, when get the hidden status the return will be the
	 *          current hidden status.
	 * 
	 */
	ap.hidden = function(hidden) {
		if (hidden !== undefined) {
			if (this._vizFrame.hidden() !== hidden) {
				this._vizFrame.hidden(hidden);
			}
			return this;
		} else {
			return this._vizFrame.hidden();
		}
	};
	/**
	 * Get a list of event names the current visualization instance supports
	 * 
	 * @name sap.viz.mvc.VizApplication#getSupportedEvent
	 * @returns {Array} an array of event names supported
	 * 
	 */
	ap.getSupportedEvent = function() {
		return this._eventBridge.getSupportedEvents();
	};
	/**
	 * Add a listener to the supported event
	 * 
	 * @name sap.viz.mvc.VizApplication#addListener
	 * @param {String}
	 *            event the event to listen
	 * @param {Function}
	 *            listener the function to be called back when event occurs
	 * 
	 */
	ap.addListener = function(event, listener) {
		this._eventBridge.addListeners({
			eventName : event,
			listener : listener
		});
	};
	/**
	 * Remove an existing listener
	 * 
	 * @name sap.viz.mvc.VizApplication#removeListener
	 * @param {String}
	 *            event the event to listen
	 * @param {Function}
	 *            listener the existing function to be removed
	 * 
	 */
	ap.removeListener = function(event, listener) {
		this._eventBridge.removeListener(event, listener);
	};

	ap._addEvents = function(events) {
		for ( var i = 0, len = events.length; i < len; i++) {
			this._eventBridge.addEvents(events[i]);
		}
	};

	ap._fireEvent = function() {
		this._eventBridge.fireEvent.apply(this._eventBridge, arguments);
	};

	/**
	 * Get a list of public method names the current visualization instance
	 * supports
	 * 
	 * @name sap.viz.mvc.VizApplication#getPublicMethods
	 * @returns {Array} an array of public method names supported
	 * 
	 */
	ap.getPublicMethods = function() {
		return this._delegate.getSupportedMethods();
	};
	/**
	 * Invoke the public method of the current visualization with options
	 * 
	 * @name sap.viz.mvc.VizApplication#invokePublicMethod
	 * @param {String}
	 *            publicMethodName, the name of the public method.
	 * @param {Object}
	 *            [options] the options object is passed as argument.
	 */
	ap.invokePublicMethod = function(publicMethodName, options) {
		return this._delegate._invokePublicMethod(publicMethodName, options);
	};
	/**
	 * Apply a new theme to the visualization instance
	 * 
	 * @name sap.viz.mvc.VizApplication#applyTheme
	 * @deprecated
	 * @param {String}
	 *            theme, the name of the theme.
	 */
	ap.applyTheme = function(theme) {
		this._delegate._applyTheme(theme);
	};

	/**
	 * Get or set the properties of the current visualization instance.
	 * 
	 * @name sap.viz.mvc.VizApplication#properties
	 * @param {Object}
	 *            [propBag]
	 * @returns {Object}
	 */
	ap.properties = function(propBag) {
		if (propBag !== undefined) {
			this._delegate.updateProperties(propBag);
		}
		return this._delegate.getProperties();
	};

	/**
	 * Update dataset after chart created
	 * 
	 * @name sap.viz.mvc.VizApplication#setDataset
	 * @param {Object}
	 */
	ap.setDataset = function(dataset) {
		if (dataset) {
			this._delegate.setDataset(dataset);
		}
	};
	
	ap.getDataset = function() {
        return this._delegate.getDataset();
    };

	ap._setRootController = function(rootController) {
		if (rootController) {
			var rootUIComp = rootController.rootUIComponent();
			rootUIComp.frame(this._vizFrame.bounds());
			rootUIComp.autoresizingMask(Autosizing.FlexibleWidth | Autosizing.FlexibleHeight);
			this._vizFrame.addSubComponent(rootUIComp);
		}
	};

	return VizApplication;
});