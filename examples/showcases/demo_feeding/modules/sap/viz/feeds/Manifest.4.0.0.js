sap.riv.module(
{
  qname : 'sap.viz.feeds.Manifest',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
}
],
function Setup(manifest, ObjectUtils, langManager) {
  /**
   * This is a instantce , which already have been registered into {@link sap.viz.manifest.feeds}.</br>
   * </br>
   * Now, once an item is loaded from {@link sap.viz.manifest.feeds}, it will automatically provide some APIs .</br>
   * </br>
   * @see sap.viz.manifest.feeds#get
   * @class Built-in_Manifest_Objects.feedsManifest
   * @example
   * var pieFeed = manifest.feeds.get(pieId);
   */
  return manifest.registerCategory("feeds", function(obj) {

    var feeds = {};
    obj.feeds.forEach(function(o) {
      feeds[o.id] = o;
      var na = o.name;
      delete o.name;
      Object.defineProperty(o, 'name', {
        get : function() {
          var res = langManager.get(na);
          if (res) {
            return res;
          }
          return na;
        },
        enumerable : true
      });
    });
    /**
     * This is a instantce , which already have been registered into {@link sap.viz.manifest.feeds}.</br>
     * </br>
     * Now, once an item is loaded from {@link sap.viz.manifest.feeds}, it will automatically provide some APIs .</br>
     * </br>
     * @see sap.viz.manifest.feeds#get
     * @class Built-in_Manifest_Objects.feedsManifest
     * @example
     * var pieFeed = manifest.feeds.get(pieId);
     * @ignore
     */
    Object.defineProperty(obj, "feedsMap", {
      value : feeds,
      writable : false,
      enumerable : false,
      configurable : false
    });

    return obj;
  });
});