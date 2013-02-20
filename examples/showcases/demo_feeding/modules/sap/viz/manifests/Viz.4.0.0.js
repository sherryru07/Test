sap.riv.module(
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.Manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
}
],
function Setup(manifest, feedsManifest, ObjectUtils, TypeUtils, Objects, constants, module,
    langManager) {
  function getModuleByType(modules, type) {
    for ( var i = 0; i < modules.length; ++i) {
      if (modules[i].module.type === type) {
        return modules[i];
      }
      if (modules[i].subModules) {
        var r = getModuleByType(modules[i].subModules, type);
        if (r) {
            return r;    
        }
          
      }
    }
    return null;
  }
  function overrideProperties (target, overProps){
    if(!overProps){
      return;
    }
    var tempPropName, tempPropObj;
    for(tempPropName in target){
      if(target.hasOwnProperty(tempPropName) && overProps.hasOwnProperty(tempPropName)){
        tempPropObj = target[tempPropName];
        if(tempPropObj.supportedValueType === 'Object'){
          overrideProperties(tempPropObj.supportedValues, overProps[tempPropName]);
        }else{
          tempPropObj.defaultValue = overProps[tempPropName];
        }
      }
    }
  }
  function filterProperties (target, filterInfo){
    var tempPropName, tempPropObj;
    for(tempPropName in target){
      if(target.hasOwnProperty(tempPropName)){
        if (target[tempPropName] === null){
          delete target[tempPropName];
          continue;
        }
        tempPropObj = target[tempPropName];
        /*[Jimmy/11/15/2012]what if we override supportedValueType in the propertyOverride?
         currently we don't know how to deal with it.
         * */
        if(filterInfo){
          Objects.extend(true, tempPropObj, filterInfo[tempPropName]);
        }
        if(tempPropObj.isExported === false){
          delete target[tempPropName];
        }else{
          if(tempPropObj.supportedValueType === 'Object'){
            filterProperties(tempPropObj.supportedValues, filterInfo ? filterInfo[tempPropName] : null);
            //if its type is object and with no children, we just delete it
            if(TypeUtils.isEmptyObject(tempPropObj.supportedValues)){
              delete target[tempPropName];
            } 
          } 
        }
      }
    }
  }
  function loadProperties(allProperties, modules) {
    if(modules){
      //3 properties we need take care of
      //propertyCategory, properties and propertiesOverride
      var mProps/*original module properties*/, 
          mcProps/*properties defined in chart manifest, aka module reference*/,
          moProps/*properties definition override in chart manifest, aka propertiesOverride*/,
          propCate/*property category*/,
          mRef/*module reference name in chart config*/;
      modules.forEach(function(o){//@Alex Su: configure module if module has one.
        if (o.config.configure){
          mRef = o.moduleRef;
          mProps = o.module.properties;
          mcProps = o.config.configure.properties;
          propCate = o.config.configure.propertyCategory;
          moProps = o.config.configure.propertiesOverride;
          allProperties[propCate] = Objects.extend(true, null, mProps);
          //we add a new meta data info here to indicate the reference path in chart configure of each property category        
          Object.defineProperties(allProperties[propCate], { 
            'moduleRefPath':{            
              get : (function(_refName) {
                return function() {
                  return _refName;
                };
              }(mRef)),
              enumerable : false
            }  
          });
          //filter out isExported=false, it can come from moProps or mProps
          filterProperties(allProperties[propCate], moProps);
          //override default values which come from mcProps
          overrideProperties(allProperties[propCate], mcProps);
        }
        loadProperties(allProperties, o.subModules);
      });
    }
  }

  function loadFeeds(allFeeds, modules, aaIndexOffset, mndProOffset) {
    if (modules) {
      modules.forEach(function(o) {
        var feeds = o.module.feeds;
        var newAAIndexOffset = aaIndexOffset;
        var newMNDProOffset = mndProOffset;
        if (feeds) {
          var moduleFeeds;
          var feedsId = feeds.id;
          if (feedsId !== undefined) {
            var feedsConfigure = feeds.configure;
            moduleFeeds = feedsManifest.get(feedsId).feedsMap;
            if (feedsConfigure) { 
              moduleFeeds = ObjectUtils.extend(true, null, moduleFeeds,
                  feedsConfigure);
              }
          } else {
            moduleFeeds = {};
            feeds.forEach(function(feed) {
              moduleFeeds[feed.id] = feed;
            });
          }
     
          var i;
          for (i in moduleFeeds) {
            if(moduleFeeds.hasOwnProperty(i)){
              var feed = moduleFeeds[i];
              if (feed) {
                feed = ObjectUtils.extend(true, null, feed);
                allFeeds[i] = feed;
                if (feed.type === constants.Feed.Type.Dimension) {
                  var aaIndex = feed.aaIndex;
                  aaIndex += aaIndexOffset;
                  if (newAAIndexOffset < aaIndex) {
                      newAAIndexOffset = aaIndex;
                  }
                   
                  feed.aaIndex = aaIndex;
  
                  var mndPro = feed.acceptMND;
                  if (mndPro >= 0) {
                    if (mndProOffset > 0) {
                      mndPro += mndProOffset;  
                    }
                      
  
                    if (newMNDProOffset < mndPro) {
                      newMNDProOffset = mndPro;
                      }
  
                    feed.acceptMND = mndPro;
                  }
                }
              }
            }
          }
          if (newMNDProOffset >= 0) {
              newMNDProOffset += 1;
          }
            

        }
        loadFeeds(allFeeds, o.subModules, newAAIndexOffset, newMNDProOffset);
      });
    }
  }
  /**
     * This is a instantce , which already have been registered into {@link sap.viz.manifest.viz}.</br>
     * </br>
     * Now, once an item is loaded from {@link sap.viz.manifest.viz}, it will automatically provide some APIs .</br>
     * </br>
     * @example
     * 
     * var allFeedOfBar = manifest.viz.get(barType).allFeeds();
     *
     * @see sap.viz.manifest.viz#get
     * @class Built-in_Manifest_Objects.vizManifest
     */
  return manifest
      .registerCategory(
          "viz",
          function(obj) {
            var modules =[];
            var configModules = obj.modules;
            for ( var moduleRefName in configModules) {
              if(configModules.hasOwnProperty(moduleRefName)){
                var moduleRef = configModules[moduleRefName];
                if (moduleRef !== null) {
                  manifest.module.loadModule(modules, moduleRef, moduleRefName);
                }
              }
            }

            var feedsConfigure = obj.feeds;
            var allFeeds, allRequiredFeeds, vizname = obj.name;
            var allProperties;
            delete obj.name;
            Object
                .defineProperties(
                    obj,
                    {
                      /**
                         * get the feeds definition of an item in {@link sap.viz.manifest.viz}
                         * @method Built-in_Manifest_Objects.vizManifest#allFeeds
                         * @return {[Object] allFeeds} all feeds definition of an item
                         * @example
                         * 
                         * var allFeedOfBar = sap.viz.manifest.viz.get('viz/bar').allFeeds();
                         *
                         */
                      allFeeds : {
                        value : function() {
                          if (!allFeeds) {
                            allFeeds = {};
                            loadFeeds(allFeeds, modules, 0, -1);
                            ObjectUtils.extend(true, allFeeds, feedsConfigure);
                            allFeeds = d3.values(allFeeds).filter(function(o) {
                              return o;
                            });
                          }

                          //Data Handler needs to know full feed definition including useless feed for data dispatching
                          var includeUselessFeed = !arguments.length || arguments[0] === false ? false : true;
                          if (includeUselessFeed === false){
                              if (!allRequiredFeeds){
                                  allRequiredFeeds = d3.values(allFeeds).filter(function(o) {
                                  if (o.min === 0 && o.max === 0){
                                      return false;
                                  }else {
                                      return true;
                                  }
                                  
                                  });
                              }
                              return allRequiredFeeds;
                          }else{
                              return allFeeds;
                          }
       
                        }
                      },
                      /**
                         * get all properties definition of an item in {@link sap.viz.manifest.viz}
                         * @method Built-in_Manifest_Objects.vizManifest#allProperties
                         * @return {[Object] allProperties} all properties definition of an item
                         * @example
                         * 
                         * var allPropertiesOfBarChart = sap.viz.manifest.viz.get('viz/bar').allProperties();
                         *
                         */
                      allProperties : {
                        /*we will go through all modules and merge their property definitions with properties override in chart manifest,
                         and return. note all the properties with isExport=false will be filtered out*/
                        value : function() {
                          if(!allProperties) {
                            allProperties = {};
                            loadProperties(allProperties, modules);
                          }
                          return allProperties;
                        }  
                      },
                      getChartPropCate : {
                        value : function() {
                          return getModuleByType(modules, 'CHART').config.configure.propertyCategory;
                        }
                      },
                      /**
                       * get the name of the visualization
                       * @property {String}  Built-in_Manifest_Objects.vizManifest#name
                       * @example
                       * var name = sap.viz.manifest.viz.get('viz/bar').name
                       */
                      name : {
                        get : function() {
                          var res = langManager.get(vizname);
                          if (res) {
                              return res;
                          }
                           
                          return vizname;
                        },
                        enumerable : true
                      }
                    });
            return obj;
          });
});