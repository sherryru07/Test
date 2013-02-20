sap.riv.module(
{
  qname : 'sap.viz.mvc.VizAppDelegate',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(FuncUtils) {
	/**
	 * The abstract application delegate class. Application delegate is used to
	 * plug in your specific application logic. The object is created by
	 * VizApplication automatically
	 * 
	 * @name sap.viz.mvc.VizAppDelegate
	 * @constructor
	 */
	var VizAppDelegate = function() {
		this._publicMethodsRegistry = {};
		//this._theme = ThemeManager.defaultTheme();
		this._application;
	};

	var vp = VizAppDelegate.prototype;

	vp._afterLaunched = function(application, launchOption) {
		this._application = application;
		this.appDidFinishLaunching(application, launchOption);
		var rootController = this.rootController();
		rootController._setApplication_(this._application);
		this._application._setRootController(rootController);
	};

	/**
	 * This method will be called after the application fully launched, the
	 * Application will pass launchOption (if any) to this method. Any
	 * application specific initialization should be put here, e.g. initialize
	 * necessary data structure.
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#appDidFinishLaunching
	 * @function
	 * @param {Object}
	 *            launchOption the launchOption which is passed in
	 *            VizApplication constructor
	 */
	vp.appDidFinishLaunching = FuncUtils.noop;

	/**
	 * Subclass <b>MUST</b> implement this method to return the root controller
	 * of the application
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#rootController
	 * @return {sap.viz.mvc.UIController}
	 */
	vp.rootController = FuncUtils.unimplemented;

	/**
	 * This method is used to register any method specific to the current
	 * visualization implementation, and exposed to the consumer. This method is
	 * expected to be called during initialization phase, like in
	 * appDidFinishLaunching. The 'this' object of the function during invoking
	 * will be pointing to delegate object.
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#registerPublicMethod
	 * @param {String}
	 *            methodName the name of the method to be exposed
	 * @param {Function}
	 *            func the function of the method.
	 */
	vp.registerPublicMethod = function(methodName, func) {
		this._publicMethodsRegistry[methodName] = func;
	};

	vp._invokePublicMethod = function(publicMethodName, options) {
		if (this._publicMethodsRegistry.hasOwnProperty(publicMethodName)) {
			return this._publicMethodsRegistry[publicMethodName].call(this, options);
		}
	};

	vp._currentTheme = function() {
		return this._theme;
	};

	vp._applyTheme = function(theme) {
		if (this._theme !== theme) {
			this.rootController().doThemeApplied(theme);
		}
	};

	vp._updateThemeSetting = function(theme, key, oldValue, newValue) {
		if (this._theme === theme) {
			this.rootController().doThemeUpdated(key, oldValue, newValue);
		}
	};
	/**
	 * Subclass should implement this method to return plain object contains all
	 * of the modifiable properties and their current value.
	 * 
	 * 
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#getProperties
	 * 
	 * @returns {Object} property bag
	 * 
	 */
	vp.getProperties = function() {
		return {};
	};

	/**
	 * Subclass should implement this method to accept a property bag.
	 * 
	 * 
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#updateProperties
	 * @param {Object}
	 *            propBag
	 * 
	 */
	vp.updateProperties = FuncUtils.noop;

	/**
	 * Subclass should implement this method to accept a dataset.
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#setDataset
	 * @param {Object}
	 */
	vp.setDataset = FuncUtils.noop;
	
	/**
     * Subclass should implement this method to get dataset.
     * 
     * @name sap.viz.mvc.VizAppDelegate#getDataset
     * 
     * @returns {Object} dataset
     */
    vp.getDataset = FuncUtils.noop;

	/**
	 * Subclass should implement this method to return a list of assets(only
	 * image supported) to be preload.
	 * 
	 * 
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#getPreloadAssets
	 * 
	 * @returns {[]} the item in the array should follow below structure
	 * 
	 * <pre>
	 * [ {
	 * 	id : 'IMAGE_ID',
	 * 	url : 'IMAGE_URL'
	 * } ]
	 * </pre>
	 */
	vp.getPreloadAssets = function() {
		return [];
	};
	/**
	 * Subclass should implement this method to return a list of supported
	 * events that could be listened by visualization user.
	 * 
	 * 
	 * 
	 * @name sap.viz.mvc.VizAppDelegate#getSupportedEvents
	 * 
	 * @returns {[]} the list of event names
	 * 
	 */
	vp.getSupportedEvents = function() {
		return [];
	};

	vp.getSupportedMethods = function() {
		var ret = [];
		for ( var p in this._publicMethodsRegistry) {
			ret.push(p);
		}
		return ret;
	};
	return VizAppDelegate;
});