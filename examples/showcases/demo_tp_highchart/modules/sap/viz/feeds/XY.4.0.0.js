sap.riv.module(
{
  qname : 'sap.viz.feeds.XY',
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
  var colorFeed = {
    'id' : 'regionColor',
    'name' : 'IDS_REGIONCOLOR',
    'type' : constants.Type.Dimension,
    'min' : 0,
    'max' : 2,
    'aaIndex' : 2,
    'acceptMND' : 1
  };

  var valueAxis1 = {
    'id' : 'primaryValues',
    'name' : 'IDS_PRIMARYVALUES',
    'type' : constants.Type.Measure,
    'min' : 1,
    'max' : constants.Constraints.INF,
    'mgIndex' : 1
  };

  var valueAxis2 = {
    'id' : 'secondaryValues',
    'name' : 'IDS_SECONDARYVALUES',
    'type' : constants.Type.Measure,
    'min' : 0,
    'max' : constants.Constraints.INF,
    'mgIndex' : 2
  };

  var dimension = {
    'id' : 'axisLabels',
    'name' : 'IDS_AXISLABELS',
    'type' : constants.Type.Dimension,
    'min' : 1,
    'max' : 2,
    'acceptMND' : 0,
    'aaIndex' : 1
  };

  var feeds = {
    id : "xy",
    feeds : [ colorFeed, dimension, valueAxis1, valueAxis2 ]
  };
  Manifest.register(feeds);
});