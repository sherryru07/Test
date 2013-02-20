sap.riv.module(
{
  qname : 'sap.viz.Locale',
  version : '4.0.0',
  exported : true
},
[

],
function Setup(LangManager, FormatManager) {
  var locale = 'en',  listeners = [];
	  
  function onLocaleChanged(locale) {
    listeners.forEach(function(listener) {
      listener.fn.apply(listener.scope, [locale]);
    });
  }
	
  var Locale = 
	  /** @lends sap.viz.Locale */
	{		/**
		       * @constructs
		       */
		      constructor : function(){
		        return;
		      },
		      
		      /**
		       * 
		       * @param {String}
		       * 			locale
		       * 
		       * @returns {Object} {@link sap.viz.Locale}
		       */
		      locale : function(loc){
		    	  if(!arguments.length){
		    		  return locale;
		    	  }
		    	  locale = loc;
		    	  onLocaleChanged(locale);
		    	  return Locale;
		      },
		      
		      /**
		       * Add a listener which will be executed when current language is changed.
		       * 
		       * @param {Object}
		       *          listener
		       * @param {Function}
		       *          listener.fn the listener function
		       * @param {Object}
		       *          listener.scope the "this" object in the listener function
		       * 
		       * @returns {Object} {@link sap.viz.Locale}
		       */
		      addListener : function(listener) {
		          listeners.push(listener);
		          return Locale;
		       },
		       
		       /**
		        * Remove the listener.
		        * 
		        * @param {Object} listener
		        *          the listener reference
		        * 
		        * @returns {Object} {@link sap.viz.Locale}
		        */
		       removeListener : function(listener) {
		         var index = listeners.indexOf(listener);
		         if (index != -1)
		           listeners.splice(index, 1);
		         return Locale;
		       }
	};
	
	return Locale;
});