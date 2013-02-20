sap.riv.module(
{
  qname : 'sap.viz.format.XCFormat',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
}
],
function Setup(Objects) {
	
	var NF = {
			format: function(value){
				return value;
			},
			locale: function(){
				
			},
			DEFAULT_FORMAT_DATE_TIME : '',
			DEFAULT_FORMAT_TIME : '',
			DEFAULT_FORMAT_SHORT_DATE : '',
			DEFAULT_FORMAT_LONG_DATE : '',
			DEFAULT_FORMAT_NUMBER : '',
			DEFAULT_FORMAT_BOOLEAN : ''
	}, snf = null, locale = 'en';
	
	if(sap && sap.common && sap.common.globalization && sap.common.globalization.NumericFormatManager){
		snf = sap.common.globalization.NumericFormatManager;
		
		NF = Objects.extend( true, NF, {
			
			format : function(value, pattern){
				return snf.formatToText(value, pattern, true); // we always try to convert number to string
			},
			
			locale : function(_){
				if(!arguments.length){
					return locale;
				}
				locale = _;
				snf.setPVL(locale);
				
				//reset default format string
				NF.DEFAULT_FORMAT_DATE_TIME = snf.DEFAULT_FORMAT_DATE_TIME;
				NF.DEFAULT_FORMAT_TIME = snf.DEFAULT_FORMAT_TIME;
				NF.DEFAULT_FORMAT_SHORT_DATE = snf.DEFAULT_FORMAT_SHORT_DATE;
				NF.DEFAULT_FORMAT_LONG_DATE = snf.DEFAULT_FORMAT_LONG_DATE;
				NF.DEFAULT_FORMAT_NUMBER = snf.DEFAULT_FORMAT_NUMBER;
				NF.DEFAULT_FORMAT_BOOLEAN = snf.DEFAULT_FORMAT_BOOLEAN;
			},
			
			DEFAULT_FORMAT_DATE_TIME : snf.DEFAULT_FORMAT_DATE_TIME,
			DEFAULT_FORMAT_TIME : snf.DEFAULT_FORMAT_TIME,
			DEFAULT_FORMAT_SHORT_DATE : snf.DEFAULT_FORMAT_SHORT_DATE,
			DEFAULT_FORMAT_LONG_DATE : snf.DEFAULT_FORMAT_LONG_DATE,
			DEFAULT_FORMAT_NUMBER : snf.DEFAULT_FORMAT_NUMBER,
			DEFAULT_FORMAT_BOOLEAN : snf.DEFAULT_FORMAT_BOOLEAN
			
		});
	}
	
	return NF;
});