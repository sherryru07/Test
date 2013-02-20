sap.riv.module(
{
  qname : 'sap.viz.feeds.TreeMap',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.feeds.Manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'
}
],
function Setup(Manifest, constants) {
  var rectangleTitleFeed = {
    'id' : 'rectangleTitle',
    'name' : 'Rectangle Title',
    'type' : constants.Type.Dimension,
    'min' : 1,
    'max' : 1,
    'aaIndex' : 1,
    'acceptMND': -1,
    'maxStackedDims' : 6
  };

  var rectangleWeightFeed = {
    'id' : 'rectangleWeight',
    'name' : 'Rectangle Weight',
    'type' : constants.Type.Measure,
    'min' : 1,
    'max' : 1,
    'mgIndex' : 1
  };

  var rectangleColorFeed = {
    'id' : 'rectangleColor',
    'name' : 'Rectangle Color',
    'type' : constants.Type.Measure,
    'min' : 0,
    'max' : 1,
    'mgIndex' : 2
  };
  var feeds = {
    id : "treeMap",
    feeds : [ rectangleTitleFeed, rectangleColorFeed, rectangleWeightFeed ]
  };
  Manifest.register(feeds);
});