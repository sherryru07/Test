sap.riv.module(
{
  qname : 'sap.viz.mvc.UIController',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.UIComponent',
  version : '4.0.0'
}
],
function Setup(FuncUtils, UIComponent) {
	/**
	 * The base class of Controller in VizKit MVC framework
	 * 
	 * @name sap.viz.mvc.UIController
	 * @constructor
	 * @param {Object}
	 *            options any arguments you want to pass in when initialize your
	 *            concrete subclass of controller
	 */
	var controller = function(options) {
		this._defaultWidth = 5;
		this._defaultHeight = 5;
		this._app;
		this._uiComp;
//		ThemeManager.on({
//			eventName : 'themechanged',
//			listener : this.doThemeChanged,
//			scope : this
//		});
	};

	var cp = controller.prototype;

	/**
	 * Return the root component of the hierarchy that this controller manages
	 * 
	 * @name sap.viz.mvc.UIController#rootUIComponent
	 * @function
	 * @returns {sap.viz.mvc.UIComponent}
	 */
	cp.rootUIComponent = function() {
		if (!this._uiComp) {
			this._uiComp = this.initUIComponent(this._defaultWidth, this._defaultHeight);
			this._uiComp.on({
				eventName : 'beforeShow',
				listener : this._handleBeforeShow,
				scope : this
			});
			this._uiComp.on({
				eventName : 'beforeHide',
				listener : this._handleBeforeHide,
				scope : this
			});
			this._uiComp.on({
				eventName : 'afterShow',
				listener : this._handleAfterShow,
				scope : this
			});
			this._uiComp.on({
				eventName : 'afterHide',
				listener : this._handleAfterHide,
				scope : this
			});
			this.afterUIComponentLoaded();
		}
		return this._uiComp;
	};

	cp._handleBeforeHide = function(hide) {
		this.beforeUIComponentDisappear();
	};

	cp._handleBeforeShow = function(hide) {
		this.beforeUIComponentAppear();
	};

	cp._handleAfterHide = function(hide) {
		this.afterUIComponentDisappear();
	};

	cp._handleAfterShow = function(hide) {
		this.afterUIComponentAppear();
	};

	cp._setApplication_ = function(application) {
		this._app = application;
	};

	/**
	 * Get the application instance
	 * 
	 * @name sap.viz.mvc.UIController#getApplication
	 * @function
	 * @returns {sap.viz.mvc.VizApplication}
	 */
	cp.getApplication = function() {
		return this._app;
	};
	/**
	 * Fire the event supported by application which is declared in
	 * {@link sap.viz.mvc.VizAppDelegate#getSupportedEvents}
	 * 
	 * @name sap.viz.mvc.UIController#fireAppEvent
	 * @function
	 */
	cp.fireAppEvent = function(event, arguments) {
		this._app._fireEvent(event, arguments);
	};

	/**
	 * Subclass should override this method to initialize its own UIComponent
	 * hierarchy and return the root UIComponent. The default implementation
	 * creates an empty UIComponent
	 * 
	 * @name sap.viz.mvc.UIController#initUIComponent
	 * @function
	 * @param {Number}
	 *            initWidth the initial width of the root component
	 * @param {Number}
	 *            initHeight the initial height of the root component
	 * 
	 */
	cp.initUIComponent = function(initWidth, initHeight) {
		return new UIComponent({
			size : {
				w : initWidth,
				h : initHeight
			}
		});
	};

	/**
	 * This method will be called after the root UIComponent initialized
	 * 
	 * @name sap.viz.mvc.UIController#afterUIComponentLoaded
	 * @function
	 */
	cp.afterUIComponentLoaded = FuncUtils.noop;

	/**
	 * This method will be called when the managed UIComponent will become
	 * visible via set the hidden property
	 * 
	 * @name sap.viz.mvc.UIController#beforeUIComponentAppear
	 * @function
	 */
	cp.beforeUIComponentAppear = FuncUtils.noop;

	/**
	 * This method will be called after the managed UIComponent became visible
	 * via set the hidden property
	 * 
	 * @name sap.viz.mvc.UIController#afterUIComponentAppear
	 * @function
	 */
	cp.afterUIComponentAppear = FuncUtils.noop;
	/**
	 * This method will be called when the managed UIComponent will become
	 * visible via set the hidden property
	 * 
	 * @name sap.viz.mvc.UIController#beforeUIComponentDisappear
	 * @function
	 */
	cp.beforeUIComponentDisappear = FuncUtils.noop;
	/**
	 * This method will be called after the managed UIComponent became visible
	 * via set the hidden property
	 * 
	 * @name sap.viz.mvc.UIController#afterUIComponentDisappear
	 * @function
	 */
	cp.afterUIComponentDisappear = FuncUtils.noop;

	/**
	 * This method will be called when user apply a new theme, and if and only
	 * if the controller is the root controller.
	 * 
	 * @name sap.viz.mvc.UIController#doThemeApplied
	 * @function
	 * @deprecated
	 * @param {String}
	 *            old the name of the old theme
	 * @param {String}
	 *            new the name of the new theme
	 */
	cp.doThemeApplied = FuncUtils.noop;

	/**
	 * This method will be called when user update the theme setting and if and
	 * only if the controller is the root controller.
	 * 
	 * @name sap.viz.mvc.UIController#doThemeUpdated
	 * @function
	 * @deprecated
	 * @param {String}
	 *            key the key of the updated property
	 * @param {Object}
	 *            oldValue the old value
	 * @param {Object}
	 *            newValue the new value
	 */
	cp.doThemeUpdated = FuncUtils.noop;
	/**
	 * This method will be called when user changes to another theme through 
	 * ThemeManager
	 * @name sap.viz.mvc.UIController#doThemeChanged
	 * @function
	 */
	cp.doThemeChanged = FuncUtils.noop;
	return controller;
});