sap.riv.module(
{
  qname : 'sap.viz.manifest',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils, FunctionUtils, ObjectUtils) {
  /**
   * <pre>
   * Manifest is an internal collection to store all definitions/configurations.
   * There are three built-in categories:
   *      feeds: store definitions of all feed groups
   *      module: store definitions of all modules
   *      viz: store definitions of all charts
   * </pre>
   * @module sap.viz.manifest
   * @example
   * 
   * var Manifest = sap.viz.manifest;
   * @ignore
   */

  var manifest = {};
  /**
   * <pre>
   * register a new category in manifest.
   * Once a category is registered, you can access it by Manifest[name] or Manifest.name
   * </pre>
   * @method sap.viz.manifest#registerCategory
   * @param {String}name name of the new category
   * @param {Function} factory optional and if provided,it will become "item factory function" of this category
   * @param {Object} factoryThisObj optional and if provided, it will become the object executed by item factory function
   * @returns {[Object] category} the new category {link sap.viz.manifest.xxxcategory} 
   * @example
   * manifest.registerCategory("feeds", function(obj) {
   *
   * var feeds = {};
   *  obj.feeds.forEach(function(o) {
   *    feeds[o.id] = o;
   *  });
   *
   * Object.defineProperty(obj, "feedsMap", {
   *    value : feeds,
   *    writable : false,
   *    enumerable : false,
   *    configurable : false
   *  });
   *
   *  return obj;
   * });
   * @ignore
   */
  manifest.registerCategory = function(name, factory, factoryThisObj) {
    if (!TypeUtils.isNonEmptyString(name)) {
      FunctionUtils.error("The category name must be a non-empty string.");
    }

    if (factory && !TypeUtils.isFunction(factory)) {
      FunctionUtils.error("The category factory must be a function.");
    }

    if (manifest.hasOwnProperty(name)) {
      FunctionUtils.error("There is already a category named \"{0}\"", name);
    }

    var collection = d3.map();
    /**
     * xxx represents feeds, module and viz. The three categories have been registered into manifest and could provide some common APIs. 
     * @class sap.viz.manifest.xxx
     * @ignore
     */
    var category = {
        /**
           * Load an item from category by id.</br>
           * </br>
           * If the item is a Built-in_Manifest_Objects, it will provide some other APIs.Please see the corresponding object in Built-in_Manifest_Objects.</br>
           * @see Built-in_Manifest_Objects
           * @method sap.viz.manifest.xxx#get
           * @param {String} id the id of item
           * @param {Object} throwErrorIfNull optional, a exception type
           * @returns {Object} the item loaded from category by id
           * @example
           * 
           * var moduleFeeds =  manifest.feeds.get(id);//xxx represents feeds
           * var barModule = manifest.module.get(barId);//xxx represents module
           * var lineChart = manifest.viz.get(lineChartId);//xxx represents viz
           * @ignore
           */
      get : function(id, throwErrorIfNull) {
        var result = collection.get(id);
        if (result === undefined && throwErrorIfNull) {
          FunctionUtils.error("Cannot find \"{0}\" in category \"{1}\"", id,
              name);
        }
        return result;
      },
      /**
       * <pre>
       * Iterate whole category execute callback function for every item which has been registered into xxx. 
       * </pre>
       * @method sap.viz.manifest.xxx#each
       * @param {Function} callback a callback function will be executed for every item.This function must accept two parameters.The first one is an object and the second one is the id.
       * @param {Object} thisObj optional and default value is obj self
       * @return {Object} manifest
       * @example
       * 
       * manifest.xxx.each(function(obj, id){
       *   .... 
       * });
       * @ignore
       */
      each : function(callback, thisObj) {
        collection.forEach(function(id, obj) {
          callback.call(thisObj, obj, id);
        });
        return manifest;
      },
      
      /**
       * unregister the item with specified id from category
       * @method sap.viz.manifest.xxx#unregister
       * @param {String} id id of the item being unregistered
       * @return {Object} the removed module Object
       * @example
       * manifest.module.unregister('sap.viz.modules.bar');
       * @ignore
       */
      unregister : function (id) {
        var ret;
        if(TypeUtils.isExist(id)){
          ret = collection.get(id);
          collection.remove(id);
        }
        return ret;
      },
      
      /**
       * Register an item into category
       * @method sap.viz.manifest.xxx#register 
       * @param {Object} newItems variable parameters, at least need one item to be registered into category
       * @return {Object} manifest
       * @example
       * 
       * manifest.viz.register(chartOne);//xxx represents viz
       * ....
       * manifest.viz.register(chartOne,chartTwo,chartThree);
       * ....
       * manifest.module.register(tooltip);//xxx represents module
       * @ignore
       */
      register : function() {
        Array.prototype.forEach.call(arguments, function(obj) {
          if (TypeUtils.isUndefined(obj)) {
            FunctionUtils.error("Cannot register a undefined object.");
          }

          var idStr = obj.id;

          if (!TypeUtils.isNonEmptyString(idStr)) {
            FunctionUtils.error("Cannot register without a valid id.");
          }

          if (collection.has(idStr)) {
            FunctionUtils.error(
                "There is already an item named \"{0}\" in category \"{1}\".",
                idStr, name);
          }

          var isAbstract = obj["abstract"] === true;
          obj = ObjectUtils
              .extend(true, null, obj.base !== undefined ? category.get(
                  obj.base, true) : null, obj);

          Object.defineProperty(obj, "abstract", {
            value : isAbstract,
            enumerable : false
          });

          if (factory && !isAbstract) {
            factory.call(factoryThisObj, obj, manifest);
          }

          collection.set(idStr, obj);
        });

        return manifest;
      }
    };

    manifest[name] = category;
    return category;
  };
  
  /**
   * unregister category with the specified category name
   * @param {String} cname name of the category to be unregistered
   * @returns {Boolean} true if successfully deleted 
   * @ignore
   */
  manifest.unregisterCategory = function (cname){
    return cname in manifest && delete manifest[cname];
  };
  
  /**
   * {@link sap.viz.manifest.feeds} is a category which have been registered into manifest. It could provide some common APIs. 
   * @class sap.viz.manifest.feeds
   */
  /**
  * Load an item from {@link sap.viz.manifest.feeds}  by id.</br>
  * </br>
  * The item loaded from {@link sap.viz.manifest.feeds} will provide some API.</br>
  * @method sap.viz.manifest.feeds#get
  * @param {String} id the id of item
  * @param {Object} throwErrorIfNull optional, a exception type
    * @returns {Object} {@link Built-in_Manifest_Objects.feedsManifest}
  * @example
  * 
  * var moduleFeeds =  manifest.feeds.get(id);
  */
  /**
  * 
    * Iterate whole {@link sap.viz.manifest.feeds} category execute callback function for every item which has been registered into {@link sap.viz.manifest.feeds}. 
  * 
  * @method sap.viz.manifest.feeds#each
  * @param {Function} callback a callback function will be executed for every item.This function must accept two parameters.The first one is an object and the second one is the id.
  * @param {Object} thisObj optional and default value is obj self
  * @return {Object} {@link sap.viz.manifest.feeds}
  * @example
  * 
  * manifest.feeds.each(function(obj, id){
  *   .... 
  * });
  */
  /**
   * Register an item into {@link sap.viz.manifest.feeds} category
   * @method sap.viz.manifest.feeds#register 
   * @param {Object} newItems variable parameters, at least need one item to be registered into category
   * @return {Object} {@link sap.viz.manifest.feeds}
   * @example
   * 
   * manifest.feeds.register(chartOneFeeds);
   * manifest.feeds.register(chartTwoFeeds,chartThreeFeeds);
   */
  
  /**
   * unregister an item from {@link sap.viz.manifest.feeds} category
   * @method sap.viz.manifest.feeds#unregister 
   * @param {String} id id of the feed being unregistered
   * @return {Object} the removed feed object {@link sap.viz.manifest.feeds}
   * @example
   * 
   * manifest.feeds.unregister('CHART_FEED_ID');
   */

   /**
   * {@link sap.viz.manifest.viz} is a category which have been registered into manifest. It could provide some common APIs. 
   * @class sap.viz.manifest.viz
   */
  /**
  * Load an item from {@link sap.viz.manifest.viz}  by id.</br>
  * </br>
  * The item loaded from {@link sap.viz.manifest.viz} will provide some API.</br>
  * @method sap.viz.manifest.viz#get
  * @param {String} id the id of item
  * @param {Object} throwErrorIfNull optional, a exception type
    * @returns {Object} {@link Built-in_Manifest_Objects.vizManifest}
  * @example
  * 
  * var lineChart =  manifest.viz.get(lineChartId);
  */
  /**
  * 
    * Iterate whole {@link sap.viz.manifest.viz} category execute callback function for every item which has been registered into {@link sap.viz.manifest.viz}. 
  * 
  * @method sap.viz.manifest.viz#each
  * @param {Function} callback a callback function will be executed for every item.This function must accept two parameters.The first one is an object and the second one is the id.
  * @param {Object} thisObj optional and default value is obj self
  * @return {Object} {@link sap.viz.manifest.viz}
  * @example
  * 
  * manifest.viz.each(function(obj, id){
  *   .... 
  * });
  */
  /**
   * Register an item into {@link sap.viz.manifest.viz} category
   * @method sap.viz.manifest.viz#register 
   * @param {Object} newItems variable parameters, at least need one item to be registered into category
   * @return {Object} {@link sap.viz.manifest.viz}
   * @example
   * 
   * manifest.viz.register(lineChart);
   * manifest.viz.register(pieChart,radarChart);
   */
  
  /**
   * unregister an item from {@link sap.viz.manifest.viz} category
   * @method sap.viz.manifest.viz#unregister 
   * @param {String} id id of the viz being unregistered
   * @return {Object} the removed viz object {@link sap.viz.manifest.viz}
   * @example
   * 
   * manifest.viz.unregister('viz/bar');
   */

   /**
   * {@link sap.viz.manifest.module} is a category which have been registered into manifest. It could provide some common APIs. 
   * @class sap.viz.manifest.module
   */
  /**
  * Load an item from {@link sap.viz.manifest.module}  by id.</br>
  * </br>
  * The item loaded from {@link sap.viz.manifest.module} will provide some API.</br>
  * @method sap.viz.manifest.module#get
  * @param {String} id the id of item
  * @param {Object} throwErrorIfNull optional, a exception type
    * @returns {Object} {@link Built-in_Manifest_Objects.moduleManifest}
  * @example
  * 
  * var lineModule =  manifest.viz.get(lineModuleId);
  */
  /**
  * 
    * Iterate whole {@link sap.viz.manifest.module} category execute callback function for every item which has been registered into {@link sap.viz.manifest.module}. 
  * 
  * @method sap.viz.manifest.module#each
  * @param {Function} callback a callback function will be executed for every item.This function must accept two parameters.The first one is an object and the second one is the id.
  * @param {Object} thisObj optional and default value is obj self
  * @return {Object} {@link sap.viz.manifest.module}
  * @example
  * 
  * manifest.module.each(function(obj, id){
  *   .... 
  * });
  */
  /**
   * Register an item into {@link sap.viz.manifest.module} category
   * @method sap.viz.manifest.module#register 
   * @param {Object} newItems variable parameters, at least need one item to be registered into category
   * @return {Object} {@link sap.viz.manifest.module}
   * @example
   * 
   * manifest.module.register(lineModule);
   * manifest.module.register(pieModule,radarModule);
   */

  /**
   * unregister an item from {@link sap.viz.manifest.module} category
   * @method sap.viz.manifest.module#unregister 
   * @param {String} id id of the module being unregistered
   * @return {Object} the removed module object {@link sap.viz.manifest.module}
   * @example
   * 
   * manifest.module.unregister('sap.viz.modules.bar');
   */
  return manifest;
});