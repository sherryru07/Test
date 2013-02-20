sap.riv.module(
{
  qname : 'sap.viz.base.utils.DomWatcher',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.LinkedHashMap',
  version : '4.0.0'
}
],
function Setup(UADetector, LinkedHashMap) {
    var watcherId = 0;
    var domId = 1;
    var nextWatcherId = function() {
        return watcherId++;
    };
    var nextDomId = function() {
        return domId++;
    };
    var isEmpty = function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    };
    var css = function(dom, prop) {
        var val = null;
        if(window.getComputedStyle) {
            val = window.getComputedStyle(dom, null)[prop];
        } else if(dom.currentStyle) {
            val = dom.currentStyle[prop];
        }
        return val;
    };
    var domDataAccessor = function(key, value) {
        if(!this._data)
            this._data = {};
        if(arguments.length === 2) {
            this._data[key] = value;
        } else
            return this._data[key];
    };
    var domTasks = new LinkedHashMap();

    var eventHandler = function(e) {
    	var task;
        var dom = e.srcElement || e.target;
        var domId = domDataAccessor.call(dom, 'domId');
        if(!domId)
            return;
        var domTaskIt = domTasks.get(domId).getIterator();
        while(domTaskIt.hasMore()) {
            task = domTaskIt.nextValue();
            task.checkChange();
        }
    };
    var addEventHandler = function(id) {
        var task = taskQueue.get(id);
        var dom = task.domElem;
        var domId = domDataAccessor.call(dom, 'domId');
        if(!domId) {
            domId = nextDomId();
            domDataAccessor.call(dom, 'domId', domId);
            domTasks.add(domId, new LinkedHashMap());
        }
        domTasks.get(domId).add(task.id, task);
        if(!domDataAccessor.call(dom, 'eventHandler')) {
            if( typeof (dom.onpropertychange) == "object") {
                dom.attachEvent("onpropertychange", eventHandler);
            } else if(UADetector.isFirefox() && parseFloat(UADetector.version()) > 3.6) {
                dom.addEventListener("DOMAttrModified", eventHandler);
            }
            domDataAccessor.call(dom, 'eventHandler', eventHandler);
        }
    };
    var removeFromEventHandler = function(task) {
        var dom = task.domElem;
        var domId = domDataAccessor.call(dom, 'domId');
        if(!domId)
            return;

        if(domTasks.get(domId).has(task.id))
            domTasks.get(domId).remove(task.id);

        if(domTasks.get(domId).isEmpty()) {
            var eventHandler = domDataAccessor.call(dom, 'eventHandler');
            if( typeof (dom.onpropertychange) == "object") {
                dom.detachEvent("onpropertychange", eventHandler);
            } else if(UADetector.isFirefox() && parseFloat(UADetector.version()) > 3.6) {
                dom.removeEventListener("DOMAttrModified", eventHandler);
            }
            domDataAccessor.call(dom, 'eventHandler', null);
        }
    };
    var scannerInstance = undefined;
    var taskQueue = new LinkedHashMap();
    var scanner = function() {
        var taskItr = taskQueue.getIterator();
        var task;
        while(taskItr.hasMore()) {
            task = taskItr.nextValue();
            task.checkChange();
        }
    };
    var addIntervalTask = function(task) {
        if(!scannerInstance)
            scannerInstance = setInterval(scanner, 100);
        if(!taskQueue.has(task.id))
            taskQueue.add(task.id, task);
    };
    var removeIntervalTask = function(id) {
        if(taskQueue.has(id)) {
            taskQueue.remove(id);
        }
        if(taskQueue.isEmpty()) {
            clearInterval(scannerInstance);
            scannerInstance = undefined;
        }
    };
    var hookChange = function(task) {
        var dom = task.domElem;
        if( typeof (dom.onpropertychange) == "object" || (UADetector.isFirefox() && parseFloat(UADetector.version()) > 3.6)) {
            addEventHandler(task.id);
        } else {
            //for browsers not support dom attributes change event, add a iterval task to check properties changes.
            addIntervalTask(task);
        }
    };
    var __watcher = function(id) {
        var task = taskQueue.get(id);
        if(!task)
            return;
        var dom = task.domElem;
        if(!task.callback)
            return;

        var changed = false;
        var i = 0;
        var changedProps = [];
        for(var l = task.cssProps.length; i < l; i++) {
            var newVal = css(dom, task.cssProps[i]);
            if(task.lastestVals[i] != newVal) {
                task.lastestVals[i] = newVal;
                changed = true;
                changedProps.push(task.cssProps[i]);
            }
        }
        if(changed)
            //task.callback.call(caller, changedProps);
            task.callback(changedProps);
    };
    //var caller;
    var DomWatcher = {
        /**
         * watch a dom element on specific css properties, if change, excute callback func,
         * callback parameter is an array of changed properties
         *
         * @param dom element to watch
         * @param props css properties on element to watch, input as a string, properties should be seperated by comma ','
         * @param func function to execute on properties change, when calling DomWatcher.watch,
         *     ObjectUtils.proxy(func, this) is recommend for the callback function. i.e. DomWatcher.watch(dom,props, ObjectUtils.proxy(func, this));
         * @return generated watcher id
         */
        watch : function(dom, props, func) {
            //caller = this.watch.caller;
            var id = nextWatcherId();
            var checkChange = function() {
                __watcher(id);
            };
            var task = {
                id : id,
                domElem : dom,
                cssProps : props.split(","),
                lastestVals : [props.split(",").length],
                callback : func,
                checkChange : checkChange
            };

            for(var i = 0, len = task.cssProps.length; i < len; i++) {
                task.lastestVals[i] = css(dom, task.cssProps[i]);
            }
            if(!taskQueue.has(task.id))
                taskQueue.add(task.id, task);
            hookChange(task);
            return id;
        },
        unwatch : function(id) {
            var task = taskQueue.get(id);
            var dom = task.domElem;
            try {
                if( typeof (dom.onpropertychange) == "object" || (UADetector.isFirefox() && parseFloat(UADetector.version()) > 3.6)) {
                    removeFromEventHandler(task);
                } else
                    removeIntervalTask(task.id);
            }
            // ignore if element was already unbound
            catch (e) {
            }
        }
    };
    return (DomWatcher);
});