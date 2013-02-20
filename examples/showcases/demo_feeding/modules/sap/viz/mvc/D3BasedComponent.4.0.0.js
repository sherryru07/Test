sap.riv.module(
{
  qname : 'sap.viz.mvc.D3BasedComponent',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.UIComponent',
  version : '4.0.0'
}
],
function Setup(ObjUtils, FuncUtils, UIComponent) {
	if (!d3) {
		FuncUtils.error('D3 cannot be found');
	}
	var initD3Root = function() {
		var width = this.width();
		var height = this.height();
		this._d3Root = d3.select(this._container[0]).append('svg').attr('width', width).attr('height', height);
	};
	/**
	 * This component initializes a SVG element acting as the root element for
	 * d3 based development.
	 * 
	 * @name sap.viz.mvc.D3BasedComponent
	 * @class
	 * @augments sap.viz.mvc.UIComponent
	 */
	var D3BasedComponent = ObjUtils.derive(UIComponent,
	/**
	 * @lends sap.viz.mvc.D3BasedComponent
	 */
	{
		constructor : function(options) {
			initD3Root.call(this);
		},

		doContentResize : function(oldSize, newSize) {
			if (oldSize.width !== newSize.width) {
				this._d3Root.attr('width', newSize.width);
			}
			if (oldSize.height !== newSize.height) {
				this._d3Root.attr('height', newSize.height);
			}
		},

		/**
		 * Returns the d3 container of the component, subclass should use this
		 * as the root container in d3 development
		 * 
		 * @final
		 * @name sap.viz.mvc.D3BasedComponent#getD3Root
		 * @function
		 * @returns {sap.viz.graphics.Canvas2DSurface}
		 */
		getD3Root : function() {
			return this._d3Root;
		}
	});
	return D3BasedComponent;
});