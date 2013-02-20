sap.riv.module(
{
  qname : 'sap.viz.base.Logger',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(FncUtils) {
    var noop = FncUtils.noop;
    // var noop = function() {
    // };
    Date.now = Date.now ||
    function() {
        return +new Date();
    };

    var dispatcherIdleCounter = 0;

    function callAppender(appender) {
        var logTime, logLevel, logCate, logMsg, appenderLevel;

        if(logBuffer[0].length > 0) {
            if(appender) {
                appenderLevel = appender.getLevel();
                for(var i = 0, bl = logBuffer[0].length; i < bl; i++) {
                    logTime = logBuffer[0][i];
                    logLevel = logBuffer[1][i];
                    logCate = logBuffer[2][i];
                    logMsg = logBuffer[3][i];
                    if(logBuffer[1][i] >= appenderLevel)
                        appender.doAppend(logTime, logLevel, logCate, logMsg);
                }
                return;
            }

            //call all appenders
            //var appender;
            var appenderLevelMap = {};
            for(var appenderKey in appenders) {
                if(appenders.hasOwnProperty(appenderKey)) {
                    appenderLevelMap[appenderKey] = appenders[appenderKey].getLevel();
                }
            }
            while(logBuffer[0].length) {
                logTime = logBuffer[0].shift();
                logLevel = logBuffer[1].shift();
                logCate = logBuffer[2].shift();
                logMsg = logBuffer[3].shift();
                for(appenderKey in appenders) {
                    if(appenders.hasOwnProperty(appenderKey)) {
                        appender = appenders[appenderKey];
                        if(logLevel >= appenderLevelMap[appenderKey])
                            appender.doAppend(logTime, logLevel, logCate, logMsg);
                    }
                }
            }
            return;
        } else if(++dispatcherIdleCounter === 3)
            //pause on third time loop an empty Buffer
            pause();
    }

    function dispatcher() {
        callAppender();
        if(!paused)
            setTimeout(function() {
                dispatcher();
            }, 100);
    }

    var ConsoleAppender = function() {
        this.threshold = Logger.LEVEL.INFO;
        this.layout = new Logger.DefaultLayout();
        this.print = typeof console !== undefined ? function(msg) {
            console.log(msg);
        } : noop;
    };
    ConsoleAppender.prototype = {
        doAppend : function(logTime, logLevel, logCate, logMsg) {
            this.print(this.layout.format(logTime, logLevel, logCate, logMsg));
        },
        setLayout : function(layout) {
            layout.format && (this.layout = layout);
        },
        getLevel : function() {
            return this.threshold;
        },
        setLevel : function(level) {
            this.threshold = level;
        }
    };
    var DefaultLayout = function() {
        // this.df = Logger.dateFormatter;
    };
    DefaultLayout.prototype.format = function(logTime, logLevel, logCate, logMsg) {
        return "[" + logTime + "]" + "[" + getLevelStr(logLevel) + "]" + "[" + (logCate || "main") + "]-" + logMsg;
    };
    var DivAppender = function(div) {
        if(!$) {
            throw "need jQuery";
        }
        this.threshold = Logger.LEVEL.INFO;
        this.divSl = $(div);
        this.layout = new HTMLLayout();
    };
    DivAppender.prototype = {
        getLevel : function() {
            return this.threshold;
        },
        setLevel : function(level) {
            this.threshold = level;
        },
        doAppend : function(logTime, logLevel, logCate, logMsg) {
            this.divSl.append(this.layout.format(logTime, logLevel, logCate, logMsg));
        }
    };
    var HTMLLayout = function() {
        // this.df = Logger.dateFormatter;
    };
    HTMLLayout.prototype = {
        getStyle : function(logLevel) {
            var style;
            if(logLevel === Logger.LEVEL.ERROR) {
                style = 'color:red';
            } else if(logLevel === Logger.LEVEL.WARN) {
                style = 'color:orange';
            } else if(logLevel === Logger.LEVEL.DEBUG) {
                style = 'color:green';
            } else if(logLevel === Logger.LEVEL.TRACE) {
                style = 'color:green';
            } else if(logLevel === Logger.LEVEL.INFO) {
                style = 'color:grey';
            } else {
                style = 'color:yellow';
            }
            return style;
        },
        format : function(logTime, logLevel, logCate, logMsg) {
            return "<div style=\"" + this.getStyle(logLevel) + "\">[" + logTime + "]" + "[" + getLevelStr(logLevel) + "][" + (logCate || "main") + "]-" + logMsg + "</div>";
        }
    };
    var FifoBuffer = function() {
        this.array = [];
    };

    FifoBuffer.prototype = {

        /**
         * @param {Object} obj any object added to buffer
         */
        push : function(obj) {
            this.array[this.array.length] = obj;
            return this.array.length;
        },
        /**
         * @return first putted in Object
         */
        pull : function() {
            if(this.array.length > 0) {
                var firstItem = this.array[0];
                for(var i = 0; i < this.array.length - 1; i++) {
                    this.array[i] = this.array[i + 1];
                }
                this.array.length = this.array.length - 1;
                return firstItem;
            }
            return null;
        },
        length : function() {
            return this.array.length;
        }
    };
    var AjaxAppender = function(url) {
        this.loggingUrl = url;
        this.isInProgress = false;
        this.threshold = Logger.LEVEL.INFO;
        this.bufferSize = 20;
        this.timeout = 2000;
        this.loggingEventMap = [];
        this.layout = new Logger.JSONLayout();
        this.httpRequest = null;
        this.timer = undefined;
    };
    function tryAppend() {
        var appender = this;
        if(this.isInProgress === true) {
            setTimeout(function() {
                tryAppend.call(appender);
            }, 100);
        }else{
            this.send();
        }
    }


    AjaxAppender.prototype = {
        getLevel : function() {
            return this.threshold;
        },
        setLevel : function(level) {
            this.threshold = level;
        },
        doAppend : function(logTime, logLevel, logCate, logMsg) {
            this.loggingEventMap.push([logTime, logLevel, logCate, logMsg]);
            if(this.loggingEventMap.length <= this.bufferSize || this.isInProgress === true) {
                var appender = this;
                if(this.timer === undefined) {
                    this.timer = setTimeout(function() {
                        tryAppend.call(appender);
                    }, 100);
                }
            }

            if(this.loggingEventMap.length >= this.bufferSize && this.isInProgress === false) {
                //if bufferSize is reached send the events and reset current bufferSize
                if(this.timer !== undefined)
                    clearTimeout(this.timer);
                this.send();
            }
        },
        send : function() {
            if(this.loggingEventMap.length > 0) {
                this.isInProgress = true;
                var a = [];
                var loggingEvent;
                for(var i = 0, lml = this.loggingEventMap.length; i < lml && i < this.bufferSize; i++) {
                    loggingEvent = this.loggingEventMap.shift();
                    a.push(this.layout.format(loggingEvent[0], loggingEvent[1], loggingEvent[2], loggingEvent[3]));
                }

                var content = this.layout.getHeader();
                content += a.join(this.layout.getSeparator());
                content += this.layout.getFooter();

                var appender = this;
                if(this.httpRequest === null) {
                    this.httpRequest = this.getXmlHttpRequest();
                }
                this.httpRequest.onreadystatechange = function() {
                    appender.onReadyStateChanged.call(appender);
                };

                this.httpRequest.open("POST", this.loggingUrl, true);
                // set the request headers.
                this.httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                this.httpRequest.setRequestHeader("Content-length", content.length);
                //this.httpRequest.setRequestHeader("Content-type", this.layout.getContentType());
                this.httpRequest.send(content);
                appender = this;

                try {
                    setTimeout(function() {
                        appender.httpRequest.onreadystatechange = function() {
                        };
                        appender.httpRequest.abort();
                        //this.httpRequest = null;
                        appender.isInProgress = false;

                        if(appender.loggingEventMap.length > 0) {
                            appender.send();
                        }
                    }, this.timeout);
                } catch (e) {
                }
            }
        },
        onReadyStateChanged : function() {
            var req = this.httpRequest;
            if(this.httpRequest.readyState !== 4) {
                return;
            }

            var success = (( typeof req.status === "undefined") || req.status === 0 || (req.status >= 200 && req.status < 300));

            if(success) {

                //ready sending data
                this.isInProgress = false;

            } else {
            }
        },
        getXmlHttpRequest : function() {

            var httpRequest = false;

            try {
                if(window.XMLHttpRequest) {// Mozilla, Safari, IE7...
                    httpRequest = new XMLHttpRequest();
                    if(httpRequest.overrideMimeType) {
                        httpRequest.overrideMimeType(this.layout.getContentType());
                    }
                } else if(window.ActiveXObject) {// IE
                    try {
                        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (e) {
                        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                }
            } catch (e) {
                httpRequest = false;
            }

            if(!httpRequest) {
                throw "browser don't support AJAX";
            }

            return httpRequest;
        }
    };
    var JSONLayout = function() {

    };
    JSONLayout.prototype = {
        /**
         * Implement this method to create your own layout format.
         * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
         * @return formatted String
         * @type String
         */
        format : function(logTime, logLevel, logCate, logMsg) {

            var jsonString = "{\n \"LoggingEvent\": {\n";
            jsonString += "\t\"category\": \"" + (logCate || "main") + "\",\n";
            jsonString += "\t\"level\": \"" + getLevelStr(logLevel) + "\",\n";
            jsonString += "\t\"message\": \"" + logMsg + "\",\n";
            // jsonString += "\t\"referer\": \"" + referer + "\",\n";
            // jsonString += "\t\"useragent\": \"" + useragent + "\",\n";
            jsonString += "\t\"timestamp\": \"" + logTime + "\"\n";
            jsonString += "}\n}";

            return jsonString;
        },
        /**
         * Returns the content type output by this layout.
         * @return The base class returns "text/xml".
         * @type String
         */
        getContentType : function() {
            return "text/json";
        },
        /**
         * @return Returns the header for the layout format. The base class returns null.
         * @type String
         */
        getHeader : function() {
            var useragent = "unknown";
            try {
                useragent = navigator.userAgent;
            } catch(e) {
                useragent = "unknown";
            }

            var referer = "unknown";
            try {
                referer = location.href;
            } catch(e) {
                referer = "unknown";
            }
            return "{" + "\"ClientInfo\" : {\n" + "\t\"useragent\": \"" + useragent + "\",\n" + "\t\"referer\": \"" + referer + "\"\n},\n" + "\"VizLogger\": [\n";
        },
        /**
         * @return Returns the footer for the layout format. The base class returns null.
         * @type String
         */
        getFooter : function() {
            return "\n]}";
        },
        getSeparator : function() {
            return ",\n";
        }
    };

    /**
     * Get the XMLHttpRequest object independent of browser.
     * @private
     */
    var XMLLayout = function() {
        // this.df = Logger.dateFormatter;
    };
    XMLLayout.prototype = {
        format : function(logTime, logLevel, logCate, logMsg) {

            var content = "<vizLogger:event category=\"";
            content += (logCate || "main") + "\" level=\"";
            content += getLevelStr(logLevel) + "\" timestamp=\"";
            content += logTime + "\">\n";
            content += "\t<vizLogger:message><![CDATA[" + this.escapeCdata(logMsg) + "]]></vizLogger:message>\n";
            content += "</vizLogger:event>";

            return content;
        },
        /**
         * Returns the content type output by this layout.
         * @return The base class returns "text/xml".
         * @type String
         */
        getContentType : function() {
            return "text/xml";
        },
        /**
         * @return Returns the header for the layout format. The base class returns null.
         * @type String
         */
        getHeader : function() {
            var useragent = "unknown";
            try {
                useragent = navigator.userAgent;
            } catch(e) {
                useragent = "unknown";
            }

            var referer = "unknown";
            try {
                referer = location.href;
            } catch(e) {
                referer = "unknown";
            }
            return "<vizLogger:eventSet useragent=\"" + useragent + "\" referer=\"" + referer.replace(/&/g, "&amp;") + "\">\n";
        },
        /**
         * @return Returns the footer for the layout format. The base class returns null.
         * @type String
         */
        getFooter : function() {
            return "</vizLogger:eventSet>\n";
        },
        getSeparator : function() {
            return "\n";
        },
        /**
         * Escape Cdata messages
         * @param str {String} message to escape
         * @return {String} the escaped message
         * @private
         */
        escapeCdata : function(str) {
            return str.replace(/\]\]>/, "]]>]]&gt;<![CDATA[");
        }
    };

    function getLevelStr(levelInt) {
        switch(levelInt) {
            case Logger.LEVEL.TRACE:
                return "TRACE";
            case Logger.LEVEL.DEBUG:
                return "DEBUG";
            case Logger.LEVEL.INFO:
                return "INFO";
            case Logger.LEVEL.WARN:
                return "WARN";
            case Logger.LEVEL.ERROR:
                return "ERROR";
        }
    }

    var enabled = false;
    var paused = false;
    var logBuffer = [[/*logTime*/], [/*level*/], [/*category*/], [/*message*/]];
    var MaxBufferSize = 2000;
    var doLog = function(level, category, message) {
        if(logBuffer[0].length === MaxBufferSize)
            callAppender();
        logBuffer[0].push(Date.now());
        logBuffer[1].push(level);
        logBuffer[2].push(category);
        logBuffer[3].push(message.toString());
    };
    var awakeThenLog = function(level, category, message) {
        resume();
        doLog(level, category, message);
    };
    var log = noop;
    var pause = function() {
        paused = true;
        log = awakeThenLog;
    };
    var resume = function() {
        paused = false;
        log = doLog;
        setTimeout(function() {
            dispatcher();
        }, 100);
    };
    // id for appender
    var id = 0;
    var nextId = function() {
        return id++;
    };
    var appenders = {};
    /*
     * singleton Logger
     *
     */
    var Logger = {
        LEVEL : {
            TRACE : 5000,
            DEBUG : 10000,
            INFO : 20000,
            WARN : 30000,
            ERROR : 40000,
            NO : Number.MAX_VALUE
        },
        isEnabled : function() {
            return enabled;
        },
        enable : function() {
            log = doLog;
            enabled = true;
            setTimeout(function() {
                dispatcher();
            }, 100);
        },
        disable : function() {
            callAppender();
            log = noop;
            enabled = false;
        },
        toggleEnable : function() {
            if(enabled)
                this.disable();
            else
                this.enable();
        },
        addAppender : function(/*[key,] appender*/) {
            var _nextId = nextId();
            var key, appender;
            if(arguments.length === 1) {
                key = _nextId;
                appender = arguments[0];
            } else if(arguments.length >= 2) {
                key = arguments[0];
                appender = arguments[1];
            }
            if( typeof appender === "object" && appender.doAppend) {
                if(appenders[key] !== undefined)
                    return;
                callAppender();
                appenders[key] = appender;
                return key;
            }

        },
        setAppenders : function(apds) {
            appenders = [];
            for(var i = 0, l = apds.length; i < l; i++) {
                var appender = apds[i];
                if(appender.appenderKey)
                    this.addAppender(appender.appenderKey, appender.appender);
                else
                    this.addAppender(appender.appender);
            }
        },
        removeAppender : function(key) {
            if(appenders[key] === undefined)
                return false;
            //append immediately before remove
            callAppender(appenders[key]);
            return (
            delete appenders[key]);
        },
        getAppender : function(key) {
            return appenders[key];
        },
        ConsoleAppender : ConsoleAppender,
        DivAppender : DivAppender,
        AjaxAppender : AjaxAppender,
        //[time][level][category]-message [yyyy-MM-ddThh:mm:ss:ms][INFO][function1]-this is a piece of log.
        DefaultLayout : DefaultLayout,
        HTMLLayout : HTMLLayout,
        XMLLayout : XMLLayout,
        JSONLayout : JSONLayout,
        trace : function(message, category) {
            log(Logger.LEVEL.TRACE, category, message);
        },
        debug : function(message, category) {
            log(Logger.LEVEL.DEBUG, category, message);
        },
        info : function(message, category) {
            log(Logger.LEVEL.INFO, category, message);
        },
        warn : function(message, category) {
            log(Logger.LEVEL.WARN, category, message);
        },
        error : function(message, category) {
            log(Logger.LEVEL.ERROR, category, message);
        }
    };
    appenders["[default]"] = new Logger.ConsoleAppender();
    return Logger;
});