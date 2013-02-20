sap.riv.module(
{
  qname : 'sap.viz.TemplateManager',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.parseCSS',
  version : '4.0.0'
}
],
function Setup(manifest, FunctionUtils, TypeUtils, ObjectUtils, parseCSS) {

  function loadResource(url, cb, onError) {
    var head = document.getElementsByTagName("head")[0] ||
        document.documentElement;
    var script = document.createElement("script");
    script.type = 'text/javascript';
    script.src = url;

    var done = false;
    script.onload = script.onreadystatechange = function() {
      if (!done &&
          (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        done = true;
        cleanScript(script);
        cb();
      }
    };
    if (script.addEventListener) {
      script.addEventListener('error', function() {
        cleanScript(script);
        onError();
      }, true);
    }

    head.insertBefore(script, head.firstChild);
  }

  function loadTemplate(loadPaths, index, templateId, cb, onError) {
    if (index < loadPaths.length) {
      var url = loadPaths[index] + templateId + '/template.js';
      var done = function() {
        loadTemplate(loadPaths, index + 1, templateId, cb, onError);
      };
      loadResource(url, done, done);
    } else {
      var template = get(templateId);
      if (template) {
        cb(template);
      } else {
        onError();
      }
    }
  }

  function load(templateId, cb) {
    loadTemplate(manager.loadPath, 0, templateId, cb, function() {
      FunctionUtils.error('Loading template {0} failed.', templateId);
    });
  }

  function cleanScript(script) {
    script.onload = script.onreadystatechange = null;
    script.parentNode.removeChild(script);
  }

  var templateCategory = manifest.registerCategory("template", function(obj) {
    obj.css = parseCSS(obj.css);
    Object.defineProperties(obj, {
      props : {
        value : function(vizId) {
          var properties = obj.properties;
          if (properties) {
            return properties[vizId];
          }
        }
      }
    });
    return obj;
  });

  var current;

  function get(id) {
    return templateCategory.get(id);
  }

  function onTemplateChanged(template, cb, thisObj) {
    current = template;
    if (cb) {
      cb.call(thisObj, current);
    }
  }

  var defaultTemplateId = "default", defaultTemplate = {
    id : defaultTemplateId,
    name : "Default"
  };
  var manager =
  /** @lends sap.viz.TemplateManager */
  {
    /**
     * @constructs
     */
    constructor : function() {
      return;
    },
    /**
     * The file paths of templates folder. {@link sap.viz.TemplateManager} will
     * discover available templates in this folder.
     * 
     * @default ["../../../resources/templates/"]
     */
    loadPath : [ "../../../resources/templates/" ],
    /**
     * Return current applied template.
     * 
     * @returns {Object} the manifest of template
     */
    current : function() {
      return current;
    },
    /**
     * Apply(switch) a template.
     * 
     * @param {String}
     *          id the template id
     * @param {Function}
     *          [cb] the call back function. It will be executed after template
     *          is applied successfully with current template as parameter. *
     * @param {Object}
     *          [thisObj] "this" object during calling call beck function.
     * 
     * @returns {Object} {@link sap.viz.TemplateManager}
     */
    apply : function(id, cb, thisObj) {
      var template = get(id);
      if (!template) {
        load(id, function(template) {
          onTemplateChanged(template, cb, thisObj);
        });
      } else {
        onTemplateChanged(template, cb, thisObj);
      }

      return manager;
    },
    /**
     * Register new templates.
     * 
     * @param {Object...}
     *          templates the template descriptors(may be multiple).
     * 
     * @returns {Object} {@link sap.viz.TemplateManager}
     */
    register : function() {
      templateCategory.register.apply(templateCategory, arguments);
      return manager;
    },
    /**
     * Extend/modify an existing template.
     * 
     * @param {String}
     *          id the template id
     * @param {Object}
     *          obj the extended part.
     * 
     * @returns {Object} {@link sap.viz.TemplateManager}
     */
    extend : function(id, obj) {
      var template = templateCategory.get(id, true);
      ObjectUtils.extend(true, template, obj);
      return manager;
    }
  };

  delete manager.constructor;

  var apiProp = {
    writable : false,
    configurable : false
  };
  Object.defineProperties(manager, {
    loadPath : {
      configurable : false
    },
    current : apiProp,
    apply : apiProp,
    register : apiProp
  });

  manager.register(defaultTemplate);
  current = get(defaultTemplateId);
  return manager;
});