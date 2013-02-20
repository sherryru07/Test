sap.riv.module(
{
  qname : 'sap.viz.feeds.HeatMap',
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
  var mainLabelAxisFeed = {
      'id' : 'mainLabelAxis',
      'name' : 'Main Category Axis',
      'type' : constants.Type.Dimension,
      'min' : 1,
      'max' : 1,
      'aaIndex' : 1,
       'acceptMND': -1
    };

    var rectangleColorFeed = {
      'id' : 'rectangleColor',
      'name' : 'Rectangle Color',
      'type' : constants.Type.Measure,
      'min' : 1,
      'max' : 1,
      'mgIndex' : 1
    };

    var secondLabelAxisFeed = {
      'id' : 'secondaryLabelAxis',
      'name' : 'Secondary Category Axis',
      'type' : constants.Type.Dimension,
      'min' : 0,
      'max' : 1,
      'aaIndex' : 2,
       'acceptMND': -1
    };
  var feeds = {
    id : "heatMap",
    feeds : [ mainLabelAxisFeed, rectangleColorFeed, secondLabelAxisFeed ]
  };
  Manifest.register(feeds);
});