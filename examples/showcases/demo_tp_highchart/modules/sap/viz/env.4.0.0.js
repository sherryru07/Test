sap.riv.module(
{
  qname : 'sap.viz.env',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Logger',
  version : '4.0.0'
},
{  qname : 'sap.viz.config',
  version : '4.0.0'
},
{  qname : 'sap.viz.Locale',
  version : '4.0.0'
}
],
function Setup(TypeUtils, LOG,  config, Locale) {
    var _setLogLevel = function(_level) {
        if(TypeUtils.isExist(_level)) {
            LOG.setLevel(_level);
        }
    };
    var _initLogger = function(options) {
        if(!options) {
            return;
        }
            
        if(options.enable) {
            LOG.enable();
        }
           
        if(!options.appenders){
             return;
        }
           
        for(var i = 0, l = options.appenders.length; i < l; i++) {
            var appender = options.appenders[i];
            if(appender.appenderKey) {
                 LOG.addAppender(appender.appenderKey, appender.appender);    
            }
               
            else {
                 LOG.addAppender(appender.appender);
            }
               
        }
        // LOG.addAppender('analyzerAppender', new AnalyzerAppender());
        // LOG.addAppender("ajaxApp", new LOG.AjaxAppender("http://localhost:8800"));
        // LOG.getAppender("ajaxApp").setLevel(LOG.LEVEL.DEBUG);
        //LOG.getAppender("[default]").setLevel(_level);
    };
    
    var _initLocal = function(options, callback){
      Locale.locale(options.locale, callback);
    };
    
    var env =
    /**
     * @lends sap.viz.Environment
     */
    {
        /**
         * @constructs
         */
        constructor : function() {

        },
        /**
         * initialize visualization environment
         * @param {Object}
         *            option {locale:'en_US'}
         *
         */
        initialize : function(option, callback) {
          if (!option) {
              return;  
          }
            _initLogger(option.log);
            if (option.locale){
              _initLocal(option, callback);
            } else {
                   if(callback) {
                       callback.call();
                   }
            }
            config.enableCanvg(option.enableCanvg);
            // _setLogLevel(option.log);
        },
        
        /**
         * @ignore
         * @param enable
         */
        setLoggerEnable : function(enable) {
            if(enable === true) {
                 LOG.enable();
            }
               
            else if(enable === false) {
                 LOG.disable();    
            }
               
        },
        
        /**
         * @ignore
         * @returns TODO: add desc
         */
        addLogAppender : function() {
            if(arguments.length === 1) {
                return LOG.addAppender(arguments[0]);
            }
                
            else if(arguments.length === 2) {
                return LOG.addAppender(arguments[0], arguments[1]);
            }
               
        },
        
        /**
         * @ignore
         * @param key
         * @returns TODO: add desc
         */
        removeLogAppender : function(key) {
            return LOG.removeAppender(key);
        }
    };

    return env;
});