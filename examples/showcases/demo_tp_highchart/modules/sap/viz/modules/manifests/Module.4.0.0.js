sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.parseCSS',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.Constants',
  version : '4.0.0'
}
],
function Setup(manifest, FunctionUtils, Objects, parseCSS, TypeUtils) {
  var KEEP_DEFINITION = true;
  function loadModule(modules, moduleConfig, moduleRefName) {
    var moduleId = moduleConfig.id;
    if (moduleId === undefined) {
      FunctionUtils.error("Cannot find module id in sub module config \"{0}\"",
          JSON.stringify(moduleConfig));
    }

    var module = manifest.module.get(moduleConfig.id, true);
    modules.push({
      module : module,
      config : moduleConfig,
      moduleRef : moduleRefName,
      subModules : module.subModules(moduleConfig, moduleRefName)
    });
  }

  function exactDefaultProperties(props, keepDefinition) {
    var defaultProps = {}, n, prop;
    for (n in props) {
      if (props.hasOwnProperty(n)) {
        prop = props[n];
        if (prop) {
          if (keepDefinition === true) {
            defaultProps[n] = Objects.extend(true, {}, prop);
          } else {
            defaultProps[n] = prop.supportedValueType === 'Object' ? exactDefaultProperties(
                prop.supportedValues, !KEEP_DEFINITION)
                : prop.defaultValue;
          }
        }
      }
    }
    return defaultProps;
  }
  /**
   * This is a instantce , which already have been registered into
   * {@link sap.viz.manifest.module}.</br> </br> Now, once an item is loaded
   * from {@link sap.viz.manifest.module}, it will automatically provide some
   * APIs .</br> </br>
   * 
   * @example var legend = manifest.module.get(legendID);
   * @see sap.viz.manifest.module#get
   * @class Built-in_Manifest_Objects.moduleManifest
   */
  manifest.registerCategory("module", function(obj) {
    var defaultPropertyValues;
    var allPropertyDefinitions;

    var cssObj = {};
    var css = obj.css;
    for ( var i in css) {
      if (!css.hasOwnProperty(i)) {
        continue;
      }

      cssObj[i] = css[i].value;
    }
    var parsedCSS = parseCSS(cssObj);

    Object.defineProperties(obj, {
      subModules : {
        value : function(moduleConfig, parentRefName) {
          var subModules;
          var subModuleConfigs = Objects.extend(true, {}, moduleConfig.modules, moduleConfig.controllers);
          // TODO: fix those hard code when new layout is cheched in.
          if (!TypeUtils.isEmptyObject(subModuleConfigs)) {
            subModules = [];
            var subModuleConfig;
            for (var key in subModuleConfigs ){
              if (subModuleConfigs.hasOwnProperty(key)){
                subModuleConfig = subModuleConfigs[key];
                if (subModuleConfig) {
                  loadModule(subModules, subModuleConfig, parentRefName + '.' + key);
                }               
              }
            }
          }
          
          return subModules;
        }
      },
      /**
       * return properties of this module with or without definitions,
       * controlled by the parameter. if without definition, only default value
       * is returned for each property.
       * 
       * @method Built-in_Manifest_Objects.moduleManifest#props
       * @param {Boolean}
       *          withDefinition whether include definitions in the return
       *          object. by default false
       * @return {Object} properties of this module
       */
      props : {
        value : function(withDefinition) {
          if (withDefinition === KEEP_DEFINITION) {
            if (!allPropertyDefinitions) {
              allPropertyDefinitions = exactDefaultProperties(obj.properties,
                  KEEP_DEFINITION);
            }
            return allPropertyDefinitions;
          } else {
            if (!defaultPropertyValues) {
              defaultPropertyValues = exactDefaultProperties(obj.properties,
                  !KEEP_DEFINITION);
            }
            return Objects.extend(true, {}, defaultPropertyValues);
          }
        }
      },
      /**
       * execute the fn(function) defined in selected module. The default
       * argument of fn is the module self.</br>
       * 
       * @method Built-in_Manifest_Objects.moduleManifest#execute
       * @return {Object} the result of executing fn
       * @example
       * 
       * var moduleManifest = manifest.module.get(id);//get the item from module's manifest by id
       * var result = moduleManifest.execute();//execute the fn defined in the item
       * 
       */
      execute : {
        value : function(ctx) {
          ctx.styleManager.setDefault(parsedCSS);
          return obj.fn(obj, ctx);
        }
      }
    });
    return obj;
  });

  manifest.module.loadModule = loadModule;

  return manifest.module;
});