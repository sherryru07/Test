sap.riv.module(
{
  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.XCFormat',
  version : '4.0.0'
},
{  qname : 'sap.viz.Locale',
  version : '4.0.0'
}
],
function Setup(TypeUtil, XCFormat, Locale) {

	var locale = 'en', formatUtil = XCFormat, props = null;
	
	var FM = 
		 /** @lends sap.viz.format.FormatManager */
	{
			 /**
		       * @constructs
		      */
			constructor : function(){
				return;
			},
			
			/**
		       * Apply a locale
		       * 
		       * @param {String}
		       * 			locale
		       * 
		       * @returns {Object} {@link sap.viz.format.FormatManager}
		       */
			apply : function(_){
				locale = _;
				formatUtil.locale(locale);
			},
			
			/**
		       * format a string
		       * 
		       * @param {String}
		       * 			value
		       * 
		       * @param {String}
		       * 			pattern
		       * 
		       * @returns {Object} {@link sap.viz.format.FormatManager}
		       */
			format : function(value, pattern){
				return formatUtil.format(value, pattern);
			},
			
			/**
		       * set/get format function
		       * 
		       * @param {Function}
		       * 			func
		       * 
		       * @returns {Object} {@link sap.viz.format.FormatManager}
		       */
			formatFunc : function(_){
				if(!arguments.length){
					return formatUtil;
				}
				formatUtil = _;
			},
			
			/**
		     * default data time format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_DATE_TIME : formatUtil.DEFAULT_FORMAT_DATE_TIME,
			/**
		     * default time format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_TIME : formatUtil.DEFAULT_FORMAT_TIME,
			/**
		     * default short data format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_SHORT_DATE : formatUtil.DEFAULT_FORMAT_SHORT_DATE,
			/**
		     * default long data format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_LONG_DATE : formatUtil.DEFAULT_FORMAT_LONG_DATE,
			/**
		     * default number format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_NUMBER : formatUtil.DEFAULT_FORMAT_NUMBER,
			/**
		     * default boolean format. It will changed by locale. 
		    */
			DEFAULT_FORMAT_BOOLEAN : formatUtil.DEFAULT_FORMAT_BOOLEAN
	};
	
	Locale.addListener({
		fn:function(locale){
			FM.apply(locale);
		},
		scope: FM
	});
	
	return FM;
});